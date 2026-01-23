import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Loader2, Mail, Lock, User, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const { signInWithEmail, signUpWithEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        await signInWithEmail(formData.email, formData.password);
        navigate(from, { replace: true });
      } else {
        if (!formData.username) throw new Error("Username is required");
        await signUpWithEmail(formData.email, formData.password, formData.username);
        alert("Account created! You can now sign in.");
        setMode('login');
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      setError(err.message || "Something went wrong. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200">
            <Zap size={32} fill="currentColor" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Nexus Vault</h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Access the Archive</p>
        </div>

        <div className="glass-panel p-2 rounded-[32px] mb-8 flex border border-white/80 bg-white/40 shadow-sm">
          <button 
            onClick={() => setMode('login')}
            className={`flex-1 py-4 rounded-[24px] text-xs font-black uppercase tracking-widest transition-all ${mode === 'login' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Login
          </button>
          <button 
            onClick={() => setMode('register')}
            className={`flex-1 py-4 rounded-[24px] text-xs font-black uppercase tracking-widest transition-all ${mode === 'register' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-[40px] p-8 shadow-2xl border border-slate-100 space-y-6">
          <AnimatePresence mode='wait'>
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: 10 }}
                className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-[10px] font-bold uppercase tracking-widest leading-relaxed"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {mode === 'register' && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Creative Username</label>
              <div className="relative">
                <User size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                <input 
                  required
                  type="text"
                  placeholder="e.g. prompt_master"
                  value={formData.username}
                  onChange={e => setFormData({...formData, username: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-6 py-4 outline-none focus:ring-4 ring-slate-900/5 transition-all text-sm font-bold"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Email Address</label>
            <div className="relative">
              <Mail size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
              <input 
                required
                type="email"
                placeholder="name@company.com"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-6 py-4 outline-none focus:ring-4 ring-slate-900/5 transition-all text-sm font-bold"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Access Code (Password)</label>
            <div className="relative">
              <Lock size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
              <input 
                required
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-6 py-4 outline-none focus:ring-4 ring-slate-900/5 transition-all text-sm font-bold"
              />
            </div>
          </div>

          <button 
            disabled={isLoading}
            type="submit"
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : mode === 'login' ? 'Enter Vault' : 'Create Access'}
            {!isLoading && <ArrowRight size={18} />}
          </button>

          <div className="pt-4 flex items-center justify-center gap-2 opacity-40">
            <ShieldCheck size={14} />
            <span className="text-[9px] font-black uppercase tracking-widest">End-to-End Encryption</span>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
