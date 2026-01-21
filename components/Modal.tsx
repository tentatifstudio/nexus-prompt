
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Maximize2, Share2, Download, CheckCircle2, Play, Terminal } from 'lucide-react';
import { PromptItem } from '../types';

interface ModalProps {
  item: PromptItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ item, isOpen, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!item) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(item.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            <div className="glass-panel w-full max-w-6xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row pointer-events-auto border border-white/60 relative bg-white/90">
              
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 z-20 p-2 bg-white/50 hover:bg-white rounded-full text-slate-700 transition-colors border border-white/50 shadow-sm"
              >
                <X size={20} />
              </button>

              <div className="w-full md:w-[55%] bg-slate-50 relative flex items-center justify-center overflow-hidden p-8">
                 <div className="absolute w-full h-full top-0 left-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-100 via-transparent to-transparent opacity-50" />
                 
                 <img 
                  src={item.imageResult} 
                  alt={item.title} 
                  className="relative z-10 w-full h-full object-contain max-h-[50vh] md:max-h-full rounded-lg shadow-2xl"
                />
                
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 z-20">
                   <button className="bg-white/70 backdrop-blur-md hover:bg-white text-slate-800 px-5 py-2 rounded-full text-xs font-bold border border-white/50 shadow-lg flex items-center gap-2 transition-all hover:-translate-y-1">
                     <Maximize2 size={14} /> Full View
                   </button>
                   <button className="bg-slate-900 text-white hover:bg-indigo-600 px-5 py-2 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 transition-all hover:-translate-y-1">
                     <Download size={14} /> Save HD
                   </button>
                </div>
              </div>

              <div className="w-full md:w-[45%] flex flex-col h-full bg-white/40 backdrop-blur-xl border-l border-white/50">
                <div className="flex-1 overflow-y-auto p-10 no-scrollbar">
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-3">
                       <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide bg-indigo-50 px-2 py-1 rounded">
                         {item.model}
                       </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-3">{item.title}</h2>
                    <div className="flex items-center gap-4 text-xs text-slate-500 font-semibold">
                       <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-green-500"/> Verified</span>
                       <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                       <span>{item.category}</span>
                       <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                       <span>{item.type}</span>
                    </div>
                  </div>

                  <p className="text-slate-600 leading-relaxed mb-8 text-sm font-medium">
                    {item.description || "A high-quality generative AI asset optimized for professional creative workflows."}
                  </p>

                  <div className="mb-8">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                      <Terminal size={14} />
                      Source Prompt
                    </h3>
                    
                    <div className="relative group">
                      <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-inner font-mono text-xs leading-relaxed text-slate-700">
                        {item.prompt}
                      </div>
                      
                      <button 
                        onClick={handleCopy}
                        className="absolute top-3 right-3 p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-indigo-600 transition-colors"
                      >
                        {copied ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-white/50 p-6 rounded-2xl border border-white/60">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Seed</div>
                      <div className="text-sm font-bold text-slate-800 font-mono">{item.seed}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Aspect Ratio</div>
                      <div className="text-sm font-bold text-slate-800">{item.aspectRatio}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Guidance</div>
                      <div className="text-sm font-bold text-slate-800">{item.guidanceScale}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Rarity</div>
                      <div className="text-sm font-bold text-slate-800">{item.rarity}</div>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-white/50 bg-white/30">
                   <div className="flex gap-3">
                      <button className="flex-1 bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 shadow-lg">
                         <Play size={18} fill="currentColor" /> Generate Asset
                      </button>
                      <button className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 text-slate-600 hover:text-indigo-600 transition-colors shadow-sm">
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
