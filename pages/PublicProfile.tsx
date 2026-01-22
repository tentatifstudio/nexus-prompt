
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
    return <div className="text-center py-20"><h2 className="text-2xl font-bold">Creator not found.</h2></div>;
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-12">
       {/* PROFILE HEADER */}
       <div className="mb-20 flex flex-col md:flex-row items-center gap-12 text-center md:text-left">
          <div className="relative">
             <div className="w-32 h-32 md:w-48 md:h-48 rounded-[48px] overflow-hidden bg-white shadow-2xl p-2 border border-slate-100">
                {profile.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    className="w-full h-full object-cover rounded-[40px]" 
                    alt="Profile" 
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300 rounded-[40px]">
                    <UserCircle size={80} />
                  </div>
                )}
             </div>
             {profile.is_pro && (
               <div className="absolute -bottom-2 -right-2 bg-amber-400 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg border-2 border-white">Pro</div>
             )}
          </div>

          <div className="flex-1">
             <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">{profile.username || 'Anonymous'}</h1>
                {isOwner && (
                  <Link to="/settings" className="w-fit flex items-center gap-2 px-6 py-2 rounded-full bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
                    <SettingsIcon size={14} /> Edit Profile
                  </Link>
                )}
             </div>
             <p className="text-slate-500 font-medium max-w-xl text-lg leading-relaxed mb-8">
               {profile.bio || "This creator hasn't written a bio yet. Exploring the infinite possibilities of Nexus."}
             </p>
             <div className="flex items-center justify-center md:justify-start gap-8">
                <div>
                   <span className="block text-2xl font-black text-slate-900">{prompts.length}</span>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Creations</span>
                </div>
                <div>
                   <span className="block text-2xl font-black text-slate-900">0</span>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Followers</span>
                </div>
             </div>
          </div>
       </div>

       {/* GALLERY TABS */}
       <div className="mb-12 border-b border-slate-100 flex items-center gap-12">
          <button className="pb-4 border-b-2 border-slate-900 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
             <LayoutGrid size={14} /> All Gallery
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
            <div className="inline-flex w-16 h-16 bg-slate-100 rounded-3xl items-center justify-center text-slate-300 mb-4"><FileText size={32} /></div>
            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No public assets yet</p>
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
