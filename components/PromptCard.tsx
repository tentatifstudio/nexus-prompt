import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Star, Lock, Zap, Bookmark, Layers, Sparkles, Copy, Eye } from 'lucide-react';
import { PromptItem } from '../types';
import { useAuth } from '../context/AuthContext';

interface PromptCardProps {
  item: PromptItem;
  onClick: (item: PromptItem) => void;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
}

const PromptCard: React.FC<PromptCardProps> = ({ item, onClick, isSaved = false, onToggleSave }) => {
  const { user } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // 3D Tilt Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  // Holographic Shimmer Logic
  const shimmerX = useTransform(mouseXSpring, [-0.5, 0.5], ["0%", "100%"]);
  const shimmerY = useTransform(mouseYSpring, [-0.5, 0.5], ["0%", "100%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = (mouseX / width) - 0.5;
    const yPct = (mouseY / height) - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  // Only lock if the CONTENT is marked premium AND the user is NOT pro
  const isActuallyLocked = item.isPremium && !user?.is_pro;
  const hasReference = !!item.imageSource;

  const authorName = item.author?.username || 'Creator';
  const authorAvatar = item.author?.avatar_url || `https://ui-avatars.com/api/?name=${authorName}&background=random&color=fff`;

  const rarityColors: Record<string, string> = {
    Common: 'bg-slate-500',
    Rare: 'bg-indigo-600',
    Legendary: 'bg-gradient-to-r from-amber-400 via-rose-500 to-purple-600'
  };

  return (
    <motion.div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="group relative h-full perspective-1000"
    >
      <div className="relative glass-card rounded-[24px] overflow-hidden flex flex-col h-full transform-gpu transition-all duration-500 group-hover:shadow-[0_40px_80px_-15px_rgba(79,70,229,0.3)] bg-white/80 border border-white/60">
        
        {/* Holographic Shimmer Overlay */}
        <motion.div 
          style={{
            background: useTransform(
              [shimmerX, shimmerY],
              ([sx, sy]) => `radial-gradient(circle at ${sx} ${sy}, rgba(255,255,255,0.4) 0%, transparent 60%)`
            ),
          }}
          className="absolute inset-0 z-30 pointer-events-none mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        />

        {/* Creator Header */}
        <div className="p-4 flex items-center justify-between border-b border-slate-100 bg-white/40 z-40">
           <Link 
             to={`/user/${item.user_id}`} 
             onClick={(e) => e.stopPropagation()}
             className="flex items-center gap-2 hover:opacity-80 transition-opacity"
           >
              <div className="w-7 h-7 rounded-full bg-slate-200 overflow-hidden border border-white shadow-sm ring-1 ring-slate-100">
                 <img src={authorAvatar} className="w-full h-full object-cover" alt={authorName} />
              </div>
              <span className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">{authorName}</span>
           </Link>
           <div className="flex items-center gap-3">
              {item.isPremium && (
                 <div className="bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-amber-200">
                    Premium
                 </div>
              )}
              <button onClick={(e) => { e.stopPropagation(); onToggleSave?.(item.id); }} className={`transition-all hover:scale-110 active:scale-90 ${isSaved ? 'text-indigo-600' : 'text-slate-300'}`}>
                 <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} />
              </button>
           </div>
        </div>

        {/* IMAGE AREA */}
        <div 
          className="relative w-full aspect-[4/5] overflow-hidden bg-slate-100 cursor-pointer" 
          onClick={() => onClick(item)}
        >
          {/* Main Content */}
          <motion.img 
            src={item.imageResult} 
            alt={item.title}
            className="absolute inset-0 w-full h-full object-cover"
            animate={{ 
                scale: isHovered ? 1.1 : 1,
                opacity: (isHovered && hasReference) ? 0 : 1 
            }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          />

          {/* Reference Reveal */}
          {hasReference && (
            <motion.div
              className="absolute inset-0 bg-slate-900"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.4 }}
            >
              <img 
                src={item.imageSource} 
                alt={`${item.title} Original`}
                className="w-full h-full object-cover scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 mix-blend-screen animate-pulse" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-xl text-white px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] border border-white/20 shadow-2xl flex items-center gap-2">
                <Sparkles size={12} className="text-amber-300" />
                Original Source
              </div>
            </motion.div>
          )}

          {/* Locked Status Indicator */}
          {isActuallyLocked && (
             <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/10 backdrop-blur-[4px] pointer-events-none transition-opacity duration-300 group-hover:opacity-40">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-2xl flex items-center justify-center text-slate-900">
                   <Lock size={20} />
                </div>
                <p className="mt-4 text-[9px] font-black text-white uppercase tracking-[0.3em] drop-shadow-lg">Locked Content</p>
             </div>
          )}

          {/* BADGES */}
          <div className="absolute top-4 left-4 z-40 flex flex-col gap-2 pointer-events-none">
            <motion.span 
              initial={false}
              animate={{ x: isHovered ? 5 : 0 }}
              className={`${rarityColors[item.rarity]} text-white px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter shadow-xl flex items-center gap-1.5`}
            >
              <Star size={10} fill="currentColor" /> {item.rarity}
            </motion.span>
          </div>

          {/* ACTION OVERLAY */}
          <div className="absolute bottom-4 left-4 right-4 z-40 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
             <div className="bg-slate-900/60 backdrop-blur-md px-3 py-1.5 rounded-full text-[8px] font-black text-white uppercase tracking-widest flex items-center gap-2 border border-white/10">
                {isActuallyLocked ? <Lock size={10} /> : <Eye size={10} />}
                {isActuallyLocked ? 'Unlock PRO' : 'View Settings'}
             </div>
             {!isActuallyLocked && (
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg">
                   <Copy size={14} />
                </div>
             )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-5 bg-white border-t border-slate-50 flex flex-col justify-between flex-1 z-40" onClick={() => onClick(item)}>
           <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors leading-tight">{item.title}</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.model}</p>
                </div>
                <span className="text-[8px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg uppercase border border-indigo-100/50">{item.category}</span>
              </div>
           </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PromptCard;