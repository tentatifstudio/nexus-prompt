import React, { useState, useEffect } from 'react';
import { Upload, ArrowLeft, Loader2, Sparkles, Image as ImageIcon, Type, Terminal, Info, Lock, Zap } from 'lucide-react';
// Fix: Added missing motion import from framer-motion
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { promptService } from '../services/promptService';

interface CreatePostProps {
  onBack: () => void;
  onSuccess: () => void;
}

const ADMIN_EMAIL = "wahyupedia740@gmail.com";
const MODELS = ['Flux', 'ImageFX', 'Midjourney', 'Stable Diffusion XL', 'DALL-E 3'];
const FALLBACK_CATEGORIES = ['Character', 'Cyberpunk', 'Realistic', 'Illustration', '3D Render', 'Photography', 'Abstract'];

const CreatePost: React.FC<CreatePostProps> = ({ onBack, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [catsLoading, setCatsLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>(FALLBACK_CATEGORIES);
  
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [beforePreview, setBeforePreview] = useState<string | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [afterPreview, setAfterPreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    prompt: '',
    model: 'Flux',
    category: '',
    aspect_ratio: '1:1',
    description: '',
    seed: Math.floor(Math.random() * 1000000000),
    guidance_scale: 7.5,
    is_premium: false // Added premium status
  });

  const isSuperAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    const fetchCats = async () => {
      setCatsLoading(true);
      try {
        const cats = await promptService.getCategories();
        if (cats && cats.length > 0) {
          setCategories(cats);
        }
      } catch (err) {
        console.error("Dropdown loading error:", err);
      } finally {
        setCatsLoading(false);
      }
    };
    fetchCats();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (type === 'before') {
        setBeforeFile(selected);
        const reader = new FileReader();
        reader.onloadend = () => setBeforePreview(reader.result as string);
        reader.readAsDataURL(selected);
      } else {
        setAfterFile(selected);
        const reader = new FileReader();
        reader.onloadend = () => setAfterPreview(reader.result as string);
        reader.readAsDataURL(selected);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("You must be logged in to post.");
    if (!afterFile) return alert("Please upload your result image (After).");
    if (!formData.category) return alert("Please select a category.");

    setLoading(true);
    try {
      const afterUrl = await promptService.uploadImage(afterFile);
      if (!afterUrl) throw new Error("Result upload failed");

      let beforeUrl = null;
      if (beforeFile) {
        beforeUrl = await promptService.uploadImage(beforeFile);
      }

      // User posts are always free unless posted by Super Admin
      const finalPremiumStatus = isSuperAdmin ? formData.is_premium : false;

      await promptService.createPrompt({
        user_id: user.id,
        title: formData.title,
        prompt: formData.prompt,
        image_result_url: afterUrl,
        image_source_url: beforeUrl,
        model: formData.model,
        category: formData.category,
        aspect_ratio: formData.aspect_ratio,
        seed: Number(formData.seed),
        guidance_scale: Number(formData.guidance_scale),
        description: formData.description,
        type: beforeUrl ? 'IMG2IMG' : 'TXT2IMG',
        rarity: finalPremiumStatus ? 'Legendary' : 'Common',
        is_premium: finalPremiumStatus,
        is_trending: false
      });

      onSuccess();
    } catch (err) {
      console.error(err);
      alert("Failed to share creation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
       <button onClick={onBack} className="mb-8 flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Back to Gallery</span>
       </button>

       <div className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 mb-2">Share your creation</h1>
          <p className="text-slate-500 font-medium">Join the Nexus community and inspire other creators.</p>
       </div>

       <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Input 1: Face / Reference</label>
                    <span className="text-[8px] font-bold text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded">Optional</span>
                  </div>
                  <label className={`relative block aspect-[4/5] rounded-[32px] border-2 border-dashed transition-all overflow-hidden cursor-pointer ${beforePreview ? 'border-transparent' : 'border-slate-200 hover:border-indigo-400 bg-slate-50'}`}>
                     {beforePreview ? (
                       <img src={beforePreview} className="w-full h-full object-cover" alt="Before Preview" />
                     ) : (
                       <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300">
                          <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4"><ImageIcon size={24} className="text-slate-300" /></div>
                          <span className="text-[9px] font-black uppercase tracking-widest">Upload Original Photo</span>
                       </div>
                     )}
                     <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'before')} accept="image/*" />
                  </label>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block">Input 2: AI Result</label>
                    <span className="text-[8px] font-bold text-indigo-500 uppercase bg-indigo-50 px-2 py-0.5 rounded">Required</span>
                  </div>
                  <label className={`relative block aspect-[4/5] rounded-[32px] border-2 border-dashed transition-all overflow-hidden cursor-pointer ${afterPreview ? 'border-transparent' : 'border-indigo-200 bg-indigo-50/30'}`}>
                     {afterPreview ? (
                       <img src={afterPreview} className="w-full h-full object-cover" alt="After Preview" />
                     ) : (
                       <div className="absolute inset-0 flex flex-col items-center justify-center text-indigo-300">
                          <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4"><Sparkles size={24} className="text-indigo-300" /></div>
                          <span className="text-[9px] font-black uppercase tracking-widest">Upload AI Generated</span>
                       </div>
                     )}
                     <input type="file" required className="hidden" onChange={(e) => handleFileChange(e, 'after')} accept="image/*" />
                  </label>
                </div>
             </div>

             <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Short Context</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Tell us a bit about this transformation..."
                  className="w-full h-32 p-6 rounded-3xl bg-white border border-slate-100 shadow-sm outline-none focus:ring-4 ring-indigo-500/5 transition-all text-sm font-medium"
                />
             </div>
          </div>

          <div className="lg:col-span-5 space-y-8">
             <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl space-y-6">
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 flex items-center gap-2"><Type size={14}/> Asset Title</label>
                   <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. My AI Transformation" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold" />
                </div>

                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 flex items-center gap-2"><Terminal size={14}/> The Prompt</label>
                   <textarea required value={formData.prompt} onChange={e => setFormData({...formData, prompt: e.target.value})} placeholder="Describe how you made this..." className="w-full h-40 p-6 rounded-2xl bg-slate-900 text-indigo-300 font-mono text-xs leading-relaxed outline-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">AI Model</label>
                      <select value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-black uppercase outline-none">
                         {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                   </div>
                   <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Category</label>
                      <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-black uppercase outline-none">
                         <option value="">{catsLoading ? 'Loading segments...' : 'Select Segment'}</option>
                         {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                   </div>
                </div>

                {isSuperAdmin && (
                   <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group hover:border-indigo-200 transition-colors">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                            <Lock size={18} />
                         </div>
                         <div>
                            <p className="text-[10px] font-black text-slate-900 uppercase">Premium Content</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase">Super Admin Only Feature</p>
                         </div>
                      </div>
                      <button 
                         type="button"
                         onClick={() => setFormData({...formData, is_premium: !formData.is_premium})}
                         className={`w-12 h-6 rounded-full relative transition-all ${formData.is_premium ? 'bg-indigo-600' : 'bg-slate-300'}`}
                      >
                         <motion.div 
                           animate={{ x: formData.is_premium ? 24 : 4 }}
                           className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                         />
                      </button>
                   </div>
                )}

                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-start gap-3">
                   <Info size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                   <p className="text-[10px] font-medium text-indigo-700 leading-relaxed">
                     Assets with comparison images get 4x more visibility on the home feed!
                   </p>
                </div>

                <button disabled={loading} type="submit" className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200">
                   {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                   {loading ? 'Publishing Identity...' : 'Release to Nexus'}
                </button>
             </div>
          </div>
       </form>
    </div>
  );
};

export default CreatePost;