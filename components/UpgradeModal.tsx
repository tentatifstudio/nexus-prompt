
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Zap, Star, Loader2, MessageSquare, ShieldCheck, CreditCard, Copy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  const { user, upgradeToPro } = useAuth();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // WhatsApp Configuration
  const WA_ADMIN_NUMBER = "6281234567890"; // Nomor Admin Wahyu
  const WA_MESSAGE = encodeURIComponent(`Halo Admin, saya mau upgrade Pro. Email saya: ${user?.email || 'User Nexus'}`);
  const WA_URL = `https://wa.me/${WA_ADMIN_NUMBER}?text=${WA_MESSAGE}`;

  const benefits = [
    { title: "Akses Prompt 'Legendary' & 'Rare'", desc: "Buka semua library eksklusif tanpa batas." },
    { title: "Lihat Prompt Tanpa Sensor", desc: "No blur, semua parameter teknis terlihat jelas." },
    { title: "Copy-Paste Sekali Klik", desc: "Langsung salin prompt ke AI generator Anda." },
    { title: "Support Local Creators", desc: "Kontribusi Anda membantu ekosistem kreator." }
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInstantUpgrade = async () => {
    setIsUpgrading(true);
    try {
      await upgradeToPro();
      onClose();
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
            className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white/95 backdrop-blur-2xl w-full max-w-4xl rounded-[48px] overflow-hidden shadow-[0_32px_128px_-15px_rgba(79,70,229,0.5)] pointer-events-auto flex flex-col md:flex-row relative border border-white/50">
              <button 
                onClick={onClose}
                className="absolute top-8 right-8 z-10 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X size={20} />
              </button>

              {/* LEFT: BENEFITS */}
              <div className="w-full md:w-[55%] p-10 md:p-14 border-r border-slate-100">
                <div className="mb-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                    <Zap size={12} fill="currentColor" /> Premium Access
                  </div>
                  <h3 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">Unlock Unlimited <br/><span className="text-indigo-600">Creative Power 🚀</span></h3>
                </div>
                
                <div className="space-y-6 mb-10">
                   {benefits.map((b, i) => (
                     <div key={i} className="flex gap-4">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0"><Check size={14} strokeWidth={3} /></div>
                        <div>
                           <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{b.title}</p>
                           <p className="text-xs text-slate-500 font-medium">{b.desc}</p>
                        </div>
                     </div>
                   ))}
                </div>

                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                   <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lifetime Membership</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400 line-through">Rp 100.000</span>
                        <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-lg text-[10px] font-black">-50%</span>
                      </div>
                   </div>
                   <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-slate-900 tracking-tighter">Rp 50.000</span>
                      <span className="text-xs font-bold text-slate-400">/ Selamanya</span>
                   </div>
                </div>
              </div>

              {/* RIGHT: PAYMENT METHOD */}
              <div className="w-full md:w-[45%] p-10 md:p-14 bg-slate-900 text-white flex flex-col justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/2" />
                
                <div className="relative z-10">
                  <h4 className="text-xl font-black mb-6 uppercase tracking-tight flex items-center gap-2">
                    <CreditCard size={20} className="text-indigo-400" /> Payment Step
                  </h4>
                  
                  <div className="space-y-4 mb-8">
                    <div className="bg-white/5 border border-white/10 p-5 rounded-3xl group transition-all hover:bg-white/10">
                       <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Step 1: Transfer</p>
                       <p className="text-sm font-bold text-white mb-3">DANA / BCA / Mandiri</p>
                       <div className="flex items-center justify-between bg-black/40 p-3 rounded-2xl border border-white/5">
                          <code className="text-xs font-mono font-bold text-indigo-300">0812-3456-7890</code>
                          <button 
                            onClick={() => copyToClipboard('081234567890')}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 transition-colors"
                          >
                            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                          </button>
                       </div>
                       <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest text-center">A/N WAHYU PRADANA</p>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-5 rounded-3xl group transition-all hover:bg-white/10">
                       <p className="text-[9px] font-black text-green-400 uppercase tracking-widest mb-1">Step 2: Confirm</p>
                       <p className="text-xs font-medium text-slate-300 leading-relaxed">Lampirkan screenshot bukti transfer dan email Anda di WhatsApp Admin.</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <a 
                      href={WA_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-5 rounded-2xl bg-green-500 text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-green-500/20 hover:bg-green-400 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                      <MessageSquare size={18} fill="currentColor" /> 
                      Konfirmasi WhatsApp
                    </a>
                    
                    <button 
                      onClick={handleInstantUpgrade}
                      disabled={isUpgrading}
                      className="w-full py-3 text-[10px] text-slate-500 font-black uppercase tracking-widest hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                      {isUpgrading ? <Loader2 size={12} className="animate-spin" /> : <Star size={12} fill="currentColor" />}
                      Instant Activation (Dev Only)
                    </button>
                  </div>

                  <div className="mt-8 flex items-center justify-center gap-2 opacity-50">
                    <ShieldCheck size={14} />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Secure Manual Verification</span>
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

export default UpgradeModal;
