
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Share2, CheckCircle2, Play, Terminal, Lock, Zap, LogIn, Crown, Eye } from 'lucide-react';
import { PromptItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useMeteredAccess } from '../hooks/useMeteredAccess';

interface ModalProps {
  item: PromptItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth?: () => void;
  onOpenPricing?: () => void;
}

const Modal: React.FC<ModalProps> = ({ item, isOpen, onClose, onOpenAuth, onOpenPricing }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { remaining, hasRemaining, increment } = useMeteredAccess();
  
  const [copied, setCopied] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  if (!item) return null;

  const isGuest = !user;
  const isPro = user?.is_pro;
  const isFreeUser = user && !isPro;
  
  // Logic: Pro users see everything. Guest/Free see blur unless they reveal.
  const needsLock = isGuest || (isFreeUser && item.isPremium);
  const isActuallyLocked = needsLock && !isRevealed && !isPro;
  
  const handleCopy = () => {
    if (isActuallyLocked) return;
    navigator.clipboard.writeText(item.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReveal = () => {
    if (isPro) {
      setIsRevealed(true);
      return;
    }

    if (hasRemaining) {
      increment();
      setIsRevealed(true);
    } else {
      onClose();
      onOpenPricing?.();
    }
  };

  const getLockMessage = () => {
    if (!hasRemaining) return "Quota Habis! Upgrade ke Pro untuk akses tak terbatas.";
    if (isGuest) return "Gunakan 1 kuota gratis untuk melihat prompt ini.";
    if (isFreeUser && item.isPremium) return "Prompt Premium! Gunakan kuota untuk reveal.";
    return "Click reveal to see prompt settings.";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-slate-950/40 backdrop-blur-lg"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-[61] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="glass-panel w-full max-w-6xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row pointer-events-auto border border-white/60 relative bg-white/95">
              
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 z-20 p-2 bg-white/50 hover:bg-white rounded-full text-slate-700 transition-colors border border-white/50 shadow-sm"
              >
                <X size={20} />
              </button>

              <div className="w-full md:w-[55%] bg-slate-100 relative flex items-center justify-center overflow-hidden p-4 md:p-8">
                 <img 
                  src={item.imageResult} 
                  alt={item.title} 
                  className="relative z-10 w-full h-full object-contain max-h-[40vh] md:max-h-full rounded-xl shadow-2xl"
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent opacity-50" />
              </div>

              <div className="w-full md:w-[45%] flex flex-col h-full bg-white/50 backdrop-blur-xl border-l border-white/50">
                <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
                  
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-3">
                       <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded">
                         {item.model}
                       </span>
                       {item.isPremium && (
                         <span className="flex items-center gap-1 bg-amber-100 text-amber-600 px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest">
                           <Crown size={10} fill="currentColor" /> {item.rarity}
                         </span>
                       )}
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">{item.title}</h2>
                    <p className="text-xs text-slate-500 font-medium">{item.category} • {item.type}</p>
                  </div>

                  <div className="mb-8 relative">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                      <Terminal size={14} /> Secret Prompt
                    </h3>
                    
                    <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white group/prompt">
                      <div className={`p-6 font-mono text-xs leading-relaxed text-slate-700 transition-all duration-700 ${isActuallyLocked ? 'blur-md select-none grayscale opacity-30' : ''}`}>
                        {item.prompt}
                      </div>
                      
                      {isActuallyLocked && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/20 backdrop-blur-[2px] p-6 text-center">
                           <div className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-slate-400 mb-4 border border-slate-100">
                             <Lock size={20} />
                           </div>
                           <p className="text-[11px] font-black text-slate-800 uppercase tracking-widest px-4 leading-relaxed max-w-[240px] mb-6">
                             {getLockMessage()}
                           </p>
                           
                           <button 
                             onClick={handleReveal}
                             className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-600 transition-all shadow-lg"
                           >
                             <Eye size={14} /> Reveal Prompt ({remaining}/3 Left)
                           </button>
                        </div>
                      )}

                      {!isActuallyLocked && (
                        <button 
                          onClick={handleCopy}
                          className="absolute top-3 right-3 p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
                        >
                          {copied ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-6 rounded-2xl border border-slate-100 mb-6 relative">
                    <div className={isActuallyLocked ? 'blur-sm opacity-40 select-none' : ''}>
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Seed</p>
                      <p className="text-xs font-bold text-slate-800 font-mono">{item.seed}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Aspect Ratio</p>
                      <p className="text-xs font-bold text-slate-800">{item.aspectRatio}</p>
                    </div>
                    <div className={isActuallyLocked ? 'blur-sm opacity-40 select-none' : ''}>
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Guidance</p>
                      <p className="text-xs font-bold text-slate-800">{item.guidanceScale}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Rarity</p>
                      <p className="text-xs font-bold text-slate-800">{item.rarity}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50/30">
                   <div className="flex gap-3">
                      {isActuallyLocked ? (
                        <button 
                          onClick={() => {
                            onClose();
                            if (isGuest) navigate('/login');
                            else onOpenPricing?.();
                          }}
                          className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 shadow-xl"
                        >
                          {isGuest ? <><LogIn size={18} /> Login to Access</> : <><Crown size={18} fill="currentColor"/> Unlock Pro Archive</>}
                        </button>
                      ) : (
                        <button className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 shadow-xl">
                           <Play size={18} fill="currentColor" /> Use this Prompt
                        </button>
                      )}
                      <button className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 transition-colors shadow-sm">
                         <Share2 size={20} />
                      </button>
                   </div>
                </div>

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;
