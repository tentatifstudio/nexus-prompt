
import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Star, Lock, Zap, Bookmark } from 'lucide-react';
import { PromptItem } from '../types';
import BeforeAfterSlider from './BeforeAfterSlider';
import { useAuth } from '../context/AuthContext';

interface PromptCardProps {
  item: PromptItem;
  onClick: (item: PromptItem) => void;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
}

const PromptCard: React.FC<PromptCardProps> = ({ item, onClick, isSaved = false, onToggleSave }) => {
  const { user } = useAuth();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 100, damping: 20 });
  const mouseY = useSpring(y, { stiffness: 100, damping: 20 });
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-5, 5]);

  const isPremiumLocked = item.isPremium && user?.plan !== 'pro';

  const rarityColors: Record<string, string> = {
    Common: 'bg-slate-500',
    Rare: 'bg-indigo-600',
    Legendary: 'bg-gradient-to-r from-amber-400 to-rose-500'
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseXPct = (e.clientX - rect.left) / rect.width - 0.5;
    const mouseYPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(mouseXPct);
    y.set(mouseYPct);
  };

  return (
    <div className="group relative perspective-1000 h-full">
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative w-full h-full cursor-pointer"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => { x.set(0); y.set(0); }}
      >
        <div className="relative glass-card rounded-2xl overflow-hidden flex flex-col h-full transform transition-all duration-300 group-hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] bg-white/70">
          
          {/* Creator Header */}
          <div className="p-3 flex items-center justify-between border-b border-white/50">
             <Link 
               to={`/user/${item.user_id}`} 
               onClick={(e) => e.stopPropagation()}
               className="flex items-center gap-2 hover:opacity-80 transition-opacity"
             >
                <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden border border-slate-100">
                   <img src={item.author?.avatar_url} className="w-full h-full object-cover" alt="Author" />
                </div>
                <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{item.author?.username}</span>
             </Link>
             <button onClick={(e) => { e.stopPropagation(); onToggleSave?.(item.id); }} className={`transition-colors ${isSaved ? 'text-indigo-600' : 'text-slate-300'}`}>
                <Bookmark size={14} fill={isSaved ? "currentColor" : "none"} />
             </button>
          </div>

          <div className="relative w-full aspect-[4/5] overflow-hidden bg-slate-100" onClick={() => onClick(item)}>
            <BeforeAfterSlider 
              beforeImage={item.imageSource || item.imageResult} 
              afterImage={item.imageResult} 
              alt={item.title} 
            />
            <div className="absolute top-3 left-3 z-20 flex flex-col gap-2 pointer-events-none">
              <span className={`${rarityColors[item.rarity]} text-white px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter shadow-lg flex items-center gap-1`}>
                <Star size={8} fill="currentColor" /> {item.rarity}
              </span>
              {item.isPremium && (
                <span className="bg-amber-500 text-white px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1">
                  {isPremiumLocked ? <Lock size={8} /> : <Zap size={8} fill="currentColor" />} Pro
                </span>
              )}
            </div>
          </div>

          <div className="p-4 bg-white/40 border-t border-white/50 flex flex-col justify-between flex-1" onClick={() => onClick(item)}>
             <div>
                <h3 className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors mb-1">{item.title}</h3>
                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.model}</p>
                  <span className="text-[8px] font-black text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded uppercase">{item.category}</span>
                </div>
             </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PromptCard;
