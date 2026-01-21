
import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Copy, CheckCircle2, Bookmark, Star } from 'lucide-react';
import { PromptItem } from '../types';
import BeforeAfterSlider from './BeforeAfterSlider';

interface PromptCardProps {
  item: PromptItem;
  onClick: (item: PromptItem) => void;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
}

const PromptCard: React.FC<PromptCardProps> = ({ item, onClick, isSaved, onToggleSave }) => {
  const [copied, setCopied] = React.useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 100, damping: 20 });
  const mouseY = useSpring(y, { stiffness: 100, damping: 20 });
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-5, 5]);
  const sheenX = useTransform(mouseX, [-0.5, 0.5], [-20, 120]); 
  const sheenY = useTransform(mouseY, [-0.5, 0.5], [-20, 120]);

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
        onClick={() => onClick(item)}
      >
        <div className="relative glass-card rounded-2xl overflow-hidden flex flex-col h-full transform transition-all duration-300 group-hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] bg-white/70">
          <motion.div className="absolute inset-0 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 hidden md:block"
            style={{
                background: `linear-gradient(125deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%)`,
                backgroundSize: '200% 200%',
                backgroundPositionX: sheenX, backgroundPositionY: sheenY,
            }}
          />

          <div className="relative w-full aspect-[4/5] overflow-hidden bg-slate-100">
            <BeforeAfterSlider 
              beforeImage={item.imageSource || item.imageResult} 
              afterImage={item.imageResult} 
              alt={item.title} 
            />
            <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
              <span className={`${rarityColors[item.rarity]} text-white px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter shadow-lg flex items-center gap-1`}>
                <Star size={8} fill="currentColor" /> {item.rarity}
              </span>
              {item.isPremium && (
                <span className="bg-white/90 backdrop-blur-md text-slate-900 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase border border-white/50">Pro</span>
              )}
            </div>
          </div>

          <div className="p-4 bg-white/40 border-t border-white/50 flex flex-col justify-between flex-1">
             <div>
                <h3 className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors mb-1">{item.title}</h3>
                <p className="text-[10px] font-medium text-slate-500">{item.model}</p>
             </div>
             <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100/50">
                <div className="flex items-center gap-2">
                   <div className="w-5 h-5 rounded-full bg-slate-200"></div>
                   <span className="text-[9px] font-bold text-slate-400 uppercase">Vault</span>
                </div>
                 <div className="flex gap-2">
                   <button onClick={(e) => { e.stopPropagation(); onToggleSave(item.id); }} className={`transition-colors ${isSaved ? 'text-indigo-600' : 'text-slate-300'}`}>
                      <Bookmark size={14} fill={isSaved ? "currentColor" : "none"} />
                   </button>
                 </div>
             </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PromptCard;
