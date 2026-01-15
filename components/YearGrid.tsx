
import React, { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { DayData, YearData, DayLog, DeadlineEvent } from '../types';
import { getDateId } from '../utils/storage';

interface YearGridProps {
  data: YearData;
  logs: Record<string, DayLog>;
  deadline: DeadlineEvent | null;
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
  deadline,
  hoveredDay,
  selectedDay,
  isOverview,
  onHoverDay,
  onSelectDay,
  onToggleOverview
}) => {
  const lastVibratedIndex = useRef<number>(-1);
  const pinchStartDist = useRef<number | null>(null);
  const allDays = data.days;

  const triggerHaptic = useCallback((pattern: 'tick' | 'heavy' = 'tick') => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      if (pattern === 'tick') navigator.vibrate(5);
      if (pattern === 'heavy') navigator.vibrate(15);
    }
  }, []);

  // -- Pinch Logic --
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      pinchStartDist.current = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStartDist.current !== null) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDist = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );

      const threshold = 50;
      const diff = currentDist - pinchStartDist.current;

      if (Math.abs(diff) > threshold) {
        if (diff < 0 && !isOverview) {
          onToggleOverview();
          triggerHaptic('heavy');
          pinchStartDist.current = null;
        } else if (diff > 0 && isOverview) {
          onToggleOverview();
          triggerHaptic('heavy');
          pinchStartDist.current = null;
        }
      }
    }
  };

  const onTouchEnd = () => {
    pinchStartDist.current = null;
  };

  const getDayColor = (day: DayData, isActive: boolean) => {
    const log = logs[getDateId(day.date)];
    const dateId = getDateId(day.date);
    const isDeadline = deadline?.date === dateId;

    // Today
    if (day.isToday) return { bg: 'bg-acid', border: 'border-transparent', shadow: 'shadow-[0_0_10px_#CCFF00]' };

    // Deadline (Priority over past logs for visibility, but typically future)
    if (isDeadline) return { bg: 'bg-red-500', border: 'border-transparent', shadow: 'deadline-pulse' };

    // Past with Log
    if (day.isPast && log) {
      if (log.impact === 'HIGH') return { bg: 'bg-acid', border: 'border-acid', shadow: 'shadow-[0_0_8px_#CCFF00]' };
      if (log.impact === 'NEUTRAL') return { bg: 'bg-white', border: 'border-white', shadow: 'shadow-[0_0_5px_rgba(255,255,255,0.4)]' };
      return { bg: 'bg-[#222]', border: 'border-white/20', shadow: 'none' };
    }

    // Past Empty
    if (day.isPast) return { bg: 'bg-[#111]', border: 'border-white/5', shadow: 'none' };

    // Future
    return { bg: 'bg-transparent', border: 'border-white/5', shadow: 'none' };
  };

  // Improved Spring Physics for organic feel
  const springTransition = {
    type: "spring",
    stiffness: 120,
    damping: 20,
    mass: 0.8
  };

  return (
    <div
      className={`mx-auto relative z-30 flex flex-col
        ${isOverview ? 'w-full justify-start' : 'w-full h-full justify-center px-4 max-w-[340px]'}`}
      onMouseLeave={() => { onHoverDay(null); lastVibratedIndex.current = -1; }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* 
         FIXED Floating Toggle Button 
         Positioned fixed top-centered below header text
      */}
      <motion.button
        layout
        onClick={(e) => {
          e.stopPropagation();
          triggerHaptic('tick');
          onToggleOverview();
        }}
        className={`
              fixed top-40 left-1/2 -translate-x-1/2 z-[90]
              flex items-center gap-2 px-4 py-2 rounded-full border border-white/10
              backdrop-blur-md transition-all duration-300 active:scale-95 shadow-xl
              ${isOverview ? 'bg-acid/10 text-acid border-acid/30' : 'bg-black/60 text-white/50 hover:bg-white/10 hover:text-white'}
          `}
        initial={false}
      >
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold">
          {isOverview ? ':: GRID ::' : ':: LIST ::'}
        </span>
      </motion.button>

      <motion.div
        layout
        className={`
          grid place-items-center mt-0
          ${isOverview
            ? 'grid-cols-[repeat(15,minmax(0,1fr))] gap-y-[2px] gap-x-[2px] w-full px-5'
            : 'grid-cols-7 gap-y-6 gap-x-4 w-full pb-32'
          }
        `}
        transition={springTransition}
      >
        {allDays.map((day, index) => {
          const isHovered = hoveredDay?.dayOfYear === day.dayOfYear;
          const isSelected = selectedDay?.dayOfYear === day.dayOfYear;
          const style = getDayColor(day, isSelected || isHovered);

          // Uniform dot sizing logic for both views as requested
          const dotSize = (day.isToday || isSelected || style.shadow === 'deadline-pulse') ? 'w-3 h-3' : 'w-2 h-2';

          return (
            <motion.div
              key={day.dayOfYear}
              data-day-index={index}
              onMouseEnter={() => { if (!isOverview && lastVibratedIndex.current !== index) { lastVibratedIndex.current = index; triggerHaptic('tick'); onHoverDay(day); } }}
              onClick={(e) => {
                e.stopPropagation();
                // Allow clicking future days to set deadline
                triggerHaptic('heavy');
                onSelectDay(day);
              }}
              className={`relative flex items-center justify-center cursor-pointer group rounded-full transition-opacity
                    ${isOverview ? 'w-full aspect-square' : 'w-8 h-8'} 
                    ${day.isFuture ? 'opacity-30 cursor-not-allowed' : 'opacity-100'}
                  `}
              transition={springTransition}
            >
              <motion.div
                className={`
                        rounded-full transition-colors duration-300
                        ${style.bg} ${style.border} ${style.shadow} border
                        ${dotSize}
                    `}
                transition={springTransition}
              />

              {!isOverview && (isSelected || isHovered) && (
                <motion.div
                  layoutId="focusRing"
                  className="absolute inset-0 border border-white/40 rounded-full"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1.4, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};
