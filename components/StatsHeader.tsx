
import React from 'react';
import { YearData } from '../types';

interface StatsHeaderProps {
  data: YearData;
  isOpen: boolean;
  onMenuClick: () => void;
}

export const StatsHeader: React.FC<StatsHeaderProps> = ({ data, isOpen, onMenuClick }) => {
  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 w-full flex items-center justify-between py-6 px-6 z-[80] select-none pointer-events-none">
      {/* Menu Trigger (Hamburger) */}
      <button 
        onClick={(e) => {
            e.stopPropagation();
            triggerHaptic();
            onMenuClick();
        }}
        aria-label={isOpen ? "Close Menu" : "Open Menu"}
        className="pointer-events-auto group relative flex flex-col justify-center items-center w-12 h-12 bg-black/20 backdrop-blur-md rounded-full border border-white/5 hover:border-white/20 transition-all duration-300 active:scale-95 cursor-pointer"
      >
        <div className="relative w-5 h-4 flex flex-col justify-between items-center">
            {/* Top Line */}
            <span 
                className={`h-[2px] bg-white w-full rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                ${isOpen ? 'rotate-45 translate-y-[7px] w-6' : 'rotate-0 translate-y-0'}
                `}
            />
            {/* Middle Line */}
            <span 
                className={`h-[2px] bg-white w-full rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                ${isOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}
                `}
            />
            {/* Bottom Line */}
            <span 
                className={`h-[2px] bg-white w-full rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                ${isOpen ? '-rotate-45 -translate-y-[7px] w-6' : 'rotate-0 translate-y-0'}
                `}
            />
        </div>
      </button>

      {/* Year Display - Minimalist pill */}
      <div 
        className={`
            pointer-events-auto flex items-center gap-3 px-4 py-2 rounded-full border border-white/5 bg-black/20 backdrop-blur-md transition-all duration-500
            ${isOpen ? 'opacity-0 translate-x-10' : 'opacity-100 translate-x-0'}
        `}
      >
        <div className="h-1.5 w-1.5 bg-acid rounded-none animate-pulse"></div>
        <h1 className="text-xs font-mono font-bold tracking-[0.3em] text-white">
          {data.year}
        </h1>
      </div>
    </header>
  );
};
