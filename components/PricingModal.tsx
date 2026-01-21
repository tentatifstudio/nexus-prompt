import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Zap, Star } from 'lucide-react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, onUpgrade }) => {
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
            <div className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl pointer-events-auto flex flex-col md:flex-row relative">
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X size={20} />
              </button>

              {/* LEFT: FREE TIER */}
              <div className="w-full md:w-1/2 p-8 md:p-12 bg-slate-50 flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-200">
                <div className="mb-6">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Starter</span>
                  <h3 className="text-3xl font-black text-slate-900">Free</h3>
                  <p className="text-slate-500 mt-2 text-sm">Great for browsing and trying things out.</p>
                </div>
                
                <ul className="space-y-4 mb-8">
                   <li className="flex items-center gap-3 text-sm font-medium text-slate-600">
                     <Check size={18} className="text-slate-400" /> Browse all thumbnails
                   </li>
                   <li className="flex items-center gap-3 text-sm font-medium text-slate-600">
                     <Check size={18} className="text-slate-400" /> Access Free Prompts
                   </li>
                   <li className="flex items-center gap-3 text-sm font-medium text-slate-600">
                     <Check size={18} className="text-slate-400" /> Limited Copy Actions
                   </li>
                </ul>

                <button 
                  onClick={onClose}
                  className="w-full py-3 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-white hover:border-slate-400 transition-all"
                >
                  Continue Free
                </button>
              </div>

              {/* RIGHT: PRO TIER */}
              <div className="w-full md:w-1/2 p-8 md:p-12 bg-slate-900 text-white relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[80px] opacity-20 translate-x-1/2 -translate-y-1/2"></div>
                
                <div className="relative z-10">
                  <div className="mb-6">
                    <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                       <Zap size={12} fill="currentColor" /> Pro Access
                    </span>
                    <h3 className="text-3xl font-black text-white mt-1">
                      $9<span className="text-lg text-slate-400 font-medium">/mo</span>
                    </h3>
                    <p className="text-slate-400 mt-2 text-sm">Unlock the full potential of AI generation.</p>
                  </div>

                  <ul className="space-y-4 mb-8">
                     <li className="flex items-center gap-3 text-sm font-medium text-slate-200">
                       <div className="bg-indigo-600 p-1 rounded-full"><Check size={10} /></div>
                       Unlock ALL Premium Prompts
                     </li>
                     <li className="flex items-center gap-3 text-sm font-medium text-slate-200">
                       <div className="bg-indigo-600 p-1 rounded-full"><Check size={10} /></div>
                       Copy System Prompts & Seeds
                     </li>
                     <li className="flex items-center gap-3 text-sm font-medium text-slate-200">
                       <div className="bg-indigo-600 p-1 rounded-full"><Check size={10} /></div>
                       Support the creators
                     </li>
                  </ul>

                  <button 
                    onClick={onUpgrade}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                  >
                    <Star size={16} fill="currentColor" /> Upgrade to Pro
                  </button>
                  <p className="text-center text-xs text-slate-500 mt-4">Secure payment via Stripe. Cancel anytime.</p>
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