
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Lock, Zap, Bookmark, Layers } from 'lucide-react';
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

  const isPremiumLocked = item.isPremium && user?.plan !== 'pro';
  const hasReference = !!item.imageSource;

  const rarityColors: Record<string, string> = {
    Common: 'bg-slate-500',
    Rare: 'bg-indigo-600',
    Legendary: 'bg-gradient-to-r from-amber-400 to-rose-500'
  };

  return (
    <div className="group relative h-full">
      <div className="relative glass-card rounded-2xl overflow-hidden flex flex-col h-full transform transition-all duration-300 group-hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] bg-white/70">
        
        {/* Creator Header */}
        <div className="p-3 flex items-center justify-between border-b border-white/50 bg-white/40">
           <Link 
             to={`/user/${item.user_id}`} 
             onClick={(e) => e.stopPropagation()}
             className="flex items-center gap-2 hover:opacity-80 transition-opacity"
           >
              <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden border border-slate-100">
                 <img src={item.author?.avatar_url} className="w-full h-full object-cover" alt="Author" />
              </div>
              <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{item.author?.username || 'Creator'}</span>
           </Link>
           <button onClick={(e) => { e.stopPropagation(); onToggleSave?.(item.id); }} className={`transition-colors ${isSaved ? 'text-indigo-600' : 'text-slate-300'}`}>
              <Bookmark size={14} fill={isSaved ? "currentColor" : "none"} />
           </button>
        </div>

        {/* IMAGE AREA: HOVER TO COMPARE */}
        <div 
          className="relative w-full aspect-[4/5] overflow-hidden bg-slate-100 cursor-pointer" 
          onClick={() => onClick(item)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Result Image (Default) */}
          <motion.img 
            src={item.imageResult} 
            alt={item.title}
            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ${isHovered ? 'scale-105' : 'scale-100'}`}
            initial={false}
            animate={{ opacity: (isHovered && hasReference) ? 0 : 1 }}
          />

          {/* Reference Image (Hover Reveal) */}
          {hasReference && (
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <img 
                src={item.imageSource} 
                alt={`${item.title} Original`}
                className="w-full h-full object-cover scale-105"
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900/40 backdrop-blur-md text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-white/20">
                Original Photo
              </div>
            </motion.div>
          )}

          {/* BADGES */}
          <div className="absolute top-3 left-3 z-20 flex flex-col gap-2 pointer-events-none">
            <span className={`${rarityColors[item.rarity]} text-white px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter shadow-lg flex items-center gap-1`}>
              <Star size={8} fill="currentColor" /> {item.rarity}
            </span>
            {item.isPremium && (
              <span className="bg-amber-500 text-white px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1">
                {isPremiumLocked ? <Lock size={8} /> : <Zap size={8} fill="currentColor" />} Pro
              </span>
            )}
            {hasReference && (
              <span className="bg-white/80 backdrop-blur-md text-slate-900 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg border border-white/50 flex items-center gap-1">
                <Layers size={8} /> REF
              </span>
            )}
          </div>

          {/* HOVER HINT */}
          {hasReference && !isHovered && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-[7px] font-black text-white/80 uppercase tracking-[0.2em] border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
              Hover to compare
            </div>
          )}
        </div>

        {/* FOOTER INFO */}
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
    </div>
  );
};

export default PromptCard;
