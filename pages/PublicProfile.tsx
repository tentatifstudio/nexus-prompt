import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Settings as SettingsIcon, LayoutGrid, FileText, Info, UserCircle } from 'lucide-react';
import { PromptItem } from '../types';
import { promptService } from '../services/promptService';
import { useAuth } from '../context/AuthContext';
import PromptCard from '../components/PromptCard';
import Modal from '../components/Modal';

const PublicProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<PromptItem | null>(null);

  const isOwner = currentUser?.id === userId;

  useEffect(() => {
    const loadProfileData = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const [profileData, promptData] = await Promise.all([
          promptService.getProfile(userId),
          promptService.getByUserId(userId)
        ]);
        setProfile(profileData);
        setPrompts(promptData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProfileData();
  }, [userId]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>;
  }

  if (!profile) {
    return <div className="text-center py-20 flex flex-col items-center">
      <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-300 mb-6">
        <UserCircle size={48} />
      </div>
      <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Vault Entry Not Found</h2>
      <p className="text-slate-500 mt-2 font-medium">This creator archive doesn't exist or is currently restricted.</p>
      <Link to="/" className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">Return to Hub</Link>
    </div>;
  }

  const username = profile.username || 'Anonymous Member';
  const bio = profile.bio || "Exploring the infinite neural possibilities of Nexus. This creator hasn't documented their bio yet.";
  const avatar = profile.avatar_url || `https://ui-avatars.com/api/?name=${username}&background=random&color=fff&size=200`;

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-12">
       {/* PROFILE HEADER */}
       <div className="mb-20 flex flex-col md:flex-row items-center gap-12 text-center md:text-left">
          <div className="relative">
             <div className="w-32 h-32 md:w-48 md:h-48 rounded-[48px] overflow-hidden bg-white shadow-2xl p-2 border border-slate-100 group transition-all hover:scale-105">
                <img 
                  src={avatar} 
                  className="w-full h-full object-cover rounded-[40px]" 
                  alt={username} 
                />
             </div>
             {profile.is_pro && (
               <div className="absolute -bottom-2 -right-2 bg-amber-400 text-slate-900 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg border-2 border-white">Pro Vault</div>
             )}
          </div>

          <div className="flex-1">
             <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-none">{username}</h1>
                {isOwner && (
                  <Link to="/settings" className="w-fit flex items-center gap-2 px-6 py-2 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl">
                    <SettingsIcon size={14} /> Edit Identity
                  </Link>
                )}
             </div>
             <p className="text-slate-500 font-medium max-w-xl text-lg leading-relaxed mb-8">
               {bio}
             </p>
             <div className="flex items-center justify-center md:justify-start gap-12">
                <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm min-w-[120px]">
                   <span className="block text-3xl font-black text-slate-900">{prompts.length}</span>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Artifacts</span>
                </div>
                <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm min-w-[120px]">
                   <span className="block text-3xl font-black text-slate-900">0</span>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Allies</span>
                </div>
             </div>
          </div>
       </div>

       {/* GALLERY TABS */}
       <div className="mb-12 border-b border-slate-100 flex items-center gap-12">
          <button className="pb-4 border-b-2 border-slate-900 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
             <LayoutGrid size={14} /> Personal Archive
          </button>
       </div>

       {/* GRID */}
       <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          <AnimatePresence mode='popLayout'>
            {prompts.map((item) => (
              <PromptCard 
                key={item.id} 
                item={item} 
                onClick={setSelectedItem} 
              />
            ))}
          </AnimatePresence>
       </div>

       {prompts.length === 0 && (
         <div className="py-32 text-center">
            <div className="inline-flex w-20 h-20 bg-slate-100 rounded-[32px] items-center justify-center text-slate-300 mb-6 border border-slate-200"><FileText size={32} /></div>
            <p className="text-slate-400 font-black uppercase text-xs tracking-widest">The archive is currently empty</p>
            {isOwner && (
              <Link to="/create" className="mt-6 inline-flex items-center gap-2 text-indigo-600 font-bold uppercase text-[10px] tracking-widest hover:underline">
                Start Documenting Artifacts
              </Link>
            )}
         </div>
       )}

       <Modal 
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
       />
    </div>
  );
};

export default PublicProfile;