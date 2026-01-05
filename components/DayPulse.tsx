
import React, { useEffect, useState } from 'react';
import { getSunTimes } from '../utils/dateHelper';

export const DayPulse: React.FC = () => {
  const [now, setNow] = useState(new Date());
  const [sunTimes, setSunTimes] = useState({ sunrise: '--:--', sunset: '--:--' });
  const [hasLocation, setHasLocation] = useState(false);
  
  useEffect(() => {
    let frameId: number;
    const update = () => {
      setNow(new Date());
      frameId = requestAnimationFrame(update);
    };
    frameId = requestAnimationFrame(update);

    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const times = getSunTimes(new Date(), latitude, longitude);
                setSunTimes(times);
                setHasLocation(true);
            },
            (err) => {
                console.warn("Location access denied or unavailable:", err);
                // Keep defaults or handle error state
            },
            { enableHighAccuracy: false, timeout: 5000, maximumAge: 600000 }
        );
    }

    return () => cancelAnimationFrame(frameId);
  }, []);

  const totalSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds() + now.getMilliseconds() / 1000;
  const progress = totalSeconds / 86400; // 0 to 1
  const degrees = progress * 360;

  // Format time for brutalist display
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  const millis = Math.floor(now.getMilliseconds() / 10).toString().padStart(2, '0');

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative select-none">
      {/* Radar Container */}
      <div className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] flex-shrink-0 aspect-square flex items-center justify-center">
        
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
            className="absolute inset-4 rounded-full"
            style={{
                willChange: 'transform',
                background: `conic-gradient(from 0deg, rgba(204, 255, 0, 0.15) 0deg, rgba(204, 255, 0, 0.0) ${degrees}deg, transparent ${degrees}deg)`,
                maskImage: 'radial-gradient(circle, transparent 30%, black 100%)',
                WebkitMaskImage: 'radial-gradient(circle, transparent 30%, black 100%)'
            }}
        />

        {/* The Needle */}
        <div 
          className="absolute top-0 left-1/2 w-0.5 h-[50%] origin-bottom z-10"
          style={{ transform: `translateX(-50%) rotate(${degrees}deg)`, willChange: 'transform' }}
        >
             <div className="w-full h-full bg-gradient-to-t from-transparent via-acid to-acid shadow-[0_0_15px_rgba(204,255,0,0.8)]"></div>
             {/* Tip Glow */}
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-acid rounded-full shadow-[0_0_10px_rgba(204,255,0,1)]"></div>
        </div>

        {/* Center Digital Readout */}
        <div className="absolute z-20 flex flex-col items-center mix-blend-difference">
          <div className="text-6xl font-display font-bold text-white tracking-tighter leading-none flex w-[180px] justify-center">
            <span className="w-[1.1em] text-center">{hours}</span>
            <span className="animate-pulse">:</span>
            <span className="w-[1.1em] text-center">{minutes}</span>
          </div>
          <div className="flex items-center gap-2 mt-2 w-[180px] justify-center">
            <span className="text-xl font-mono text-acid w-[1.5em] text-center">{seconds}</span>
            <span className="text-xs font-mono text-white/50 w-[1.5em] text-left">.{millis}</span>
          </div>
        </div>
      </div>

      {/* Sunrise / Sunset Stats */}
      <div className={`mt-12 w-full flex justify-between items-end px-12 max-w-sm transition-opacity duration-1000 ${hasLocation ? 'opacity-100' : 'opacity-30'}`}>
        {/* Sunrise */}
        <div className="flex flex-col items-center gap-2">
             <div className="text-white/40">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v2" />
                    <path d="m4.93 4.93 1.41 1.41" />
                    <path d="M20 12h2" />
                    <path d="m19.07 4.93-1.41 1.41" />
                    <path d="M15.91 11.63c.85-.24 1.53-.9 1.53-1.84 0-1.21-1.09-2.19-2.44-2.19h-1.55v4.38h1.8c.68 0 1.25-.43 1.46-1.05z" stroke="none" fill="none"/>
                    <path d="M17 18H7" />
                    <path d="M12 18v-6" />
                    <path d="M12 12l4-4" />
                    <path d="M12 12l-4-4" />
                    <path d="M8 12H2" />
                    {/* Simplified Sunrise: Horizon + Up Arrow + Half Sun */}
                    <path d="M3 17h18" />
                    <path d="M7 17l5-5 5 5" />
                    <path d="M12 12v5" />
                </svg>
            </div>
            <div className="text-white font-mono text-xs tracking-widest tabular-nums">
                {sunTimes.sunrise}
            </div>
        </div>

        {/* Sunset */}
        <div className="flex flex-col items-center gap-2">
            <div className="text-white/40">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 17h18" />
                    <path d="M7 12l5 5 5-5" />
                    <path d="M12 17V12" />
                </svg>
            </div>
            <div className="text-white font-mono text-xs tracking-widest tabular-nums">
                {sunTimes.sunset}
            </div>
        </div>
      </div>
      
      {!hasLocation && (
          <div className="absolute bottom-8 text-[9px] text-white/20 uppercase tracking-widest">
              Locating...
          </div>
      )}
    </div>
  );
};
