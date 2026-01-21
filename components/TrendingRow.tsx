
import React from 'react';
import { motion } from 'framer-motion';
import { PromptItem } from '../types';
import { Star } from 'lucide-react';

interface TrendingRowProps {
  items: PromptItem[];
  onSelect: (item: PromptItem) => void;
}

const TrendingRow: React.FC<TrendingRowProps> = ({ items, onSelect }) => {
  // Sort by rank ascending and filter out nulls
  const trendingItems = [...items]
    .filter(item => item.trendingRank !== null && item.trendingRank !== undefined)
    .sort((a, b) => (a.trendingRank || 99) - (b.trendingRank || 99))
    .slice(0, 10);

  if (trendingItems.length === 0) return null;

  return (
    <div className="mb-16 relative">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
          Top 10 Trending <span className="text-indigo-600">Now</span>
        </h2>
      </div>

      <div className="overflow-x-auto no-scrollbar pb-10 -mx-6 px-6">
        <div className="flex gap-4 md:gap-8 items-end min-w-max">
          {trendingItems.map((item, index) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.05, zIndex: 10 }}
              onClick={() => onSelect(item)}
              className="relative flex items-end cursor-pointer group"
              style={{ width: '240px' }}
            >
              {/* Massive Number */}
              <div 
                className="absolute -left-6 bottom-[-10px] z-0 select-none pointer-events-none transition-transform duration-500 group-hover:-translate-x-2"
                style={{ 
                  fontSize: '12rem', 
                  fontWeight: 900, 
                  lineHeight: 1,
                  color: 'transparent',
                  WebkitTextStroke: '2px #cbd5e1', // Light slate border
                  textShadow: '0 10px 30px rgba(15, 23, 42, 0.05)'
                }}
              >
                {index + 1}
              </div>

              {/* Card Container */}
              <div className="relative z-10 w-44 h-64 ml-14 rounded-xl overflow-hidden shadow-2xl transition-all duration-300 group-hover:shadow-indigo-500/20 border border-white/50 bg-slate-100">
                <img 
                  src={item.imageResult} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Rarity Tag */}
                <div className="absolute top-2 right-2">
                   <div className="bg-slate-900/80 backdrop-blur-md text-white text-[8px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-1">
                      <Star size={8} fill="currentColor" /> {item.rarity}
                   </div>
                </div>

                {/* Info Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <p className="text-white text-[10px] font-black uppercase tracking-widest truncate">{item.title}</p>
                  <p className="text-slate-400 text-[8px] font-bold">{item.model}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrendingRow;
