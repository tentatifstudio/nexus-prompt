
import React, { useState, useEffect } from 'react';
import { Upload, ArrowLeft, Loader2, Sparkles, Image as ImageIcon, Sliders, Type, Terminal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { promptService } from '../services/promptService';

interface CreatePostProps {
  onBack: () => void;
  onSuccess: () => void;
}

const MODELS = ['Flux', 'ImageFX', 'Midjourney', 'Stable Diffusion XL', 'DALL-E 3'];
const ASPECT_RATIOS = ['1:1', '4:5', '16:9', '9:16', '2:3'];

const CreatePost: React.FC<CreatePostProps> = ({ onBack, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    prompt: '',
    model: 'Flux',
    category: '',
    aspect_ratio: '1:1',
    description: '',
    seed: Math.floor(Math.random() * 1000000000),
    guidance_scale: 7.5
  });

  useEffect(() => {
    const fetchCats = async () => {
      const cats = await promptService.getCategories();
      setCategories(cats);
    };
    fetchCats();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selected);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("You must be logged in to post.");
    if (!file) return alert("Please upload your result image.");
    if (!formData.category) return alert("Please select a category.");

    setLoading(true);
    try {
      const imageUrl = await promptService.uploadImage(file);
      if (!imageUrl) throw new Error("Upload failed");

      await promptService.createPrompt({
        user_id: user.id,
        title: formData.title,
        prompt: formData.prompt,
        image_result: imageUrl,
        model: formData.model,
        category: formData.category,
        aspect_ratio: formData.aspect_ratio,
        seed: Number(formData.seed),
        guidance_scale: Number(formData.guidance_scale),
        description: formData.description,
        type: 'TXT2IMG',
        rarity: 'Common',
        is_premium: false,
        is_trending: false
      });

      onSuccess();
    } catch (err) {
      alert("Failed to share creation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
       <button onClick={onBack} className="mb-8 flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Back to Gallery</span>
       </button>

       <div className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 mb-2">Share your creation</h1>
          <p className="text-slate-500 font-medium">Join the Nexus community and inspire other creators.</p>
       </div>

       <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
             <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Upload Result</label>
                <label className={`relative block aspect-[4/5] rounded-[32px] border-2 border-dashed transition-all overflow-hidden cursor-pointer ${preview ? 'border-transparent' : 'border-slate-200 hover:border-indigo-400 bg-slate-50'}`}>
                   {preview ? (
                     <img src={preview} className="w-full h-full object-cover" alt="Preview" />
                   ) : (
                     <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                        <ImageIcon size={32} className="mb-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Drop Image Here</span>
                     </div>
                   )}
                   <input type="file" required className="hidden" onChange={handleFileChange} accept="image/*" />
                </label>
             </div>

             <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Short Context</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Tell us a bit about this image..."
                  className="w-full h-32 p-6 rounded-3xl bg-white border border-slate-100 shadow-sm outline-none focus:ring-4 ring-indigo-500/5 transition-all text-sm font-medium"
                />
             </div>
          </div>

          <div className="space-y-8">
             <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl space-y-6">
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 flex items-center gap-2"><Type size={14}/> Asset Title</label>
                   <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Neon Samurai" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none text-sm font-bold" />
                </div>

                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 flex items-center gap-2"><Terminal size={14}/> The Prompt</label>
                   <textarea required value={formData.prompt} onChange={e => setFormData({...formData, prompt: e.target.value})} placeholder="Paste your magic here..." className="w-full h-40 p-6 rounded-2xl bg-slate-900 text-indigo-300 font-mono text-xs leading-relaxed outline-none" />
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
                         <option value="">Select</option>
                         {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                   </div>
                </div>

                <button disabled={loading} type="submit" className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200">
                   {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                   {loading ? 'Sharing to Nexus...' : 'Publish to Gallery'}
                </button>
             </div>
          </div>
       </form>
    </div>
  );
};

export default CreatePost;
