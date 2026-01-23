import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Loader2, Save, ArrowLeft, UserCircle, Shield, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { promptService } from '../services/promptService';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    username: '',
    bio: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.name || '',
        bio: user.bio || ''
      });
      setAvatarPreview(user.avatar);
    }
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    
    try {
      let finalAvatarUrl = user.avatar;
      
      // Upload avatar if changed
      if (avatarFile) {
        const uploadedUrl = await promptService.uploadImage(avatarFile, 'avatars');
        if (uploadedUrl) finalAvatarUrl = uploadedUrl;
      }

      // Update core profile data
      await promptService.updateProfile(user.id, {
        username: formData.username,
        bio: formData.bio,
        avatar_url: finalAvatarUrl
      });

      // Synchronize with AuthContext
      await refreshUser();
      
      alert("Profile Identity successfully updated in the Nexus Registry!");
    } catch (err: any) {
      console.error("Profile update error:", err);
      alert("Nexus Registry update failed: " + (err.message || "Unknown communication error."));
    } finally {
      // CRITICAL: Always release loading state to prevent infinite spinner
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
       <button onClick={() => navigate(-1)} className="mb-12 flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Profile Settings</span>
       </button>

       <form onSubmit={handleSubmit} className="space-y-12">
          {/* AVATAR SECTION */}
          <section className="flex flex-col items-center text-center">
             <div className="relative group cursor-pointer mb-6">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-[48px] bg-slate-100 overflow-hidden border-4 border-white shadow-2xl relative">
                   <img src={avatarPreview || `https://ui-avatars.com/api/?background=random&color=fff&name=${user?.name || 'U'}`} className="w-full h-full object-cover" alt="Avatar" />
                   <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <Camera size={24} />
                   </div>
                </div>
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleAvatarChange} />
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Profile Identity</p>
          </section>

          {/* BASIC INFO */}
          <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-xl space-y-8">
             <div className="flex items-center gap-3 mb-2">
                <UserCircle size={20} className="text-indigo-500" />
                <h3 className="text-lg font-black uppercase tracking-tight">Public Presence</h3>
             </div>

             <div className="space-y-6">
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Nexus Username</label>
                   <input 
                     required 
                     value={formData.username} 
                     onChange={e => setFormData({...formData, username: e.target.value})} 
                     className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-sm"
                     placeholder="Your unique handle"
                   />
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Creative Bio</label>
                   <textarea 
                     value={formData.bio} 
                     onChange={e => setFormData({...formData, bio: e.target.value})} 
                     className="w-full h-32 px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-medium text-sm"
                     placeholder="Tell the world who you are..."
                   />
                </div>
             </div>
          </div>

          {/* ACCOUNT TYPE */}
          <div className="bg-slate-900 rounded-[32px] p-8 text-white space-y-6">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <Shield size={20} className="text-indigo-400" />
                   <h3 className="text-lg font-black uppercase tracking-tight">Plan & Account</h3>
                </div>
                <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user?.is_pro ? 'bg-amber-400 text-slate-900' : 'bg-slate-800 text-slate-400'}`}>
                   {user?.plan} Membership
                </span>
             </div>
             <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white"><CreditCard size={20}/></div>
                   <div>
                      <p className="text-xs font-bold">{user?.plan === 'pro' ? 'Unlimited Access Active' : 'Basic Member'}</p>
                      <p className="text-[10px] text-slate-500 font-medium">Synced with Nexus Registry</p>
                   </div>
                </div>
                {!user?.is_pro && <button type="button" className="text-[10px] font-black uppercase text-indigo-400 hover:text-indigo-300">Upgrade</button>}
             </div>
          </div>

          <button 
            disabled={loading} 
            type="submit" 
            className="w-full py-6 bg-slate-900 text-white rounded-[32px] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all shadow-2xl shadow-slate-200"
          >
             {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
             {loading ? 'Saving Changes...' : 'Save Profile Identity'}
          </button>
       </form>
    </div>
  );
};

export default Settings;