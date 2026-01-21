import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Zap, Star, Loader2, MessageSquare } from 'lucide-react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => Promise<void>;
}

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, onUpgrade }) => {
  const [isUpgrading, setIsUpgrading] = useState(false);
  
  // WhatsApp Integration
  const WA_NUMBER = "6281234567890"; // Ganti dengan nomor Anda
  const WA_MESSAGE = encodeURIComponent("Halo Admin Prompt Nexus, saya ingin upgrade ke Pro Vault. Mohon info detail pembayarannya.");
  const WA_LINK = `https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`;

  const handleUpgradeClick = async () => {
    setIsUpgrading(true);
    try {
      // Simulate real-world payment check or just instant upgrade for now
      await onUpgrade();
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-slate-900/80 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="fixed inset-0 z-[81] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white w-full max-w-4xl rounded-[40px] overflow-hidden shadow-2xl pointer-events-auto flex flex-col md:flex-row relative">
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 z-10 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X size={20} />
              </button>

              {/* LEFT: FREE TIER */}
              <div className="w-full md:w-1/2 p-10 md:p-14 bg-slate-50 flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-200">
                <div className="mb-8">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Current Status</span>
                  <h3 className="text-4xl font-black text-slate-900 mt-1">Free Tier</h3>
                  <p className="text-slate-500 mt-3 text-sm font-medium leading-relaxed">Perfect for exploring and daily inspirations.</p>
                </div>
                
                <ul className="space-y-4 mb-10">
                   <li className="flex items-center gap-3 text-sm font-bold text-slate-600">
                     <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-500"><Check size={12} /></div>
                     Browse all thumbnails
                   </li>
                   <li className="flex items-center gap-3 text-sm font-bold text-slate-400 line-through">
                     Copy Premium Prompts
                   </li>
                   <li className="flex items-center gap-3 text-sm font-bold text-slate-400 line-through">
                     View Advanced Settings
                   </li>
                </ul>

                <button 
                  onClick={onClose}
                  className="w-full py-4 rounded-2xl border-2 border-slate-200 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-white hover:border-slate-300 transition-all"
                >
                  Continue Browsing
                </button>
              </div>

              {/* RIGHT: PRO TIER */}
              <div className="w-full md:w-1/2 p-10 md:p-14 bg-slate-900 text-white relative overflow-hidden flex flex-col justify-center">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600 rounded-full blur-[100px] opacity-20 translate-x-1/4 -translate-y-1/4"></div>
                
                <div className="relative z-10">
                  <div className="mb-8">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-4">
                       <Zap size={12} fill="currentColor" /> Pro Access
                    </span>
                    <h3 className="text-4xl font-black text-white">
                      PRO<span className="text-lg text-indigo-400 font-medium ml-2 tracking-normal uppercase">Vault</span>
                    </h3>
                    <p className="text-slate-400 mt-3 text-sm font-medium leading-relaxed">Unlock all premium prompts, seeds, and advanced model settings.</p>
                  </div>

                  <ul className="space-y-4 mb-10">
                     <li className="flex items-center gap-3 text-sm font-bold text-indigo-100">
                       <div className="bg-indigo-600 p-1.5 rounded-full"><Check size={12} /></div>
                       Unlimited Premium Content
                     </li>
                     <li className="flex items-center gap-3 text-sm font-bold text-indigo-100">
                       <div className="bg-indigo-600 p-1.5 rounded-full"><Check size={12} /></div>
                       Full Prompt Reveal (No Blur)
                     </li>
                     <li className="flex items-center gap-3 text-sm font-bold text-indigo-100">
                       <div className="bg-indigo-600 p-1.5 rounded-full"><Check size={12} /></div>
                       Priority Archive Support
                     </li>
                  </ul>

                  <div className="space-y-3">
                    <a 
                      href={WA_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-5 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/30 hover:bg-indigo-500 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                      <MessageSquare size={16} fill="currentColor" /> 
                      Upgrade via WhatsApp
                    </a>
                    
                    <button 
                      onClick={handleUpgradeClick}
                      disabled={isUpgrading}
                      className="w-full py-3 text-[10px] text-slate-500 font-black uppercase tracking-widest hover:text-white transition-colors"
                    >
                      {isUpgrading ? "Checking..." : "Instant Demo Upgrade (Test)"}
                    </button>
                  </div>
                  
                  <p className="text-center text-[10px] font-bold text-slate-500 mt-6 uppercase tracking-widest">Join 1,200+ Nexus Creators</p>
                </div>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PricingModal;