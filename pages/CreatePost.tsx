
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Sparkles, Loader2, ArrowLeft, Image as ImageIcon, Terminal, Layers } from 'lucide-react';
import { promptService } from '../services/promptService';
import { useAuth } from '../context/AuthContext';

interface CreatePostProps {
  onBack: () => void;
  onSuccess: () => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ onBack, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    prompt: '',
    category: '',
    model: 'Flux',
    aspect_ratio: '1:1'
  });

  useEffect(() => {
    promptService.getCategories().then(setCategories);
  }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(f);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !file) return;

    setLoading(true);
    try {
      const url = await promptService.uploadImage(file);
      if (!url) throw new Error("Upload failed");

      await promptService.createPrompt({
        ...formData,
        image_result: url,
        user_id: user.id,
        is_premium: false,
        is_trending: false,
        rarity: 'Common',
        seed: Math.floor(Math.random() * 999999),
        guidance_scale: 7.5
      });

      onSuccess();
    } catch (err) {
      alert("Gagal membagikan karya.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <button onClick={onBack} className="p-2 hover:bg-white rounded-xl transition-colors"><ArrowLeft size={24} /></button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">BAGIKAN KARYA <span className="text-indigo-600 font-light">/ Share Prompt</span></h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Show the community what you've built</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* IMAGE UPLOAD */}
          <div className="relative group">
            <label className={`block relative h-96 rounded-[40px] border-4 border-dashed border-slate-200 bg-white overflow-hidden cursor-pointer transition-all ${!preview && 'hover:border-indigo-500 hover:bg-indigo-50/30'}`}>
              {preview ? (
                <img src={preview} className="w-full h-full object-cover" alt="Preview" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                  <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mb-4"><ImageIcon size={32} /></div>
                  <p className="text-sm font-black uppercase tracking-widest">Pilih Gambar Hasil / Final Result</p>
                  <p className="text-[10px] mt-2 font-bold opacity-50">JPG, PNG, WebP (Max 5MB)</p>
                </div>
              )}
              <input type="file" className="hidden" accept="image/*" onChange={handleFile} required />
            </label>
            {preview && (
              <button type="button" onClick={() => {setFile(null); setPreview(null);}} className="absolute top-4 right-4 bg-slate-900 text-white p-2 rounded-full shadow-xl"><X size={16} /></button>
            )}
          </div>

          <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Judul Karya / Title</label>
              <input 
                required 
                placeholder="Give your prompt a cool name..."
                className="w-full bg-slate-50 border-none rounded-2xl p-5 font-bold outline-none focus:ring-2 ring-indigo-500/20"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Instruksi Prompt / Secret Prompt</label>
              <textarea 
                required 
                placeholder="Paste the full AI generation prompt here..."
                className="w-full bg-slate-50 border-none rounded-2xl p-5 font-mono text-xs h-32 outline-none focus:ring-2 ring-indigo-500/20"
                value={formData.prompt}
                onChange={e => setFormData({...formData, prompt: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Kategori / Style</label>
                <select 
                  required
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-xs"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Model AI / AI Engine</label>
                <select 
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-xs"
                  value={formData.model}
                  onChange={e => setFormData({...formData, model: e.target.value})}
                >
                  <option value="Flux">Flux.1</option>
                  <option value="Midjourney">Midjourney v6</option>
                  <option value="SDXL">Stable Diffusion XL</option>
                  <option value="DALL-E 3">DALL-E 3</option>
                </select>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-6 rounded-[30px] bg-slate-900 text-white font-black uppercase tracking-widest text-sm shadow-2xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
            {loading ? 'Mengirim...' : 'Publish to Nexus Community'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
