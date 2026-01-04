
import React, { useEffect, useState } from 'react';
import { getMoonPhase } from '../utils/dateHelper';

export const DayPulse: React.FC = () => {
  const [now, setNow] = useState(new Date());
  
  useEffect(() => {
    let frameId: number;
    const update = () => {
      setNow(new Date());
      frameId = requestAnimationFrame(update);
    };
    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, []);

  const totalSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds() + now.getMilliseconds() / 1000;
  const progress = totalSeconds / 86400; // 0 to 1
  const degrees = progress * 360;

  // Moon Phase
  const moonPhase = getMoonPhase(now); // 0-1
  // Calculate offset for shadow to simulate phase. 
  // Simplified visual: Just a growing/shrinking shadow overlay on a circle
  // 0 = New, 0.5 = Full, 1 = New.
  
  // Format time for brutalist display
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  const millis = Math.floor(now.getMilliseconds() / 10).toString().padStart(2, '0');

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative select-none">
      {/* Radar Container */}
      <div className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] flex items-center justify-center">
        
        {/* Outer Ring */}
        <div className="absolute inset-0 border border-white/10 rounded-full"></div>
        
        {/* Ticks - 24 hours */}
        {Array.from({ length: 24 }).map((_, i) => (
          <div 
            key={i}
            className="absolute top-0 left-1/2 w-px h-2 bg-white/20 origin-bottom"
            style={{ 
                transform: `translateX(-50%) rotate(${i * 15}deg)`, 
                transformOrigin: '50% 140px' 
            }} 
          />
        ))}

        {/* The Sweep */}
        <div 
            className="absolute inset-4 rounded-full transition-all duration-75"
            style={{
                background: `conic-gradient(from 0deg, rgba(204, 255, 0, 0.15) 0deg, rgba(204, 255, 0, 0.0) ${degrees}deg, transparent ${degrees}deg)`
            }}
        />

        {/* The Needle */}
        <div 
          className="absolute top-0 left-1/2 w-0.5 h-[50%] origin-bottom z-10"
          style={{ transform: `translateX(-50%) rotate(${degrees}deg)` }}
        >
             <div className="w-full h-full bg-gradient-to-t from-transparent via-acid to-acid shadow-[0_0_15px_rgba(204,255,0,0.8)]"></div>
             {/* Tip Glow */}
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-acid rounded-full shadow-[0_0_10px_rgba(204,255,0,1)]"></div>
        </div>

        {/* Center Digital Readout */}
        <div className="absolute z-20 flex flex-col items-center mix-blend-difference">
          <div className="text-6xl font-display font-bold text-white tracking-tighter leading-none flex">
            <span className="w-[1.1em] text-center">{hours}</span>
            <span className="animate-pulse">:</span>
            <span className="w-[1.1em] text-center">{minutes}</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xl font-mono text-acid w-[1.5em] text-center">{seconds}</span>
            <span className="text-xs font-mono text-white/50 w-[1.5em] text-left">.{millis}</span>
          </div>
        </div>
      </div>

      <div className="mt-12 w-full flex justify-between items-end px-12 max-w-sm">
        {/* Day Progress */}
        <div className="text-center">
            <div className="text-[9px] font-mono text-white/40 tracking-[0.2em] uppercase mb-1">
                Day Progress
            </div>
            <div className="text-acid font-mono text-sm tracking-widest tabular-nums">
                {(progress * 100).toFixed(2)}%
            </div>
        </div>

        {/* Moon Phase Indicator */}
        <div className="text-center flex flex-col items-center">
            <div className="w-6 h-6 rounded-full bg-white/10 relative overflow-hidden mb-2 border border-white/20">
                {/* Simplified CSS Moon Phase simulation */}
                <div 
                    className="absolute inset-0 bg-white rounded-full"
                    style={{
                        transform: `translateX(${(moonPhase - 0.5) * 200}%)`,
                        filter: 'blur(2px)'
                    }}
                />
            </div>
             <div className="text-[9px] font-mono text-white/40 tracking-[0.2em] uppercase">
                Moon {(moonPhase * 100).toFixed(0)}%
            </div>
        </div>
      </div>
    </div>
  );
};
