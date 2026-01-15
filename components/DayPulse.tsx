
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
    return () => cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    // 1. Try to load cached location first (Indefinite persistence as requested)
    const cached = localStorage.getItem('year_progress_location_cache');
    if (cached) {
      try {
        const { lat, lng } = JSON.parse(cached);
        // Use cached location immediately regardless of age
        setSunTimes(getSunTimes(new Date(), lat, lng));
        setHasLocation(true);
      } catch (e) {
        console.error("Cache parse error", e);
      }
    }

    // 2. Attempt fresh fetch (silent update)
    const timeoutId = setTimeout(() => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const times = getSunTimes(new Date(), latitude, longitude);
            setSunTimes(times);
            setHasLocation(true);

            // Update cache (Persistent)
            localStorage.setItem('year_progress_location_cache', JSON.stringify({
              lat: latitude,
              lng: longitude,
              timestamp: Date.now()
            }));
          },
          (err) => {
            console.warn("Location update failed, using cache if available:", err);
            // If we have cache, we are already good. If not, we stay in 'Locating...'
            // But usually cache is expected after first run.
          },
          { enableHighAccuracy: false, timeout: 5000, maximumAge: 600000 }
        );
      }
    }, 100);

    return () => clearTimeout(timeoutId);
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
      {/* Radar Ring */}
      <div className="absolute inset-0 rounded-full border border-white/5 md:scale-90 scale-[0.8] animate-pulse-slow"></div>

      {/* Scanning Line */}
      <div
        className="absolute inset-0 rounded-full"
        style={{ transform: `rotate(${degrees}deg)` }}
      >
        <div className="w-[1px] h-[50%] bg-gradient-to-t from-transparent via-acid/50 to-acid mx-auto shadow-[0_0_15px_#CCFF00]"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-4 mix-blend-difference">
        {/* Main Time Display */}
        <div className="flex flex-col items-center">
          <div className="flex items-baseline gap-1">
            <span className="text-6xl md:text-8xl font-display font-bold text-white tracking-tighter tabular-nums drop-shadow-2xl">
              {hours}:{minutes}
            </span>
            <span className="text-xl md:text-2xl font-mono text-acid font-bold tracking-widest opacity-80">
              :{seconds}
            </span>
          </div>
          <span className="text-[10px] md:text-xs font-mono text-white/30 tracking-[0.5em] uppercase mt-2">
            Local Mean Time
          </span>
        </div>

        {/* Sunrise / Sunset Data */}
        <div className="flex gap-8 mt-4">
          <div className="flex flex-col items-center group">
            <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest group-hover:text-gold/60 transition-colors">Sunrise</span>
            <span className="text-lg font-display font-bold text-white/60 tracking-tight group-hover:text-gold transition-colors filter blur-[0.5px] group-hover:blur-0 duration-500">
              {hasLocation ? sunTimes.sunrise : <span className="animate-pulse">--:--</span>}
            </span>
          </div>

          <div className="w-[1px] h-8 bg-white/10 rotate-12"></div>

          <div className="flex flex-col items-center group">
            <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest group-hover:text-purple-400/60 transition-colors">Sunset</span>
            <span className="text-lg font-display font-bold text-white/60 tracking-tight group-hover:text-purple-400 transition-colors filter blur-[0.5px] group-hover:blur-0 duration-500">
              {hasLocation ? sunTimes.sunset : <span className="animate-pulse">--:--</span>}
            </span>
          </div>
        </div>

        {/* Dynamic Location Status */}
        <div className="absolute -bottom-20 md:-bottom-24">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all duration-1000 ${hasLocation ? 'border-acid/20 bg-acid/5' : 'border-white/5 bg-transparent'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${hasLocation ? 'bg-acid shadow-[0_0_5px_#CCFF00]' : 'bg-red-500 animate-ping'}`}></div>
            <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">
              {hasLocation ? 'Orbital Lock' : 'Locating...'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
