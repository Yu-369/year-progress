
import React, { useMemo, useRef } from 'react';
import { Gender, Theme } from '../types';

interface LifeGridProps {
  gender: Gender;
  birthDate: Date;
  theme: Theme;
}

const WEEKS_PER_YEAR = 52;
const MAX_AGE_MALE = 71;
const MAX_AGE_FEMALE = 76;

export const LifeGrid: React.FC<LifeGridProps> = ({ gender, birthDate, theme }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const maxYears = gender === 'MALE' ? MAX_AGE_MALE : MAX_AGE_FEMALE;
  const totalWeeks = maxYears * WEEKS_PER_YEAR;

  // Calculate Weeks Lived
  const weeksLived = useMemo(() => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - birthDate.getTime());
    const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
    return Math.min(diffWeeks, totalWeeks);
  }, [birthDate, totalWeeks]);

  const weeks = useMemo(() => {
    return Array.from({ length: totalWeeks });
  }, [totalWeeks]);

  const accentColor = theme === 'EXPRESSIVE' ? '#D0BCFF' : '#CCFF00';
  const shadowColor = theme === 'EXPRESSIVE' ? 'rgba(208, 188, 255, 0.9)' : 'rgba(204, 255, 0, 0.9)';

  return (
    <div className="w-full flex flex-col items-center pt-8 pb-32 relative animate-reveal">
      {/* Legend */}
      <div className="flex gap-6 mb-8">
          <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#333]"></div>
              <span className="text-[10px] font-mono uppercase text-white/40 tracking-widest">Past</span>
          </div>
          <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full shadow-[0_0_5px_currentColor]" style={{ backgroundColor: accentColor, color: accentColor }}></div>
              <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: accentColor }}>Present</span>
          </div>
          <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full border border-white/10"></div>
              <span className="text-[10px] font-mono uppercase text-white/20 tracking-widest">Future</span>
          </div>
      </div>

      <div className="flex w-full max-w-[360px] pl-4 pr-4">
          {/* The Bio-Grid */}
          <div 
            ref={containerRef}
            className="grid gap-x-[1px] gap-y-[2px] w-full touch-pan-y"
            style={{ 
                gridTemplateColumns: `repeat(${WEEKS_PER_YEAR}, 1fr)`,
            }}
          >
            {weeks.map((_, i) => {
                const isPast = i < weeksLived;
                const isCurrent = i === weeksLived;
                
                return (
                    <div
                        key={i}
                        className={`
                            aspect-square rounded-sm transition-all duration-300
                            ${isCurrent ? 'z-10 scale-150 relative' : ''}
                        `}
                        style={{
                            backgroundColor: isCurrent ? accentColor : isPast ? '#333333' : 'rgba(255,255,255,0.08)',
                            boxShadow: isCurrent ? `0 0 10px ${shadowColor}` : 'none',
                            borderRadius: isCurrent ? '50%' : '1px'
                        }}
                    />
                )
            })}
          </div>
      </div>
    </div>
  );
};
