
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SignInModal: React.FC<SignInModalProps> = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signInWithGoogle } = useAuth();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      // On successful redirect-based login, the page will refresh or the session will update
    } catch (err: any) {
      console.error("Login Failed:", err);
      setError("Failed to initialize Google Sign-In. Please try again.");
      setIsLoading(false);
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
            className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="fixed inset-0 z-[71] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="glass-panel w-full max-w-sm rounded-[32px] p-8 shadow-2xl pointer-events-auto relative text-center bg-white/95 border border-white/80">
              
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="w-20 h-20 bg-gradient-to-tr from-indigo-600 to-indigo-400 rounded-3xl mx-auto flex items-center justify-center mb-8 shadow-xl text-white ring-8 ring-indigo-50">
                <Zap size={40} fill="currentColor" />
              </div>

              <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Nexus Vault Access</h2>
              <p className="text-slate-500 mb-8 leading-relaxed text-sm font-medium">
                You've reached your preview limit. Sign in with Google to unlock unlimited prompt views and premium tools.
              </p>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center gap-2 text-left">
                  <AlertCircle size={16} className="shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <button 
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-slate-200 group disabled:opacity-70"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <img 
                        src="https://www.svgrepo.com/show/475656/google-color.svg" 
                        alt="Google" 
                        className="w-5 h-5 group-hover:scale-110 transition-transform" 
                      />
                      <span className="text-xs uppercase tracking-widest">Continue with Google</span>
                    </>
                  )}
                </button>
                
                <div className="flex items-center justify-center gap-2 py-4">
                   <ShieldCheck size={14} className="text-green-500" />
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secure OAuth Protocol</span>
                </div>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SignInModal;
