
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
    // Slight delay to allow DOM paint before triggering CSS transition
    const timer = setTimeout(() => setAnimateIn(true), 20);
    return () => clearTimeout(timer);
  }, []);

  const triggerHaptic = useCallback((type: 'tick' | 'overdrive' = 'tick') => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(type === 'overdrive' ? [30, 50, 30, 50, 30] : 10);
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
    setTimeout(onClose, 500); // Wait for exit animation
  };

  const handleSave = () => {
    triggerHaptic('overdrive');
    onSave({ note, impact, timestamp: Date.now() });
    handleClose();
  };

  const isHigh = impact === 'HIGH';
  const isMute = impact === 'LOW';

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center pointer-events-none perspective-[2000px]">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 transition-all duration-700 ease-premium pointer-events-auto backdrop-blur-xl
            ${isHigh ? 'bg-acid/10' : 'bg-black/60'}
            ${animateIn ? 'opacity-100' : 'opacity-0'}
        `}
        onClick={(e) => {
            e.stopPropagation();
            handleClose();
        }}
      />

      {/* Main Interface */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full sm:max-w-lg bg-[#080808] overflow-hidden pointer-events-auto flex flex-col
            border-t sm:border transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)]
            sm:rounded-[3rem] rounded-t-[3rem] shadow-2xl
            ${isHigh ? 'border-acid shadow-[0_0_100px_rgba(204,255,0,0.3)]' : 'border-white/10 shadow-black'}
            ${animateIn ? 'translate-y-0 rotate-x-0 scale-100' : 'translate-y-[110%] rotate-x-10 scale-95'}
        `}
        style={{ maxHeight: '90dvh' }}
      >
        {/* Visual FX Layers */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none noise-overlay" />
        {isHigh && <div className="scanline opacity-20 animate-scan" />}

        {/* Intensity Header */}
        <div className={`w-full h-1 transition-all duration-700 ${isHigh ? 'bg-acid shadow-[0_0_20px_#CCFF00]' : 'bg-white/5'}`} />

        <div className="p-8 sm:p-10 flex flex-col relative z-10 h-full overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-start mb-8">
                <div className="flex flex-col gap-1">
                    <p className={`text-[9px] font-mono tracking-[0.4em] uppercase transition-colors duration-500 ${isHigh ? 'text-acid' : 'text-white/30'}`}>
                        {isHigh ? 'High Impact' : isMute ? 'Low Impact' : 'Standard Log'}
                    </p>
                    <h2 className={`text-5xl font-display font-bold tracking-tighter leading-none transition-all duration-700
                        ${isHigh ? 'text-acid drop-shadow-[0_0_15px_rgba(204,255,0,0.4)] animate-glitch-text' : 'text-white'}
                        ${isMute ? 'text-white/40' : ''}
                    `}>
                        {formatDate(day.date)}
                    </h2>
                </div>
                <button type="button" onClick={handleClose} className="p-2 -mr-2 text-white/20 hover:text-white transition-all active:scale-90 bg-white/5 rounded-full">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* THE REACTOR SELECTOR */}
            <div className="mb-8">
                <div className="grid grid-cols-3 gap-3 h-32">
                    
                    {/* MUTE (LOW) - Stealth Aesthetic */}
                    <button 
                        type="button"
                        onClick={() => handleImpactSelect('LOW')}
                        className={`group relative rounded-2xl border transition-all duration-500 ease-out flex flex-col items-center justify-center gap-3 overflow-hidden
                            ${impact === 'LOW' 
                                ? 'border-white/10 bg-[#151515] opacity-100 shadow-[inset_0_0_20px_rgba(0,0,0,1)]' 
                                : 'border-white/5 bg-transparent opacity-40 hover:opacity-70'}
                        `}
                    >
                        <div className={`w-6 h-0.5 rounded-full transition-all duration-500 ${impact === 'LOW' ? 'bg-white/30 w-8' : 'bg-white/20'}`} />
                        <span className={`text-[9px] font-mono tracking-widest uppercase transition-colors ${impact === 'LOW' ? 'text-white/50' : 'text-white/20'}`}>Mute</span>
                    </button>

                    {/* STABLE (NEUTRAL) - Glass Aesthetic */}
                    <button 
                        type="button"
                        onClick={() => handleImpactSelect('NEUTRAL')}
                        className={`group relative rounded-2xl border transition-all duration-500 ease-out flex flex-col items-center justify-center gap-3
                            ${impact === 'NEUTRAL' 
                                ? 'border-white bg-white/10 scale-105 shadow-xl text-white' 
                                : 'border-white/5 bg-transparent opacity-40 hover:opacity-70 text-white/50'}
                        `}
                    >
                        <div className={`w-3 h-3 rounded-sm border-2 transition-all duration-500 rotate-45 ${impact === 'NEUTRAL' ? 'border-white bg-white shadow-[0_0_10px_white]' : 'border-white/30'}`} />
                        <span className="text-[9px] font-mono tracking-widest uppercase">Stable</span>
                    </button>

                    {/* SURGE (HIGH) - Radioactive Aesthetic */}
                    <button 
                        type="button"
                        onClick={() => handleImpactSelect('HIGH')}
                        className={`relative rounded-2xl border transition-all duration-300 ease-bounce-sm flex flex-col items-center justify-center gap-2 overflow-hidden
                            ${isHigh 
                                ? 'border-acid bg-acid text-black scale-110 shadow-[0_0_40px_rgba(204,255,0,0.5)] z-10' 
                                : 'border-acid/20 text-acid bg-acid/5 opacity-50 hover:opacity-100 hover:bg-acid/10'}
                        `}
                    >
                        {isHigh && <div className="absolute inset-0 bg-white/20 animate-pulse" />}
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className={isHigh ? 'animate-bounce' : ''}>
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                        </svg>
                        <span className={`text-[9px] font-mono tracking-[0.2em] font-bold uppercase ${isHigh ? 'text-black' : 'text-acid'}`}>Surge</span>
                    </button>
                </div>
            </div>

            {/* Input Area */}
            <div className="flex flex-col mb-8 flex-1">
                <label className="text-[9px] font-mono uppercase tracking-widest text-white/30 mb-2 pl-1">Daily Log</label>
                <textarea 
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Reflect on today..."
                    className={`w-full h-32 rounded-2xl p-4 text-base font-sans leading-relaxed resize-none focus:outline-none transition-all duration-500 border
                        ${isHigh 
                            ? 'bg-acid/5 border-acid/30 text-acid placeholder-acid/20 focus:bg-acid/10' 
                            : isMute 
                                ? 'bg-[#111] border-white/5 text-white/60 placeholder-white/10 focus:bg-[#161616] focus:border-white/10'
                                : 'bg-white/5 border-transparent text-white placeholder-white/20 focus:bg-white/10 focus:border-white/10'}
                    `}
                    spellCheck={false}
                />
            </div>

            {/* Actions */}
            <div className="flex gap-4 mt-auto">
                {existingLog && (
                    <button type="button" onClick={onDelete} className="px-6 py-4 rounded-2xl border border-red-500/20 text-red-500/50 uppercase tracking-[0.2em] text-[10px] font-mono hover:bg-red-500/10 hover:text-red-500 transition-all">
                        Purge
                    </button>
                )}
                <button 
                    type="button"
                    onClick={handleSave}
                    className={`flex-1 py-4 rounded-2xl font-bold uppercase tracking-[0.4em] text-xs transition-all duration-500 ease-bounce-sm active:scale-95
                        ${isHigh 
                            ? 'bg-acid text-black shadow-[0_0_30px_#CCFF00]' 
                            : 'bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.2)]'}
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
