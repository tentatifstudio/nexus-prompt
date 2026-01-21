import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Loader2, Search, Shield, LogOut, LogIn, User as UserIcon, AlertCircle, RefreshCw, Filter } from 'lucide-react';
import { PromptItem } from './types.ts';
import PromptCard from './components/PromptCard.tsx';
import Modal from './components/Modal.tsx';
import HeroCarousel from './components/HeroCarousel.tsx';
import AdminPage from './components/AdminPage.tsx';
import TrendingRow from './components/TrendingRow.tsx';
import SignInModal from './components/SignInModal.tsx';
import PricingModal from './components/PricingModal.tsx';
import { promptService } from './services/promptService.ts';
import { useAuth } from './context/AuthContext.tsx';

const ADMIN_EMAIL = 'wahyupedia740@gmail.com';

function App() {
  const { user, logout, upgradeToPro, loading: authLoading } = useAuth();
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  
  const [currentView, setCurrentView] = useState<'home' | 'admin'>('home');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<PromptItem | null>(null);

  const isAdmin = user?.email === ADMIN_EMAIL;
  const isPro = user?.plan === 'pro';

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
      setFetchError("Unable to connect to the Nexus Archive.");
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => { 
    loadData(); 
  }, []);

  const handleSelectItem = (item: PromptItem) => {
    setSelectedItem(item);
  };

  const handleUpgrade = async () => {
    try {
      await upgradeToPro();
      setShowPricingModal(false);
      alert("Welcome to the Pro Vault! Full access restored.");
    } catch (err) {
      alert("Activation failed.");
    }
  };

  const filteredData = useMemo(() => {
    return (prompts || []).filter((item) => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.prompt.toLowerCase().includes(searchQuery.toLowerCase());

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
    <div className="min-h-screen font-sans text-slate-800 pb-20 relative overflow-x-hidden bg-slate-50">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.4]"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-200/30 rounded-full blur-[100px] animate-float"></div>
      </div>

      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/50 bg-white/60 backdrop-blur-md">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => { setCurrentView('home'); window.scrollTo({top:0, behavior:'smooth'}); }}>
            <div className="bg-slate-900 text-white p-1.5 rounded-lg group-hover:bg-indigo-600 transition-colors"><Zap size={18} fill="currentColor" /></div>
            <span className="font-bold text-lg tracking-tight">PROMPT<span className="font-light text-slate-500">NEXUS</span></span>
          </div>
          
          <div className="flex items-center gap-4">
             {user && !isPro && (
               <button onClick={() => setShowPricingModal(true)} className="hidden md:flex px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest items-center gap-2 shadow-lg hover:scale-105 transition-all">
                 Get Pro Access
               </button>
             )}
             {isAdmin && (
               <button onClick={() => setCurrentView('admin')} className="px-4 py-2 bg-indigo-600 text-white rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg hover:bg-indigo-500 transition-all">
                 <Shield size={14} /> Admin
               </button>
             )}
             <div className="relative">
                <button onClick={() => setShowSettings(!showSettings)} className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm overflow-hidden">
                   {user ? <img src={user.avatar} className="w-full h-full object-cover" /> : <UserIcon size={20} className="text-slate-400" />}
                </button>
                <AnimatePresence>
                  {showSettings && (
                    <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:10 }} className="absolute right-0 mt-2 w-56 glass-panel rounded-2xl p-2 shadow-2xl z-[100]">
                      {user ? (
                        <>
                          <div className="px-4 py-3 border-b border-slate-100 mb-1">
                             <div className="flex items-center gap-2 mb-1">
                                <p className="text-xs font-bold truncate">{user.name}</p>
                                {isPro && <span className="bg-amber-100 text-amber-600 text-[8px] px-1 rounded font-black uppercase">Pro</span>}
                             </div>
                             <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                          </div>
                          <button onClick={() => logout()} className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl">
                            <LogOut size={16} /> Sign Out
                          </button>
                        </>
                      ) : (
                        <button onClick={() => { setShowAuthModal(true); setShowSettings(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-xl">
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
          </div>
        ) : (
          <>
            <HeroCarousel items={prompts.slice(0, 3)} onSelect={handleSelectItem} />
            <TrendingRow items={prompts} onSelect={handleSelectItem} />
            
            <div className="mb-12 space-y-8">
               <div className="relative max-w-2xl mx-auto">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input type="text" placeholder="Search prompts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full h-16 pl-16 pr-6 rounded-2xl bg-white border border-slate-100 shadow-xl outline-none" />
               </div>
               <div className="flex items-center justify-center gap-2 overflow-x-auto no-scrollbar py-2">
                  {categories.map((cat) => (
                    <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap ${selectedCategory === cat ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 border border-slate-100'}`}>{cat}</button>
                  ))}
               </div>
            </div>

            <motion.div layout className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              <AnimatePresence mode='popLayout'>
                {filteredData.map((item) => (
                  <PromptCard key={item.id} item={item} onClick={handleSelectItem} isSaved={false} onToggleSave={() => {}} />
                ))}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </div>

      <Modal 
        item={selectedItem} 
        isOpen={!!selectedItem} 
        onClose={() => setSelectedItem(null)} 
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenPricing={() => setShowPricingModal(true)}
      />
      <SignInModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <PricingModal isOpen={showPricingModal} onClose={() => setShowPricingModal(false)} onUpgrade={handleUpgrade} />
    </div>
  );
}

export default App;