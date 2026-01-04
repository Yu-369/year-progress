
import React, { useState, useEffect, useCallback } from 'react';
import { DayData, DayLog } from '../types';
import { formatDate } from '../utils/dateHelper';

interface DayDetailModalProps {
  day: DayData;
  existingLog?: DayLog;
  onClose: () => void;
  onSave: (log: DayLog) => void;
  onDelete: () => void;
}

export const DayDetailModal: React.FC<DayDetailModalProps> = ({ day, existingLog, onClose, onSave, onDelete }) => {
  const [note, setNote] = useState(existingLog?.note || '');
  const [impact, setImpact] = useState<DayLog['impact']>(existingLog?.impact || 'NEUTRAL');
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimateIn(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const triggerHaptic = useCallback((type: 'tick' | 'overdrive' = 'tick') => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      // More aggressive vibration for Surge
      navigator.vibrate(type === 'overdrive' ? [30, 50, 30, 50, 30] : 15);
    }
  }, []);

  const handleImpactSelect = (level: DayLog['impact']) => {
    if (level === impact) return;
    if (level === 'HIGH') {
        triggerHaptic('overdrive');
    } else {
        triggerHaptic('tick');
    }
    setImpact(level);
  };

  const handleClose = () => {
    setAnimateIn(false);
    setTimeout(onClose, 400); 
  };

  const handleSave = () => {
    triggerHaptic('overdrive');
    onSave({ note, impact, timestamp: Date.now() });
    handleClose();
  };

  const isHigh = impact === 'HIGH';
  const isLow = impact === 'LOW';

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center pointer-events-none perspective-[2000px]">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 transition-all duration-1000 ease-in-out pointer-events-auto backdrop-blur-3xl
            ${isHigh ? 'bg-acid/20' : 'bg-void/95'}
            ${animateIn ? 'opacity-100' : 'opacity-0'}
        `}
        onClick={handleClose}
      />

      {/* Main Interface */}
      <div 
        className={`relative w-full sm:max-w-lg bg-[#050505] overflow-hidden pointer-events-auto flex flex-col
            border-t sm:border transition-all duration-500 cubic-bezier(0.19, 1, 0.22, 1)
            sm:rounded-[3rem] rounded-t-[3rem]
            ${isHigh ? 'border-acid shadow-[0_0_120px_rgba(204,255,0,0.4)]' : 'border-white/10'}
            ${animateIn ? 'translate-y-0 rotate-x-0' : 'translate-y-full rotate-x-12'}
        `}
        style={{ maxHeight: '96dvh' }}
      >
        {/* Visual FX Layers */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none noise-overlay" />
        {isHigh && <div className="scanline opacity-30 animate-scan" />}

        {/* Intensity Header */}
        <div className={`w-full h-1 transition-all duration-500 ${isHigh ? 'bg-acid shadow-[0_0_20px_#CCFF00]' : 'bg-white/10'}`} />

        <div className="p-8 sm:p-12 flex flex-col relative z-10">
            <div className="flex justify-between items-start mb-10">
                <div>
                    <p className={`text-[10px] font-mono tracking-[0.6em] uppercase mb-3 transition-colors ${isHigh ? 'text-acid' : 'text-white/30'}`}>
                        {isHigh ? 'Overdrive Mode' : 'Standard Log'}
                    </p>
                    <h2 className={`text-7xl font-display font-bold tracking-tighter leading-none transition-all duration-500
                        ${isHigh ? 'text-acid drop-shadow-[0_0_15px_rgba(204,255,0,0.6)] animate-glitch-text' : 'text-white'}
                        ${isLow ? 'opacity-30' : 'opacity-100'}
                    `}>
                        {formatDate(day.date)}
                    </h2>
                </div>
                <button onClick={handleClose} className="p-2 text-white/20 hover:text-white transition-all active:scale-50">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* THE REACTOR SELECTOR */}
            <div className="mb-12">
                <div className="grid grid-cols-3 gap-4 h-32">
                    
                    {/* LOW */}
                    <button onClick={() => handleImpactSelect('LOW')}
                        className={`relative rounded-2xl border transition-all duration-500 flex flex-col items-center justify-center gap-3
                            ${impact === 'LOW' ? 'border-white bg-white/5 opacity-100' : 'border-white/5 opacity-40 hover:opacity-60'}
                        `}
                    >
                        <div className="w-6 h-0.5 bg-white" />
                        <span className="text-[9px] font-mono tracking-widest uppercase">Mute</span>
                    </button>

                    {/* NEUTRAL */}
                    <button onClick={() => handleImpactSelect('NEUTRAL')}
                        className={`relative rounded-2xl border transition-all duration-500 flex flex-col items-center justify-center gap-3
                            ${impact === 'NEUTRAL' ? 'border-white bg-white/10 scale-105 shadow-xl' : 'border-white/5 opacity-40 hover:opacity-60'}
                        `}
                    >
                        <div className="w-3 h-3 rounded-full border-2 border-white" />
                        <span className="text-[9px] font-mono tracking-widest uppercase">Stable</span>
                    </button>

                    {/* HIGH (THE SURGE) */}
                    <button onClick={() => handleImpactSelect('HIGH')}
                        className={`relative rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center gap-2 overflow-hidden
                            ${isHigh ? 'border-acid bg-acid text-black scale-110 shadow-[0_0_50px_rgba(204,255,0,0.6)]' : 'border-acid/20 text-acid opacity-40 hover:opacity-100'}
                        `}
                    >
                        {isHigh && <div className="absolute inset-0 bg-white/20 animate-pulse" />}
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className={isHigh ? 'animate-bounce' : ''}>
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                        </svg>
                        <span className={`text-[9px] font-mono tracking-[0.2em] font-bold uppercase ${isHigh ? 'text-black' : 'text-acid'}`}>Surge</span>
                    </button>
                </div>
            </div>

            {/* Input Area */}
            <div className="flex flex-col min-h-[200px]">
                <textarea 
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Capture the day's essence..."
                    className={`w-full flex-1 bg-transparent text-2xl font-display leading-[1.1] resize-none focus:outline-none p-0 transition-colors duration-500
                        ${isHigh ? 'text-acid placeholder-acid/20' : 'text-white placeholder-white/5'}
                    `}
                    autoFocus={!existingLog}
                    spellCheck={false}
                />
            </div>

            {/* Actions */}
            <div className="flex gap-4 mt-12">
                {existingLog && (
                    <button onClick={onDelete} className="px-8 py-5 rounded-3xl border border-red-500/20 text-red-500/50 uppercase tracking-[0.3em] text-[10px] font-mono hover:bg-red-500/10 transition-all">
                        Purge
                    </button>
                )}
                <button 
                    onClick={handleSave}
                    className={`flex-1 py-6 rounded-3xl font-bold uppercase tracking-[0.5em] text-xs transition-all duration-500 active:scale-90
                        ${isHigh ? 'bg-acid text-black shadow-[0_0_40px_#CCFF00]' : 'bg-white text-black'}
                    `}
                >
                    Save Signal
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
