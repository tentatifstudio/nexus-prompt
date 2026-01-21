import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Loader2, AlertCircle, ShieldCheck, ExternalLink } from 'lucide-react';
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
    } catch (err: any) {
      console.error("Login Failed:", err);
      // Deteksi error spesifik dari Supabase
      if (err.message?.includes('provider is not enabled')) {
        setError("Google Login is not enabled in Supabase Dashboard. Please enable it in 'Authentication > Providers'.");
      } else {
        setError(err.message || "Failed to initialize Google Sign-In. Please try again.");
      }
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
            <div className="glass-panel w-full max-w-md rounded-[32px] p-8 shadow-2xl pointer-events-auto relative text-center bg-white/95 border border-white/80">
              
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-indigo-400 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-xl text-white ring-8 ring-indigo-50">
                <Zap size={32} fill="currentColor" />
              </div>

              <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Nexus Vault Access</h2>
              <p className="text-slate-500 mb-6 leading-relaxed text-sm font-medium">
                Sign in with Google to unlock unlimited prompt views and premium library access.
              </p>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex flex-col items-start gap-2 text-left animate-shake">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                    <AlertCircle size={14} className="shrink-0" />
                    Configuration Error
                  </div>
                  <p className="text-xs font-medium leading-relaxed">{error}</p>
                  {error.includes('Supabase Dashboard') && (
                    <a 
                      href="https://supabase.com/dashboard/project/_/auth/providers" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold underline flex items-center gap-1 mt-1"
                    >
                      Go to Dashboard <ExternalLink size={10} />
                    </a>
                  )}
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
                
                <div className="flex items-center justify-center gap-2 py-2">
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