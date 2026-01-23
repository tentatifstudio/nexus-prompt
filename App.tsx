
import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Loader2, Search, UserCircle, PlusCircle, Crown, LogOut, Shield } from 'lucide-react';
import { PromptItem } from './types';
import { promptService } from './services/promptService';
import { useAuth } from './context/AuthContext';
import PromptCard from './components/PromptCard';
import Modal from './components/Modal';
import UpgradeModal from './components/UpgradeModal';
import HeroCarousel from './components/HeroCarousel';
import TrendingRow from './components/TrendingRow';

// Components
import CreatePost from './pages/CreatePost';
import PublicProfile from './pages/PublicProfile';
import Settings from './pages/Settings';
import Login from './pages/Login';
import AdminPage from './components/AdminPage';
import ProtectedRoute from './components/ProtectedRoute';

function HomeGallery({ onSelect }: { onSelect: (item: PromptItem) => void }) {
  const [items, setItems] = useState<PromptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await promptService.getAll();
        if (active) setItems(data);
      } catch (e) {
        console.error("Gallery Load Error", e);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => 
    items.filter(i => i.title.toLowerCase().includes(search.toLowerCase()) || i.prompt.toLowerCase().includes(search.toLowerCase()))
  , [items, search]);

  if (loading) return (
    <div className="py-20 flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Syncing Nexus Archive...</p>
    </div>
  );

  return (
    <div className="space-y-12">
      <HeroCarousel items={items.slice(0, 3)} onSelect={onSelect} />
      <TrendingRow items={items} onSelect={onSelect} />
      
      <div className="relative max-w-xl mx-auto mb-12">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Search for prompts..." 
          className="w-full h-14 pl-14 pr-6 rounded-2xl bg-white border border-slate-100 shadow-sm focus:ring-2 ring-indigo-500/20 outline-none transition-all font-medium text-sm"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filtered.map(item => <PromptCard key={item.id} item={item} onClick={onSelect} />)}
      </div>
    </div>
  );
}

export default function App() {
  const { user, loading: authLoading, logout } = useAuth();
  const [selected, setSelected] = useState<PromptItem | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      <nav className="fixed top-0 inset-x-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 z-50">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-slate-900 text-white p-1 rounded-lg"><Zap size={16} fill="white" /></div>
            <span className="font-black text-sm tracking-tighter uppercase">Prompt<span className="text-indigo-600">Nexus</span></span>
          </Link>

          <div className="flex items-center gap-4">
            {user?.is_pro ? (
              <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border border-amber-200">Pro Member</span>
            ) : user && (
              <button onClick={() => setShowUpgrade(true)} className="bg-slate-900 text-white px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-600 transition-all">
                <Crown size={12} /> Upgrade
              </button>
            )}
            
            {!user && !authLoading && <Link to="/login" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900">Sign In</Link>}
            
            {user && (
              <div className="flex items-center gap-4">
                <Link to="/create" className="p-2 hover:bg-slate-50 rounded-xl transition-colors"><PlusCircle size={20} className="text-slate-400" /></Link>
                <button onClick={() => logout()} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-colors"><LogOut size={20} /></button>
                <Link to={`/user/${user.id}`} className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200">
                  <img src={user.avatar} className="w-full h-full object-cover" alt="Me" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-24">
        <Routes>
          <Route path="/" element={<HomeGallery onSelect={setSelected} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/user/:userId" element={<PublicProfile />} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/create" element={<ProtectedRoute><CreatePost onBack={() => navigate(-1)} onSuccess={() => navigate('/')} /></ProtectedRoute>} />
          <Route path="/admin" element={user?.email === 'wahyupedia740@gmail.com' ? <AdminPage onBack={() => navigate('/')} onRefresh={() => {}} /> : <HomeGallery onSelect={setSelected} />} />
        </Routes>
      </main>

      <Modal item={selected} isOpen={!!selected} onClose={() => setSelected(null)} onOpenPricing={() => setShowUpgrade(true)} />
      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </div>
  );
}
