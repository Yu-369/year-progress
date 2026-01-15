import React, { useEffect, useState, useMemo, useCallback, useRef, memo } from 'react';
import { getSunTimes } from '../utils/dateHelper';

// Memoized static tick marks to prevent re-renders
const TickMarks = memo(() => (
  <>
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
  </>
));
TickMarks.displayName = 'TickMarks';

// Memoized Sunrise Icon
const SunriseIcon = memo(() => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {/* Horizon */}
    <line x1="2" y1="18" x2="22" y2="18" />
    {/* Sun arc rising */}
    <path d="M12 14a4 4 0 0 1 0-8" />
    <path d="M12 14a4 4 0 0 0 0-8" />
    {/* Arrow up */}
    <path d="M12 2v4" />
    <path d="M9 5l3-3 3 3" />
  </svg>
));
SunriseIcon.displayName = 'SunriseIcon';

// Memoized Sunset Icon
const SunsetIcon = memo(() => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {/* Horizon */}
    <line x1="2" y1="18" x2="22" y2="18" />
    {/* Sun arc setting */}
    <path d="M12 14a4 4 0 0 1 0-8" />
    <path d="M12 14a4 4 0 0 0 0-8" />
    {/* Arrow down */}
    <path d="M12 22v-4" />
    <path d="M9 19l3 3 3-3" />
  </svg>
));
SunsetIcon.displayName = 'SunsetIcon';

export const DayPulse: React.FC = () => {
  const [now, setNow] = useState(new Date());
  const [sunTimes, setSunTimes] = useState({ sunrise: '--:--', sunset: '--:--' });
  const [hasLocation, setHasLocation] = useState(false);
  const locationFetched = useRef(false);

  // Optimized animation loop with reduced state updates
  useEffect(() => {
    let frameId: number;
    let lastUpdate = 0;
    const targetFps = 30; // Cap at 30fps for smooth but efficient updates
    const frameInterval = 1000 / targetFps;

    const update = (timestamp: number) => {
      if (timestamp - lastUpdate >= frameInterval) {
        setNow(new Date());
        lastUpdate = timestamp;
      }
      frameId = requestAnimationFrame(update);
    };
    frameId = requestAnimationFrame(update);

    return () => cancelAnimationFrame(frameId);
  }, []);

  // Separate effect for location - runs only once
  useEffect(() => {
    if (locationFetched.current) return;
    locationFetched.current = true;

    if ('geolocation' in navigator) {
      // Use cached position first if available
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const times = getSunTimes(new Date(), latitude, longitude);
          setSunTimes(times);
          setHasLocation(true);
        },
        (err) => {
          console.warn("Location access denied or unavailable:", err);
          setHasLocation(false);
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 3600000 // Cache for 1 hour
        }
      );
    }
  }, []);

  // Memoized calculations
  const { degrees, hours, minutes, seconds, millis } = useMemo(() => {
    const totalSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds() + now.getMilliseconds() / 1000;
    const progress = totalSeconds / 86400;
    return {
      degrees: progress * 360,
      hours: now.getHours().toString().padStart(2, '0'),
      minutes: now.getMinutes().toString().padStart(2, '0'),
      seconds: now.getSeconds().toString().padStart(2, '0'),
      millis: Math.floor(now.getMilliseconds() / 10).toString().padStart(2, '0')
    };
  }, [now]);

  // Memoized sweep style to prevent object recreation
  const sweepStyle = useMemo(() => ({
    willChange: 'background' as const,
    background: `conic-gradient(from 0deg, rgba(204, 255, 0, 0.15) 0deg, rgba(204, 255, 0, 0.0) ${degrees}deg, transparent ${degrees}deg)`,
    maskImage: 'radial-gradient(circle, transparent 30%, black 100%)',
    WebkitMaskImage: 'radial-gradient(circle, transparent 30%, black 100%)'
  }), [degrees]);

  const needleStyle = useMemo(() => ({
    transform: `translateX(-50%) rotate(${degrees}deg)`,
    willChange: 'transform' as const
  }), [degrees]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative select-none">
      {/* Radar Container */}
      <div className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] flex-shrink-0 aspect-square flex items-center justify-center">

        {/* Outer Ring */}
        <div className="absolute inset-0 border border-white/10 rounded-full" />

        {/* Ticks - 24 hours (memoized) */}
        <TickMarks />

        {/* The Sweep */}
        <div
          className="absolute inset-4 rounded-full"
          style={sweepStyle}
        />

        {/* The Needle */}
        <div
          className="absolute top-0 left-1/2 w-0.5 h-[50%] origin-bottom z-10"
          style={needleStyle}
        >
          <div className="w-full h-full bg-gradient-to-t from-transparent via-acid to-acid shadow-[0_0_15px_rgba(204,255,0,0.8)]" />
          {/* Tip Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-acid rounded-full shadow-[0_0_10px_rgba(204,255,0,1)]" />
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
            <SunriseIcon />
          </div>
          <div className="text-white font-mono text-xs tracking-widest tabular-nums">
            {sunTimes.sunrise}
          </div>
        </div>

        {/* Sunset */}
        <div className="flex flex-col items-center gap-2">
          <div className="text-white/40">
            <SunsetIcon />
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
