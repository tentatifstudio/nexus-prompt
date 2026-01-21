
import React, { useState, useEffect } from 'react';
import { 
  Upload, Check, Loader2, Sparkles, TrendingUp, 
  Hash, ArrowLeft, Image as ImageIcon, Dice5, Sliders, 
  Terminal, FileText, Layout, Info, Trash2, Shield, Settings, AlertTriangle
} from 'lucide-react';
import { promptService } from '../services/promptService';
import { useAuth } from '../context/AuthContext';

interface AdminPageProps {
  onBack: () => void;
  onRefresh: () => void;
}

const ADMIN_EMAIL = 'wahyupedia740@gmail.com';
const MODELS = ['Flux', 'ImageFX', 'Midjourney', 'Stable Diffusion', 'DALL-E 3', 'Stable Diffusion XL'];
const RARITIES = ['Common', 'Rare', 'Legendary'];
const ASPECT_RATIOS = ['1:1', '4:5', '16:9', '9:16', '2:3', '3:2'];

const AdminPage: React.FC<AdminPageProps> = ({ onBack, onRefresh }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [files, setFiles] = useState<{ before?: File, after?: File }>({});
  const [previews, setPreviews] = useState<{ before?: string, after?: string }>({});
  const [categories, setCategories] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    prompt: '',
    model: 'Flux',
    type: 'TXT2IMG',
    category: '', 
    rarity: 'Common',
    is_premium: false,
    is_trending: false,
    trending_rank: '' as string | number,
    aspect_ratio: '1:1',
    description: '',
    seed: Math.floor(Math.random() * 1000000000),
    guidance_scale: 7.5
  });

  // Strict Security Check
  if (user?.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center text-red-500 mb-6 border border-red-500/20">
          <AlertTriangle size={40} />
        </div>
        <h1 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Access Denied</h1>
        <p className="text-slate-400 max-w-xs text-sm mb-8 leading-relaxed">This terminal is restricted to Nexus Administration. Unauthorized access attempts are logged.</p>
        <button onClick={onBack} className="bg-white text-black px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">Return Home</button>
      </div>
    );
  }

  useEffect(() => {
    const fetchCats = async () => {
      const data = await promptService.getCategories();
      setCategories(data);
    };
    fetchCats();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    const file = e.target.files?.[0];
    if (file) {
      setFiles(prev => ({ ...prev, [type]: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => ({ ...prev, [type]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const randomizeSeed = () => {
    setFormData(prev => ({ ...prev, seed: Math.floor(Math.random() * 1000000000) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files.after) return alert("Final image is required.");
    if (!formData.category) return alert("Select a category.");
    
    setLoading(true);
    try {
      const imageAfterUrl = await promptService.uploadImage(files.after);
      const imageBeforeUrl = files.before ? await promptService.uploadImage(files.before) : null;

      if (!imageAfterUrl) throw new Error("Storage failure.");

      await promptService.createPrompt({
        title: formData.title,
        prompt: formData.prompt,
        image_result: imageAfterUrl,
        image_source: imageBeforeUrl,
        model: formData.model,
        type: formData.type,
        category: formData.category,
        rarity: formData.rarity,
        is_premium: formData.is_premium,
        is_trending: formData.is_trending,
        trending_rank: formData.trending_rank === '' ? null : Number(formData.trending_rank),
        aspect_ratio: formData.aspect_ratio,
        seed: Number(formData.seed),
        guidance_scale: Number(formData.guidance_scale),
        description: formData.description
      });

      setSuccess(true);
      onRefresh();
      setTimeout(() => {
        setSuccess(false);
        setFormData({
            ...formData,
            title: '',
            prompt: '',
            description: '',
            trending_rank: '',
            is_premium: false,
            is_trending: false,
            seed: Math.floor(Math.random() * 1000000000)
        });
        setFiles({});
        setPreviews({});
      }, 2000);
    } catch (err) {
      console.error(err);
      alert("Publication failed. Check your Supabase configuration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-32">
      <header className="sticky top-0 z-[60] border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
           <div className="flex items-center gap-6">
              <button onClick={onBack} className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors group border border-white/5">
                 <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                    <Shield size={16} className="text-indigo-400" />
                    <h1 className="text-2xl font-black tracking-tight uppercase">Nexus Controller</h1>
                </div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Administrator Level Access</p>
              </div>
           </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-12">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-8 space-y-8">
            <section className="bg-white/[0.03] border border-white/10 rounded-[32px] p-8">
               <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-indigo-600/20 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20"><ImageIcon size={20}/></div>
                  <h3 className="text-xl font-black uppercase tracking-tight">Visual Repository</h3>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Initial Source</label>
                    <label className={`flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-[24px] cursor-pointer transition-all overflow-hidden ${previews.before ? 'border-transparent bg-slate-900' : 'border-white/10 hover:border-indigo-500/50 bg-white/5'}`}>
                        {previews.before ? <img src={previews.before} className="w-full h-full object-cover" /> : <Upload size={20} className="text-slate-500" />}
                        <input type="file" className="hidden" onChange={e => handleFileChange(e, 'before')} />
                    </label>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Final Result *</label>
                    <label className={`flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-[24px] cursor-pointer transition-all overflow-hidden ${previews.after ? 'border-transparent bg-slate-900' : 'border-indigo-500/20 bg-indigo-500/5'}`}>
                        {previews.after ? <img src={previews.after} className="w-full h-full object-cover" /> : <Upload size={20} className="text-indigo-400" />}
                        <input type="file" required className="hidden" onChange={e => handleFileChange(e, 'after')} />
                    </label>
                  </div>
               </div>
            </section>

            <section className="bg-slate-900 border border-white/10 rounded-[32px] p-8">
               <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400"><Terminal size={20}/></div>
                  <h3 className="text-xl font-black uppercase tracking-tight">Prompt Protocol</h3>
               </div>
               <input 
                  required
                  placeholder="Asset Title (e.g. Cyberpunk City)"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-slate-950 border border-white/5 rounded-2xl p-6 mb-6 text-sm font-bold outline-none focus:border-indigo-500"
               />
               <textarea 
                  required 
                  value={formData.prompt} 
                  onChange={e => setFormData({...formData, prompt: e.target.value})} 
                  className="w-full bg-slate-950 text-indigo-300 font-mono text-xs p-8 rounded-[24px] h-48 outline-none border border-white/5 focus:border-indigo-500/40" 
                  placeholder="Paste AI prompt here..."
               />
            </section>
          </div>

          <div className="xl:col-span-4 space-y-8">
            <section className="bg-white/[0.03] border border-white/10 rounded-[32px] p-8">
               <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-purple-600/20 rounded-2xl flex items-center justify-center text-purple-400"><Sliders size={20}/></div>
                  <h3 className="text-lg font-black uppercase tracking-tight">Technical Matrix</h3>
               </div>

               <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">AI Model</label>
                    <div className="grid grid-cols-2 gap-2">
                        {MODELS.map(m => (
                            <button key={m} type="button" onClick={() => setFormData({...formData, model: m})} className={`px-2 py-2.5 rounded-xl text-[10px] font-bold border ${formData.model === m ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-900 border-white/5 text-slate-500'}`}>{m}</button>
                        ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Aspect Ratio</label>
                    <div className="grid grid-cols-3 gap-2">
                        {ASPECT_RATIOS.map(ratio => (
                            <button key={ratio} type="button" onClick={() => setFormData({...formData, aspect_ratio: ratio})} className={`py-2 rounded-xl text-[10px] font-black border ${formData.aspect_ratio === ratio ? 'bg-white text-black' : 'bg-slate-900 border-white/5 text-slate-600'}`}>{ratio}</button>
                        ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center"><label className="text-[10px] font-black text-slate-500 uppercase">Guidance Scale</label><span className="text-xs text-indigo-400 font-bold">{formData.guidance_scale}</span></div>
                    <input type="range" min="1" max="20" step="0.1" value={formData.guidance_scale} onChange={e => setFormData({...formData, guidance_scale: Number(e.target.value)})} className="w-full accent-indigo-500" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Seed</label>
                    <div className="relative">
                       <input type="number" value={formData.seed} onChange={e => setFormData({...formData, seed: e.target.value})} className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-xs font-mono" />
                       <button type="button" onClick={randomizeSeed} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-white/5"><Dice5 size={14} /></button>
                    </div>
                  </div>
               </div>
            </section>

            <section className="bg-white/[0.03] border border-white/10 rounded-[32px] p-8">
               <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-2">Category</label>
                    <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-4 text-xs font-bold outline-none">
                        <option value="">Select Segment</option>
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>

                  <div className="flex gap-2">
                    {RARITIES.map(r => (
                        <button key={r} type="button" onClick={() => setFormData({...formData, rarity: r})} className={`flex-1 py-3 rounded-xl text-[10px] font-bold border ${formData.rarity === r ? 'bg-white text-black' : 'bg-slate-900 border-white/5 text-slate-600'}`}>{r}</button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <button type="button" onClick={() => setFormData({...formData, is_trending: !formData.is_trending})} className={`p-4 rounded-2xl border transition-all text-[10px] font-black uppercase ${formData.is_trending ? 'bg-amber-600/20 border-amber-500' : 'bg-slate-900 border-white/5 text-slate-700'}`}>Trending</button>
                     <input type="number" placeholder="Rank (1-10)" value={formData.trending_rank} onChange={e => setFormData({...formData, trending_rank: e.target.value})} className="bg-slate-900 border border-white/5 rounded-2xl p-4 text-xs font-bold outline-none" />
                  </div>
               </div>
            </section>

            <button disabled={loading} className={`w-full py-6 rounded-[32px] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${success ? 'bg-green-600' : 'bg-indigo-600 hover:bg-indigo-500'} disabled:opacity-50`}>
                {loading ? <Loader2 className="animate-spin" /> : (success ? <Check /> : <Sparkles size={20} />)}
                {loading ? 'Processing...' : (success ? 'Published' : 'Publish Asset')}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default AdminPage;
