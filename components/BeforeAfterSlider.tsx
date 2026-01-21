import React, { useState, useRef, useCallback } from 'react';
import { ChevronsLeftRight } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  alt: string;
}

const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({ beforeImage, afterImage, alt }) => {
  const [position, setPosition] = useState(0); // 0 means hidden (showing full After result)
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (containerRef.current) {
      const { left, width } = containerRef.current.getBoundingClientRect();
      const newPosition = ((clientX - left) / width) * 100;
      setPosition(Math.min(Math.max(newPosition, 0), 100));
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    setIsHovering(true);
    handleMove(e.clientX);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setPosition(0); // Reset to show full Result (After)
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none group cursor-crosshair z-10"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* After Image (Background) - The Result (Default View) */}
      <img
        src={afterImage}
        alt={`${alt} After`}
        className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        draggable={false}
      />
      
      {/* Before Image (Foreground) - The Source (Revealed on Hover) */}
      <div
        className="absolute top-0 left-0 h-full overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all duration-75 ease-linear will-change-[width]"
        style={{ width: `${position}%`, opacity: isHovering ? 1 : 0 }}
      >
        <img
          src={beforeImage}
          alt={`${alt} Before`}
          className="absolute top-0 left-0 max-w-none h-full object-cover group-hover:scale-105 transition-transform duration-700"
          style={{ width: containerRef.current?.offsetWidth || '100%' }}
          draggable={false}
        />
        
        {/* Label for Before (Source) - Only visible when revealed enough */}
        <div className={`
            absolute bottom-4 left-4 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-slate-900 uppercase tracking-wider pointer-events-none border border-white/50 shadow-md transition-opacity duration-300
            ${position > 20 ? 'opacity-100' : 'opacity-0'}
        `}>
          Before
        </div>
      </div>

      {/* Slider Handle (Follows Mouse) - This acts as the SINGLE line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.2)] z-20 flex items-center justify-center pointer-events-none transition-opacity duration-200"
        style={{ 
            left: `${position}%`,
            opacity: isHovering ? 1 : 0
        }}
      >
        {/* Handle Icon - Centered on the line */}
        <div className="w-8 h-8 rounded-full bg-white border border-slate-100 shadow-xl flex items-center justify-center backdrop-blur-sm transform -translate-x-[0.5px]">
          <ChevronsLeftRight size={14} className="text-indigo-600" />
        </div>
      </div>

      {/* Label for After (Result) - Default visible, hidden if covered */}
      <div className={`
        absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider pointer-events-none shadow-lg transition-opacity duration-300
        ${position > 80 ? 'opacity-0' : 'opacity-100'}
      `}>
        Result
      </div>
    </div>
  );
};

export default BeforeAfterSlider;