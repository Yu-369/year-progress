
import React, { useRef, useCallback, useState, useEffect } from 'react';
import { DayData, YearData, DayLog } from '../types';
import { getDateId } from '../utils/storage';

interface YearGridProps {
  data: YearData;
  logs: Record<string, DayLog>;
  hoveredDay: DayData | null;
  selectedDay: DayData | null;
  isOverview: boolean;
  onHoverDay: (day: DayData | null) => void;
  onSelectDay: (day: DayData) => void;
  onToggleOverview: () => void;
}

export const YearGrid: React.FC<YearGridProps> = ({ 
  data, 
  logs,
  hoveredDay, 
  selectedDay,
  isOverview,
  onHoverDay, 
  onSelectDay,
  onToggleOverview
}) => {
  const lastVibratedIndex = useRef<number>(-1);
  const pinchStartDist = useRef<number>(0);
  const allDays = data.days;
  const [animState, setAnimState] = useState<'idle' | 'zooming-out' | 'zooming-in'>('idle');

  const triggerHaptic = useCallback((pattern: 'tick' | 'heavy' = 'tick') => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      if (pattern === 'tick') navigator.vibrate(5);
      if (pattern === 'heavy') navigator.vibrate(15);
    }
  }, []);

  useEffect(() => {
    setAnimState(isOverview ? 'zooming-out' : 'zooming-in');
    const t = setTimeout(() => setAnimState('idle'), 500);
    return () => clearTimeout(t);
  }, [isOverview]);

  const getDayStyle = (day: DayData, isActive: boolean, isSmall: boolean) => {
    const log = logs[getDateId(day.date)];
    let classes = isSmall ? 'w-2 h-2' : 'w-2 h-2';
    if (!isSmall && isActive) classes = 'w-4 h-4';
    if (!isSmall && day.isToday) classes = 'w-3 h-3';

    if (day.isToday) return `${classes} bg-acid rounded-none z-30 shadow-[0_0_20px_#CCFF00] animate-pulse`;

    if (day.isPast && log) {
        if (log.impact === 'HIGH') return `${classes} bg-acid rounded-full shadow-[0_0_15px_#CCFF00] z-20 scale-125 border border-white/20 animate-pulse-fast`; 
        if (log.impact === 'NEUTRAL') return `${classes} bg-white rounded-full opacity-100 shadow-[0_0_5px_rgba(255,255,255,0.3)]`; 
        if (log.impact === 'LOW') return `${classes} bg-white/20 rounded-full scale-75 border border-white/5`; 
    }

    if (day.isPast) return `${classes} bg-[#111] rounded-full border border-white/[0.04]`;
    return `${classes} border border-white/[0.08] bg-transparent rounded-full opacity-30`;
  };

  return (
    <div 
      className={`mx-auto relative z-30 flex flex-col gap-10 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOverview ? 'max-w-[300px]' : 'max-w-[340px]'}`}
      onMouseLeave={() => { onHoverDay(null); lastVibratedIndex.current = -1; }}
    >
      <div className={`flex justify-end w-full px-2 sticky top-0 z-[100] transition-opacity duration-300 ${isOverview ? 'opacity-100' : 'opacity-80'}`}>
          <button onClick={(e) => { e.stopPropagation(); triggerHaptic('tick'); onToggleOverview(); }}
            className={`px-5 py-2 text-[10px] uppercase tracking-[0.3em] border rounded-full backdrop-blur-xl transition-all duration-500
                ${isOverview ? 'border-acid text-acid bg-acid/10 shadow-[0_0_15px_rgba(204,255,0,0.1)]' : 'border-white/10 text-white/50 bg-white/5 hover:bg-white/10 hover:text-white'}
            `}>
            {isOverview ? 'Matrix Mode' : 'Focus Mode'}
          </button>
      </div>

      <div className={`${isOverview ? 'grid grid-cols-[repeat(14,1fr)] gap-y-3' : 'grid grid-cols-7 gap-y-8 gap-x-4'} place-items-center pb-32 transition-all duration-700`}>
        {allDays.map((day, index) => (
            <div
              key={day.dayOfYear}
              data-day-index={index}
              onMouseEnter={() => { if (!isOverview && lastVibratedIndex.current !== index) { lastVibratedIndex.current = index; triggerHaptic('tick'); onHoverDay(day); } }}
              onClick={(e) => { e.stopPropagation(); triggerHaptic('heavy'); onSelectDay(day); }}
              className="flex items-center justify-center cursor-pointer group w-8 h-8"
            >
              <div className={`transition-all duration-500 ease-out ${getDayStyle(day, (selectedDay?.dayOfYear === day.dayOfYear || hoveredDay?.dayOfYear === day.dayOfYear), isOverview)}`} />
            </div>
        ))}
      </div>
    </div>
  );
};
