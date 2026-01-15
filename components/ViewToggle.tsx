import React, { useRef, useEffect, useState } from 'react';
import { ViewMode } from '../types';

interface ViewToggleProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ currentView, onViewChange }) => {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { id: ViewMode.MICRO, label: 'MICRO' },
    { id: ViewMode.MESO, label: 'MESO' },
    { id: ViewMode.MACRO, label: 'MACRO' },
  ];

  useEffect(() => {
    // Calculate position of the active tab for the sliding pill effect
    if (containerRef.current) {
      const activeIndex = tabs.findIndex(t => t.id === currentView);
      const tabNodes = containerRef.current.querySelectorAll('button');
      if (tabNodes[activeIndex]) {
        const activeNode = tabNodes[activeIndex];
        setIndicatorStyle({
          left: activeNode.offsetLeft,
          width: activeNode.offsetWidth
        });
      }
    }
  }, [currentView]);

  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative flex items-center gap-1 bg-white/5 backdrop-blur-xl p-1 border border-white/10 rounded-full shadow-2xl"
    >
      {/* Sliding Active Indicator */}
      <div 
        className="absolute top-1 bottom-1 bg-acid rounded-full transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-[0_0_15px_rgba(204,255,0,0.3)] z-0"
        style={{ 
          left: indicatorStyle.left, 
          width: indicatorStyle.width 
        }}
      />

      {tabs.map((tab) => {
        const isActive = currentView === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => {
              if (!isActive) {
                triggerHaptic();
                onViewChange(tab.id);
              }
            }}
            className={`
              relative z-10 px-5 py-2.5 rounded-full text-[9px] font-mono tracking-[0.2em] uppercase transition-colors duration-300
              ${isActive ? 'text-void font-bold' : 'text-white/40 hover:text-white'}
            `}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};