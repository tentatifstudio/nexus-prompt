
import React, { useState, useMemo, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Loader2, Search, Shield, LogOut, PlusCircle, Settings as SettingsIcon, UserCircle, Crown, AlertCircle } from 'lucide-react';
import { PromptItem } from './types.ts';
import PromptCard from './components/PromptCard.tsx';
import Modal from './components/Modal.tsx';
import HeroCarousel from './components/HeroCarousel.tsx';
import AdminPage from './components/AdminPage.tsx';
import CreatePost from './pages/CreatePost.tsx';
import PublicProfile from './pages/PublicProfile.tsx';
import Settings from './pages/Settings.tsx';
import Login from './pages/Login.tsx';
import TrendingRow from './components/TrendingRow.tsx';
import UpgradeModal from './components/UpgradeModal.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import { promptService } from './services/promptService.ts';
import { useAuth } from './context/AuthContext.tsx';

const ADMIN_EMAIL = 'wahyupedia740@gmail.com';

interface HomeProps {
  onSelectItem: (item: PromptItem) => void;
}

function Home({ onSelectItem }: HomeProps) {
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setDataLoading(true);
      setError(null);
      try {
        const [promptsData, catsData] = await Promise.all([
          promptService.getAll(),
          promptService.getCategories()
        ]);
        
        if (isMounted) {
          setPrompts(promptsData || []);
          setCategories(['All', ...(catsData || [])]);
        }
      } catch (err) {
        console.error("Gallery fetch failed:", err);
        if (isMounted) {
          setError("Failed to load archive. Please refresh.");
        }
      } finally {
        if (isMounted) {
          setDataLoading(false);
        }
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, []);

  const filteredData = useMemo(() => {
    return (prompts || []).filter((item) => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.prompt.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery, prompts]);

  if (dataLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative mb-6">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
          <div className="absolute inset-0 bg-indigo-500/10 blur-xl rounded-full animate-pulse" />
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">Initializing Nexus Gallery</p>
      </div>
    );
  }

  if (error && prompts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6 border border-red-100">
           <AlertCircle size={32} />
        </div>
        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">Archive Offline</h3>
        <p className="text-slate-500 text-sm font-medium mb-8 max-w-xs">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all"
        >
          Try Reconnect
        </button>
      </div>
    );
  }

  return (
    <>
      <HeroCarousel items={prompts.slice(0, 3)} onSelect={onSelectItem} />
      <TrendingRow items={prompts} onSelect={onSelectItem} />
      
      <div className="mb-12 space-y-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Explore community prompts..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full h-16 pl-16 pr-6 rounded-[28px] bg-white border border-slate-100 shadow-xl outline-none focus:ring-4 ring-indigo-500/5 transition-all text-sm font-medium" 
            />
          </div>
          <div className="flex items-center justify-center gap-2 overflow-x-auto no-scrollbar py-2">
            {categories.map((cat) => (
              <button 
                key={cat} 
                onClick={() => setSelectedCategory(cat)} 
                className={`px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-slate-900 text-white shadow-xl' : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'}`}
              >
                {cat}
              </button>
            ))}
          </div>
      </div>

      <motion.div layout className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        <AnimatePresence mode='popLayout'>
          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <PromptCard 
                key={item.id} 
                item={item} 
                onClick={onSelectItem} 
              />
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
               <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">No artifacts found matching your criteria</p>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}

function App() {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PromptItem | null>(null);

  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    setShowSettingsDropdown(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen font-sans text-slate-800 pb-20 relative overflow-x-hidden bg-slate-50">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/50 bg-white/60 backdrop-blur-md">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-slate-900 text-white p-1.5 rounded-lg"><Zap size={18} fill="currentColor" /></div>
            <span className="font-bold text-lg tracking-tight">PROMPT<span className="font-light text-slate-500">NEXUS</span></span>
          </Link>
          
          <div className="flex items-center gap-2 md:gap-4">
             {user && !user.is_pro && (
               <button 
                 onClick={() => setShowUpgradeModal(true)} 
                 className="flex items-center gap-2 bg-amber-100 text-amber-700 border border-amber-200 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-amber-200 transition-all"
               >
                 <Crown size={14} className="animate-pulse" /> <span>Upgrade Pro</span>
               </button>
             )}

             {user && (
               <Link 
                 to="/create"
                 className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-indigo-600 transition-all"
               >
                 <PlusCircle size={14} /> <span className="hidden sm:inline">Upload</span>
               </Link>
             )}
             
             {!user && !authLoading && (
               <Link to="/login" className="px-4 py-2 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest">Sign In</Link>
             )}

             {user && (
               <div className="relative">
                  <button onClick={() => setShowSettingsDropdown(!showSettingsDropdown)} className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm overflow-hidden ring-2 ring-transparent hover:ring-indigo-500 transition-all relative">
                     {user.avatar ? (
                        <img src={user.avatar} className="w-full h-full object-cover" alt="User Avatar" />
                     ) : (
                        <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
                           <UserCircle size={24} />
                        </div>
                     )}
                     {user.is_pro && <div className="absolute top-0 right-0 w-3 h-3 bg-amber-400 border-2 border-white rounded-full" />}
                  </button>
                  <AnimatePresence>
                    {showSettingsDropdown && (
                      <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:10 }} className="absolute right-0 mt-2 w-56 glass-panel rounded-[24px] p-2 shadow-2xl z-[100] border border-white/50 bg-white/95">
                        <div className="px-4 py-3 border-b border-slate-100 mb-1 flex justify-between items-center">
                           <div className="overflow-hidden">
                              <p className="text-xs font-bold truncate">{user.name || 'Anonymous'}</p>
                              <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                           </div>
                           {user.is_pro && (
                             <span className="shrink-0 bg-amber-400 text-slate-900 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter">PRO</span>
                           )}
                        </div>
                        <Link to={`/user/${user.id}`} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                          <UserCircle size={18} className="text-indigo-500" /> My Profile
                        </Link>
                        <Link to="/settings" className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                          <SettingsIcon size={18} className="text-slate-400" /> Settings
                        </Link>
                        {isAdmin && (
                          <Link to="/admin" className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-xl">
                            <Shield size={18} /> Admin Panel
                          </Link>
                        )}
                        <button onClick={() => logout()} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl mt-1">
                          <LogOut size={18} /> Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>
             )}
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-[1600px] mx-auto px-6 pt-28">
        <Routes>
          <Route path="/" element={<Home onSelectItem={setSelectedItem} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/user/:userId" element={<PublicProfile />} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/create" element={<ProtectedRoute><CreatePost onBack={() => navigate(-1)} onSuccess={() => navigate('/')} /></ProtectedRoute>} />
          <Route path="/admin" element={isAdmin ? <AdminPage onBack={() => navigate('/')} onRefresh={() => window.location.reload()} /> : <Home onSelectItem={setSelectedItem} />} />
        </Routes>
      </div>

      <Modal 
        item={selectedItem} 
        isOpen={!!selectedItem} 
        onClose={() => setSelectedItem(null)} 
        onOpenAuth={() => navigate('/login')}
        onOpenPricing={() => setShowUpgradeModal(true)}
      />
      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
    </div>
  );
}

export default App;
