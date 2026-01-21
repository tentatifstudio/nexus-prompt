import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { PromptItem } from '../types';

interface HeroCarouselProps {
  items: PromptItem[];
  onSelect: (item: PromptItem) => void;
}

const HeroCarousel: React.FC<HeroCarouselProps> = ({ items, onSelect }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-slide logic
  useEffect(() => {
    if (isPaused || !items || items.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 6000); // Change every 6 seconds

    return () => clearInterval(timer);
  }, [isPaused, items?.length]);

  if (!items || items.length === 0) {
    return null;
  }

  const safeIndex = currentIndex >= items.length ? 0 : currentIndex;
  const currentItem = items[safeIndex];

  if (!currentItem) return null;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  return (
    <div 
      className="glass-panel rounded-2xl md:rounded-3xl p-1 mb-8 md:mb-16 shadow-xl relative group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="bg-white/40 rounded-[18px] md:rounded-[20px] overflow-hidden relative min-h-[400px] md:min-h-[450px] flex flex-col md:flex-row">
        
        {/* Navigation Buttons */}
        <button 
            onClick={(e) => { e.stopPropagation(); prevSlide(); }}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/20 backdrop-blur-md hover:bg-white text-slate-800 border border-white/50 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 hidden md:block"
        >
            <ChevronLeft size={20} />
        </button>
        <button 
            onClick={(e) => { e.stopPropagation(); nextSlide(); }}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/20 backdrop-blur-md hover:bg-white text-slate-800 border border-white/50 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hidden md:block"
        >
            <ChevronRight size={20} />
        </button>

        <AnimatePresence mode='wait'>
          <motion.div 
            key={currentItem.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="contents"
          >
            {/* TEXT SECTION */}
            <div className="order-2 md:order-1 flex-1 p-6 md:p-16 flex flex-col justify-center relative z-10 bg-white/30 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none -mt-4 md:mt-0 rounded-t-2xl md:rounded-none">
               <motion.div 
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: 0.2, duration: 0.6 }}
               >
                  <span className="inline-flex items-center gap-2 px-2.5 py-0.5 md:px-3 md:py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] md:text-[11px] font-bold uppercase tracking-wider mb-3 md:mb-6 border border-indigo-100 shadow-sm">
                     <Sparkles size={10} /> Featured
                  </span>
                  
                  <h1 className="text-2xl md:text-5xl lg:text-6xl font-black mb-2 md:mb-6 text-slate-900 leading-tight tracking-tight line-clamp-2 md:line-clamp-none">
                     {currentItem.title}
                  </h1>
                  
                  <p className="text-sm md:text-lg text-slate-600 mb-6 md:mb-8 max-w-md leading-relaxed font-medium line-clamp-2 md:line-clamp-4">
                     {currentItem.description || "Explore this premium crafted prompt designed for superior generation results."}
                  </p>
                  
                  <div className="flex items-center gap-3 md:gap-4">
                     <button 
                       onClick={() => onSelect(currentItem)}
                       className="bg-slate-900 text-white hover:bg-indigo-600 px-6 py-2.5 md:px-8 md:py-3.5 rounded-full text-xs md:text-sm font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
                     >
                       <Play size={14} className="md:w-[18px] md:h-[18px]" fill="currentColor" />
                       Use Prompt
                     </button>
                     <button className="bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 md:px-6 md:py-3.5 rounded-full text-xs md:text-sm font-bold transition-all border border-slate-200 shadow-sm hidden sm:block">
                       Details
                     </button>
                  </div>
               </motion.div>
            </div>

            {/* IMAGE SECTION */}
            <div className="order-1 md:order-2 flex-1 relative h-48 sm:h-64 md:h-auto overflow-hidden">
               <motion.img 
                 key={currentItem.imageResult}
                 initial={{ scale: 1.1 }}
                 animate={{ scale: 1 }}
                 transition={{ duration: 6, ease: "linear" }}
                 src={currentItem.imageResult} 
                 alt="Hero" 
                 className="absolute inset-0 w-full h-full object-cover md:object-center object-top"
               />
               
               <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent md:bg-gradient-to-l md:from-transparent md:to-white/10 pointer-events-none"></div>
            </div>
          </motion.div>
        </AnimatePresence>
        
        {/* Progress Indicators */}
        <div className="absolute bottom-4 md:bottom-8 left-6 md:left-16 flex gap-2 z-20">
            {items.map((_, idx) => (
                <div 
                    key={idx}
                    onClick={() => setCurrentIndex(idx)} 
                    className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${idx === safeIndex ? 'w-8 bg-slate-900' : 'w-2 bg-slate-400/50 hover:bg-slate-600'}`}
                ></div>
            ))}
        </div>

      </div>
    </div>
  );
};

export default HeroCarousel;