
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, Grid, Trash2, ShieldCheck, Zap } from 'lucide-react';
import { promptService } from '../services/promptService';
import { PromptItem } from '../types';
import PromptCard from '../components/PromptCard';
import { useAuth } from '../context/AuthContext';

interface UserProfilePageProps {
  userId: string;
  onBack: () => void;
  onSelectPrompt: (item: PromptItem) => void;
}

const UserProfilePage: React.FC<UserProfilePageProps> = ({ userId, onBack, onSelectPrompt }) => {
  const { user: currentUser } = useAuth();
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const isOwnProfile = currentUser?.id === userId;

  const loadUserPrompts = async () => {
    setLoading(true);
    const data = await promptService.getByUserId(userId);
    setPrompts(data);
    setLoading(false);
  };

  useEffect(() => { loadUserPrompts(); }, [userId]);

  const handleDelete = async (id: string) => {
    if (confirm("Hapus prompt ini selamanya?")) {
      await promptService.deletePrompt(id, userId);
      setPrompts(prev => prev.filter(p => p.id !== id));
    }
  };

  const author = prompts[0]?.profiles;

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-24">
      <div className="max-w-7xl mx-auto px-6">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold mb-8 transition-colors group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Kembali Ke Feed
        </button>

        <div className="bg-white rounded-[48px] p-12 mb-16 shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 opacity-50"></div>
          
          <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="relative">
              <img 
                src={author?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`} 
                className="w-32 h-32 md:w-40 md:h-40 rounded-[40px] bg-slate-100 shadow-xl border-4 border-white"
                alt="Profile"
              />
              {isOwnProfile && <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-2 rounded-2xl shadow-lg border-2 border-white"><Zap size={16} fill="currentColor"/></div>}
            </div>
            
            <div className="text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-4 mb-2">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">{author?.username || 'Nexus User'}</h1>
                <div className="flex gap-2">
                  <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1"><ShieldCheck size={12}/> Verified</span>
                </div>
              </div>
              <p className="text-slate-400 font-bold text-sm mb-6 uppercase tracking-widest">{prompts.length} Collections • Member of Nexus</p>
              
              <div className="flex items-center gap-4 justify-center md:justify-start">
                 <div className="text-center">
                   <p className="text-2xl font-black text-slate-900">{prompts.length}</p>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Posts</p>
                 </div>
                 <div className="w-px h-8 bg-slate-100 mx-4"></div>
                 <div className="text-center">
                   <p className="text-2xl font-black text-slate-900">{Math.floor(prompts.length * 12.5)}</p>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Inspirations</p>
                 </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-12">
          <Grid size={20} className="text-indigo-600" />
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Gallery Vault</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            <AnimatePresence>
              {prompts.map(item => (
                <PromptCard 
                  key={item.id} 
                  item={item} 
                  onClick={onSelectPrompt} 
                  showDelete={isOwnProfile}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
            {prompts.length === 0 && (
              <div className="col-span-full py-20 text-center bg-white rounded-[40px] border border-dashed border-slate-200">
                <p className="text-slate-400 font-black uppercase tracking-widest">No prompts collected yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;
