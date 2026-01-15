
import React, { useEffect, useState } from 'react';

export const DayPulse: React.FC = () => {
  const [percent, setPercent] = useState("0.00");

  useEffect(() => {
    let frameId: number;
    const update = () => {
      const now = new Date();
      const totalSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds() + now.getMilliseconds() / 1000;
      const p = (totalSeconds / 86400) * 100;
      setPercent(p.toFixed(2));
      frameId = requestAnimationFrame(update);
    };
    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative select-none">
      {/* Background Pulse/Glow - Minimal */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-64 bg-acid/5 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-2 mix-blend-difference">
        <h1 className="text-6xl font-display font-bold text-white tracking-tighter tabular-nums drop-shadow-2xl">
          {percent}<span className="text-2xl text-acid ml-1">%</span>
        </h1>
        <span className="text-[9px] font-mono text-white/40 tracking-[0.3em] uppercase">
          Day Complete
        </span>
      </div>
    </div>
  );
};
