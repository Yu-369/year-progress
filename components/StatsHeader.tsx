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
    <header className="w-full flex items-center justify-between py-10 px-8 bg-transparent z-[70] select-none pointer-events-auto relative">
      {/* Menu Trigger */}
      <button 
        onClick={(e) => {
            e.stopPropagation();
            triggerHaptic();
            onMenuClick();
        }}
        aria-label={isOpen ? "Close Menu" : "Open Menu"}
        className="group flex flex-col justify-center gap-[6px] w-12 h-12 hover:opacity-100 opacity-80 transition-opacity cursor-pointer active:scale-95 duration-200"
      >
        <div 
            className={`h-[2px] bg-white group-hover:bg-acid transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] origin-center
            ${isOpen ? 'w-6 rotate-45 translate-y-[4px]' : 'w-8 rotate-0 translate-y-0'}
            `}
        />
        <div 
            className={`h-[2px] bg-white group-hover:bg-acid transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] origin-center
            ${isOpen ? 'w-6 -rotate-45 -translate-y-[4px]' : 'w-4 group-hover:w-8 rotate-0 translate-y-0'}
            `}
        />
      </button>

      {/* Year Display - Minimalist pill */}
      <div 
        className={`
            flex items-center gap-3 px-4 py-1.5 rounded-full border border-white/5 bg-black/20 backdrop-blur-md transition-opacity duration-300
            ${isOpen ? 'opacity-0' : 'opacity-100'}
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