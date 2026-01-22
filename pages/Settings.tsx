
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Loader2, User, Camera, Zap, Terminal, FileText, CheckCircle } from 'lucide-react';
import { promptService } from '../services/promptService';
import { useAuth } from '../context/AuthContext';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    username: '',
    bio: ''
  });

  useEffect(() => {
    if (user) {
      promptService.getProfile(user.id).then(profile => {
        if (profile) {
          setFormData({
            username: profile.username || '',
            bio: profile.bio || ''
          });
          setAvatarPreview(profile.avatar_url);
        }
      });
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
      let avatarUrl = avatarPreview;
      if (avatarFile) {
        const uploadedUrl = await promptService.uploadAvatar(avatarFile);
        if (uploadedUrl) avatarUrl = uploadedUrl;
      }

      await promptService.updateProfile(user.id, {
        username: formData.username,
        bio: formData.bio,
        avatar_url: avatarUrl
      });

      await refreshUser();
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        navigate(`/user/${user.id}`);
      }, 2000);
    } catch (err) {
      console.error(err);
      alert("Gagal memperbarui profil.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 px-6">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/50 bg-white/60 backdrop-blur-md">
         <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-slate-900 text-white p-1.5 rounded-lg"><Zap size={18} fill="currentColor" /></div>
              <span className="font-bold text-lg tracking-tight">PROMPT<span className="font-light text-slate-500">NEXUS</span></span>
            </Link>
         </div>
      </header>

      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <button onClick={() => navigate(-1)} className="p-3 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Settings Center</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Configure your nexus identity</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* AVATAR UPLOAD SECTION */}
          <div className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-100 flex flex-col items-center">
             <div className="relative group mb-6">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-[48px] overflow-hidden bg-slate-100 border-4 border-white shadow-2xl relative">
                   {avatarPreview ? (
                     <img src={avatarPreview} className="w-full h-full object-cover" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-slate-300"><User size={64}/></div>
                   )}
                   <label className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-[2px]">
                      <Camera className="text-white" size={32} />
                      <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                   </label>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-2 rounded-xl shadow-lg border-2 border-white"><Camera size={16}/></div>
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Change Profile Identity</p>
          </div>

          {/* FIELDS SECTION */}
          <div className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-100 space-y-8">
             <div>
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                  <Terminal size={14} className="text-indigo-500"/> Display Username
                </label>
                <input 
                  type="text"
                  required
                  placeholder="The Master Creator"
                  className="w-full bg-slate-50 border-none rounded-2xl p-5 font-bold text-slate-800 outline-none focus:ring-4 ring-indigo-500/10 transition-all"
                  value={formData.username}
                  onChange={e => setFormData({...formData, username: e.target.value})}
                />
             </div>

             <div>
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                  <FileText size={14} className="text-indigo-500"/> Creator Biography
                </label>
                <textarea 
                  placeholder="Tell the community about your craft..."
                  className="w-full bg-slate-50 border-none rounded-2xl p-5 font-medium text-sm h-32 outline-none focus:ring-4 ring-indigo-500/10 transition-all"
                  value={formData.bio}
                  onChange={e => setFormData({...formData, bio: e.target.value})}
                />
             </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-6 rounded-[32px] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-2xl ${success ? 'bg-green-600' : 'bg-slate-900 hover:bg-indigo-600'} text-white disabled:opacity-50`}
          >
            {loading ? <Loader2 className="animate-spin" /> : (success ? <CheckCircle /> : <Save size={20} />)}
            {loading ? 'Synchronizing...' : (success ? 'Profile Updated' : 'Save Changes')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
