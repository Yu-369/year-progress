import React, { useMemo, useRef } from 'react';
import { Gender } from '../types';

interface LifeGridProps {
  gender: Gender;
  birthDate: Date;
}

const WEEKS_PER_YEAR = 52;
const MAX_AGE_MALE = 71;
const MAX_AGE_FEMALE = 76;

export const LifeGrid: React.FC<LifeGridProps> = ({ gender, birthDate }) => {
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

  return (
    <div className="w-full flex flex-col items-center pt-8 pb-32 relative animate-reveal">
      <div className="flex w-full max-w-[360px] pl-4 pr-4">
          
          {/* The Bio-Grid - No Rulers, just data */}
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
                            aspect-square rounded-sm
                            ${isCurrent ? 'z-10 scale-150 relative' : ''}
                        `}
                        style={{
                            backgroundColor: isCurrent ? '#CCFF00' : isPast ? '#333333' : 'rgba(255,255,255,0.08)',
                            boxShadow: isCurrent ? '0 0 10px rgba(204,255,0,0.9)' : 'none',
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