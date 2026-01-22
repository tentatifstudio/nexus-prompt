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
  
  // WhatsApp Configuration
  const WA_ADMIN_NUMBER = "6281234567890"; // Ganti dengan nomor Admin Anda
  const WA_MESSAGE = encodeURIComponent("Halo Admin Prompt Nexus, saya tertarik untuk upgrade ke PRO VAULT. Bagaimana langkah pembayarannya?");
  const WA_URL = `https://wa.me/${WA_ADMIN_NUMBER}?text=${WA_MESSAGE}`;

  const handleInstantUpgrade = async () => {
    setIsUpgrading(true);
    try {
      await onUpgrade();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Upgrade failed. Please contact admin.");
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

              {/* FREE TIER */}
              <div className="w-full md:w-1/2 p-10 md:p-14 bg-slate-50 border-r border-slate-200">
                <div className="mb-10">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Plan</span>
                  <h3 className="text-4xl font-black text-slate-900 mt-2">Explorer</h3>
                  <p className="text-slate-500 mt-4 text-sm font-medium leading-relaxed">Perfect for browsing and basic prompt inspirations.</p>
                </div>
                
                <ul className="space-y-4 mb-10">
                   <li className="flex items-center gap-3 text-sm font-bold text-slate-600">
                     <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-500"><Check size={12} /></div>
                     View Common Prompts
                   </li>
                   <li className="flex items-center gap-3 text-sm font-bold text-slate-400 line-through">
                     Unlock Legendary Prompts
                   </li>
                   <li className="flex items-center gap-3 text-sm font-bold text-slate-400 line-through">
                     Access Secret Seeds
                   </li>
                </ul>

                <button 
                  onClick={onClose}
                  className="w-full py-4 rounded-2xl border-2 border-slate-200 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-white hover:border-slate-300 transition-all"
                >
                  Stay as Explorer
                </button>
              </div>

              {/* PRO TIER */}
              <div className="w-full md:w-1/2 p-10 md:p-14 bg-slate-900 text-white relative overflow-hidden flex flex-col justify-center">
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600 rounded-full blur-[120px] opacity-20 translate-x-1/4 -translate-y-1/4"></div>
                
                <div className="relative z-10">
                  <div className="mb-10">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-4">
                       <Zap size={12} fill="currentColor" /> Highly Recommended
                    </span>
                    <h3 className="text-4xl font-black text-white">PRO VAULT</h3>
                    <p className="text-slate-400 mt-4 text-sm font-medium leading-relaxed">Full access to our private archive of master-level prompts.</p>
                  </div>

                  <ul className="space-y-4 mb-10">
                     <li className="flex items-center gap-3 text-sm font-bold text-indigo-100">
                       <div className="bg-indigo-600 p-1.5 rounded-full shadow-lg shadow-indigo-600/20"><Check size={12} /></div>
                       Unlimited Premium Unlocks
                     </li>
                     <li className="flex items-center gap-3 text-sm font-bold text-indigo-100">
                       <div className="bg-indigo-600 p-1.5 rounded-full shadow-lg shadow-indigo-600/20"><Check size={12} /></div>
                       Copy Seeds & Settings
                     </li>
                     <li className="flex items-center gap-3 text-sm font-bold text-indigo-100">
                       <div className="bg-indigo-600 p-1.5 rounded-full shadow-lg shadow-indigo-600/20"><Check size={12} /></div>
                       New Content Every 24h
                     </li>
                  </ul>

                  <div className="space-y-3">
                    <a 
                      href={WA_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-5 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-600/40 hover:bg-indigo-500 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                      <MessageSquare size={18} fill="currentColor" /> 
                      Contact Admin for Upgrade
                    </a>
                    
                    <button 
                      onClick={handleInstantUpgrade}
                      disabled={isUpgrading}
                      className="w-full py-3 text-[10px] text-slate-500 font-black uppercase tracking-widest hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                      {isUpgrading ? <Loader2 size={12} className="animate-spin" /> : <Star size={12} fill="currentColor" />}
                      Instant Activation (Demo Mode)
                    </button>
                  </div>
                  
                  <p className="text-center text-[10px] font-bold text-slate-500 mt-8 uppercase tracking-widest">Join 500+ Pro Creators</p>
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