
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, Grid, Edit3, ShieldCheck, Zap, Globe, MessageCircle } from 'lucide-react';
import { promptService } from '../services/promptService';
import { PromptItem } from '../types';
import PromptCard from '../components/PromptCard';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

const PublicProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<PromptItem | null>(null);
  
  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    const loadData = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const [profileData, promptsData] = await Promise.all([
          promptService.getProfile(userId),
          promptService.getByUserId(userId)
        ]);
        setProfile(profileData);
        setPrompts(promptsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [userId]);

  const handleDelete = async (id: string) => {
    if (confirm("Hapus prompt ini selamanya?") && userId) {
      await promptService.deletePrompt(id, userId);
      setPrompts(prev => prev.filter(p => p.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <Globe size={64} className="text-slate-200 mb-6" />
        <h1 className="text-2xl font-black text-slate-900 mb-2">User Not Found</h1>
        <p className="text-slate-500 mb-8">This dimension doesn't seem to exist.</p>
        <button onClick={() => navigate('/')} className="bg-slate-900 text-white px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest">Return to Nexus</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-24">
      <div className="max-w-7xl mx-auto px-6">
        
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/50 bg-white/60 backdrop-blur-md">
           <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2">
                <div className="bg-slate-900 text-white p-1.5 rounded-lg"><Zap size={18} fill="currentColor" /></div>
                <span className="font-bold text-lg tracking-tight">PROMPT<span className="font-light text-slate-500">NEXUS</span></span>
              </Link>
           </div>
        </header>

        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold mb-8 transition-colors group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back
        </button>

        <div className="bg-white rounded-[48px] p-8 md:p-12 mb-16 shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 opacity-40"></div>
          
          <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="relative">
              <img 
                src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`} 
                className="w-32 h-32 md:w-48 md:h-48 rounded-[48px] bg-slate-100 shadow-2xl border-4 border-white object-cover"
                alt="Profile"
              />
              {profile.is_pro && (
                <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-2.5 rounded-2xl shadow-lg border-4 border-white">
                  <Zap size={20} fill="currentColor"/>
                </div>
              )}
            </div>
            
            <div className="text-center md:text-left flex-1">
              <div className="flex flex-col md:flex-row items-center gap-4 mb-3">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                  {profile.username || 'Nexus Explorer'}
                </h1>
                <div className="flex gap-2">
                   <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                     <ShieldCheck size={12}/> Verified Creator
                   </span>
                </div>
              </div>
              
              <p className="text-slate-600 font-medium text-lg mb-6 max-w-2xl leading-relaxed">
                {profile.bio || "Crafting digital realities through intelligent prompting. Welcome to my Nexus vault."}
              </p>

              <div className="flex flex-wrap items-center gap-6 justify-center md:justify-start">
                 <div className="text-center md:text-left">
                   <p className="text-2xl font-black text-slate-900">{prompts.length}</p>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Collections</p>
                 </div>
                 <div className="w-px h-8 bg-slate-100 hidden md:block"></div>
                 <div className="text-center md:text-left">
                   <p className="text-2xl font-black text-slate-900">{Math.floor(prompts.length * 4.2)}</p>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Saves</p>
                 </div>
                 
                 <div className="flex gap-3 ml-0 md:ml-auto">
                    {isOwnProfile ? (
                      <Link to="/settings" className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-2 shadow-xl">
                        <Edit3 size={16} /> Edit Profile
                      </Link>
                    ) : (
                      <button className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-xl">
                        <MessageCircle size={16} fill="currentColor"/> Message
                      </button>
                    )}
                 </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600"><Grid size={20} /></div>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Gallery Vault</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          <AnimatePresence>
            {prompts.map(item => (
              <PromptCard 
                key={item.id} 
                item={item} 
                onClick={setSelectedItem} 
                showDelete={isOwnProfile}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
          {prompts.length === 0 && (
            <div className="col-span-full py-24 text-center bg-white rounded-[40px] border border-dashed border-slate-200">
              <p className="text-slate-400 font-black uppercase tracking-widest">This vault is currently empty.</p>
            </div>
          )}
        </div>
      </div>

      <Modal 
        item={selectedItem} 
        isOpen={!!selectedItem} 
        onClose={() => setSelectedItem(null)} 
      />
    </div>
  );
};

export default PublicProfile;
