
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Loader2, Settings, Filter, Search, Shield, LogOut, LogIn, User as UserIcon, AlertCircle, RefreshCw } from 'lucide-react';
import { PromptItem } from './types';
import PromptCard from './components/PromptCard';
import Modal from './components/Modal';
import HeroCarousel from './components/HeroCarousel';
import AdminPage from './components/AdminPage';
import TrendingRow from './components/TrendingRow';
import SignInModal from './components/SignInModal';
import { promptService } from './services/promptService';
import { useAuth } from './context/AuthContext';

const ADMIN_EMAIL = 'wahyupedia740@gmail.com';
const FREE_VIEW_LIMIT = 2;

function App() {
  const { user, signInWithGoogle, logout, loading: authLoading } = useAuth();
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const [currentView, setCurrentView] = useState<'home' | 'admin'>('home');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<PromptItem | null>(null);
  
  const [viewCount, setViewCount] = useState<number>(() => {
    const saved = localStorage.getItem('nexus_view_count');
    return saved ? parseInt(saved, 10) : 0;
  });

  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    localStorage.setItem('nexus_view_count', viewCount.toString());
  }, [viewCount]);

  const loadData = async () => {
    setDataLoading(true);
    setFetchError(null);
    try {
      const [promptsData, catsData] = await Promise.all([
        promptService.getAll(),
        promptService.getCategories()
      ]);
      setPrompts(promptsData || []);
      setCategories(['All', ...catsData]);
    } catch (error: any) {
      console.error("Fetch failed", error);
      setFetchError("Unable to connect to the Nexus Archive. Please check your connection.");
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => { 
    loadData(); 
  }, []);

  const handleSelectItem = (item: PromptItem) => {
    if (!user && viewCount >= FREE_VIEW_LIMIT) {
      setShowAuthModal(true);
      return;
    }
    
    setSelectedItem(item);
    if (!user) {
      setViewCount(prev => prev + 1);
    }
  };

  const filteredData = useMemo(() => {
    return (prompts || []).filter((item) => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery, prompts]);

  if (currentView === 'admin' && isAdmin) {
    return (
      <AdminPage 
        onBack={() => setCurrentView('home')} 
        onRefresh={loadData} 
      />
    );
  }

  return (
    <div className="min-h-screen font-sans text-slate-800 pb-20 relative overflow-x-hidden selection:bg-indigo-100 bg-slate-50">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.4]"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-200/30 rounded-full blur-[100px] animate-float"></div>
      </div>

      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/50 bg-white/60 backdrop-blur-md">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => { setCurrentView('home'); window.scrollTo({top: 0, behavior: 'smooth'}); }}>
              <div className="bg-slate-900 text-white p-1.5 rounded-lg group-hover:bg-indigo-600 transition-colors"><Zap size={18} fill="currentColor" /></div>
              <span className="font-bold text-lg tracking-tight">PROMPT<span className="font-light text-slate-500">NEXUS</span></span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             {isAdmin && (
               <button 
                 onClick={() => setCurrentView('admin')}
                 className="px-4 py-2 bg-indigo-600 text-white rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all"
               >
                 <Shield size={14} /> Admin Panel
               </button>
             )}
             
             <div className="relative">
                <button 
                  onClick={() => setShowSettings(!showSettings)}
                  className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm cursor-pointer hover:bg-slate-50 transition-colors"
                >
                   {user ? (
                     <img src={user.avatar} className="w-8 h-8 rounded-lg object-cover" alt="User" />
                   ) : (
                     <UserIcon size={20} className="text-slate-400" />
                   )}
                </button>

                <AnimatePresence>
                  {showSettings && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 glass-panel rounded-2xl p-2 shadow-2xl border border-white/80 z-[100]"
                    >
                      {user ? (
                        <>
                          <div className="px-4 py-3 border-b border-slate-100 mb-1">
                             <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                             <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                          </div>
                          <button 
                            onClick={() => { logout(); setShowSettings(false); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                          >
                            <LogOut size={16} /> Sign Out
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => { setShowAuthModal(true); setShowSettings(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                        >
                          <LogIn size={16} /> Sign In
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-[1600px] mx-auto px-6 pt-28">
        {dataLoading || authLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Initialising Secure Session...</p>
          </div>
        ) : fetchError ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-6 border border-red-100">
              <AlertCircle size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Nexus Connection Error</h2>
            <p className="text-slate-500 max-w-md mb-8">{fetchError}</p>
            <button 
              onClick={loadData}
              className="px-8 py-3 bg-indigo-600 text-white rounded-full font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
            >
              <RefreshCw size={18} /> Retry Connection
            </button>
          </div>
        ) : (
          <>
            <HeroCarousel items={prompts.slice(0, 3)} onSelect={handleSelectItem} />

            <TrendingRow items={prompts} onSelect={handleSelectItem} />
            
            <div className="mb-12 space-y-8">
               <div className="relative max-w-2xl mx-auto">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="text" 
                    placeholder="Search the nexus archive..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-16 pl-16 pr-6 rounded-2xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-700 font-medium"
                  />
               </div>

               <div className="flex items-center justify-center gap-2 overflow-x-auto no-scrollbar py-2 -mx-4 px-4">
                  {categories.map((cat) => (
                    <button 
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`
                        px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap
                        ${selectedCategory === cat 
                          ? 'bg-slate-900 text-white shadow-lg scale-105' 
                          : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-100'
                        }
                      `}
                    >
                      {cat}
                    </button>
                  ))}
               </div>
            </div>

            <div className="mb-10">
               <h2 className="text-4xl font-black tracking-tight text-slate-900">
                 Inspirations
               </h2>
               <p className="text-slate-500 font-medium text-sm mt-1">Daily curated prompts</p>
            </div>

            {filteredData.length > 0 ? (
              <motion.div layout className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                <AnimatePresence mode='popLayout'>
                  {filteredData.map((item) => (
                    <PromptCard 
                      key={item.id} 
                      item={item} 
                      onClick={handleSelectItem} 
                      isSaved={false} 
                      onToggleSave={() => {}} 
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <div className="text-center py-20">
                <Filter className="mx-auto text-slate-300 mb-4" size={48} />
                <h3 className="text-xl font-bold text-slate-400">No assets found</h3>
              </div>
            )}
          </>
        )}
      </div>

      <Modal 
        item={selectedItem} 
        isOpen={!!selectedItem} 
        onClose={() => setSelectedItem(null)} 
      />

      <SignInModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
}

export default App;
