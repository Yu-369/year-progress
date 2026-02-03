
import React, { useState, useEffect, useCallback } from 'react';
import { DayData, DayLog, Theme } from '../types';
import { formatDate } from '../utils/dateHelper';

interface DayDetailModalProps {
    day: DayData;
    existingLog?: DayLog;
    onClose: () => void;
    onSave?: (log: DayLog) => void;
    onDelete?: () => void;
    onSetDeadline?: () => void;
    theme: Theme;
}

export const DayDetailModal: React.FC<DayDetailModalProps> = ({ day, existingLog, onClose, onSave, onDelete, onSetDeadline, theme }) => {
    const [note, setNote] = useState(existingLog?.note || '');
    const [impact, setImpact] = useState<DayLog['impact']>(existingLog?.impact || 'NEUTRAL');
    const [animateIn, setAnimateIn] = useState(false);
    const isExpressive = theme === 'EXPRESSIVE';

    useEffect(() => {
        // Slight delay to allow DOM paint before triggering CSS transition
        const timer = setTimeout(() => setAnimateIn(true), 20);
        return () => clearTimeout(timer);
    }, []);

    const triggerHaptic = useCallback((type: 'tick' | 'overdrive' | 'heavy' = 'tick') => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            if (type === 'heavy') {
                navigator.vibrate(50);
            } else {
                navigator.vibrate(type === 'overdrive' ? [30, 50, 30, 50, 30] : 10);
            }
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
        if (onSave) {
            triggerHaptic('overdrive');
            onSave({ note, impact, timestamp: Date.now() });
            handleClose();
        }
    };

    const isHigh = impact === 'HIGH';
    const isMute = impact === 'LOW';

    // M3E Colors vs Standard
    const accentColor = isExpressive ? '#D0BCFF' : '#CCFF00'; // Purple 80 vs Acid
    const highShadow = isExpressive ? 'rgba(208, 188, 255, 0.3)' : 'rgba(204, 255, 0, 0.3)';
    const highGlow = isExpressive ? '#D0BCFF' : '#CCFF00';

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center pointer-events-none perspective-[2000px]">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 transition-all duration-700 ease-premium pointer-events-auto backdrop-blur-xl
            ${isHigh ? (isExpressive ? 'bg-[#D0BCFF]/10' : 'bg-acid/10') : 'bg-black/60'}
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
            ${isExpressive ? 'sm:rounded-tl-[48px] sm:rounded-tr-[16px] sm:rounded-bl-[16px] sm:rounded-br-[48px] rounded-t-[48px]' : 'sm:rounded-[3rem] rounded-t-[3rem]'}
            shadow-2xl
            ${isHigh ? `border-[${accentColor}]` : 'border-white/10 shadow-black'}
            ${animateIn ? 'translate-y-0 rotate-x-0 scale-100' : 'translate-y-[110%] rotate-x-10 scale-95'}
        `}
                style={{ 
                    maxHeight: '90dvh',
                    borderColor: isHigh ? accentColor : 'rgba(255,255,255,0.1)',
                    boxShadow: isHigh ? `0 0 100px ${highShadow}` : '0 25px 50px -12px rgba(0,0,0,0.5)',
                    backgroundColor: isExpressive ? '#1D1626' : '#080808'
                }}
            >
                {/* Visual FX Layers */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none noise-overlay" />
                {isHigh && <div className="scanline opacity-20 animate-scan" />}

                {/* Intensity Header */}
                <div 
                    className={`w-full h-1 transition-all duration-700`}
                    style={{ 
                        backgroundColor: isHigh ? accentColor : 'rgba(255,255,255,0.05)',
                        boxShadow: isHigh ? `0 0 20px ${highGlow}` : 'none'
                    }} 
                />

                <div className="p-8 sm:p-10 flex flex-col relative z-10 h-full overflow-y-auto no-scrollbar">
                    <div className="flex justify-between items-start mb-8">
                        <div className="flex flex-col gap-1">
                            <p 
                                className="text-[9px] font-mono tracking-[0.4em] uppercase transition-colors duration-500"
                                style={{ color: isHigh ? accentColor : 'rgba(255,255,255,0.3)' }}
                            >
                                {day.isFuture ? 'Timeline Forward' : (isHigh ? 'High Impact' : isMute ? 'Low Impact' : 'Standard Log')}
                            </p>
                            <div className="flex items-center gap-4">
                                <h2 className={`text-5xl font-display font-bold tracking-tighter leading-none transition-all duration-700 ${isMute ? 'text-white/40' : 'text-white'}`}
                                    style={{ 
                                        color: isHigh ? accentColor : undefined,
                                        textShadow: isHigh ? `0 0 15px ${highShadow}` : undefined
                                    }}
                                >
                                    {formatDate(day.date)}
                                </h2>
                                {/* Minimal Add Deadline Button (Future Only) */}
                                {day.isFuture && onSetDeadline && (
                                    <button
                                        onClick={() => {
                                            triggerHaptic('heavy');
                                            onSetDeadline();
                                        }}
                                        className="w-12 h-12 rounded-full border border-red-500/50 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="12" y1="5" x2="12" y2="19" />
                                            <line x1="5" y1="12" x2="19" y2="12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                        <button type="button" onClick={handleClose} className="p-2 -mr-2 text-white/20 hover:text-white transition-all active:scale-90 bg-white/5 rounded-full">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Content Body: Log Inputs for Past/Today, Empty/Overview for Future */}
                    {!day.isFuture ? (
                        <>
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
                                                ? 'scale-110 z-10'
                                                : 'opacity-50 hover:opacity-100'}
                                `}
                                        style={{
                                            borderColor: isHigh ? accentColor : `${accentColor}33`,
                                            backgroundColor: isHigh ? accentColor : `${accentColor}0D`,
                                            color: isHigh ? '#000' : accentColor,
                                            boxShadow: isHigh ? `0 0 40px ${highShadow}` : 'none'
                                        }}
                                    >
                                        {isHigh && <div className="absolute inset-0 bg-white/20 animate-pulse" />}
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className={isHigh ? 'animate-bounce' : ''}>
                                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                                        </svg>
                                        <span className={`text-[9px] font-mono tracking-[0.2em] font-bold uppercase`}>Surge</span>
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
                                ${isMute ? 'bg-[#111] border-white/5 text-white/60 placeholder-white/10 focus:bg-[#161616] focus:border-white/10' : ''}
                            `}
                                    style={isHigh ? {
                                        backgroundColor: `${accentColor}0D`,
                                        borderColor: `${accentColor}4D`,
                                        color: accentColor,
                                        // placeholderColor handled via class if possible or inline opacity
                                    } : !isMute ? {
                                        backgroundColor: 'rgba(255,255,255,0.05)',
                                        borderColor: 'transparent',
                                        color: 'white'
                                    } : {}}
                                    spellCheck={false}
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-4 mt-auto">
                                {existingLog && onDelete && (
                                    <button type="button" onClick={onDelete} className="px-6 py-4 rounded-2xl border border-red-500/20 text-red-500/50 uppercase tracking-[0.2em] text-[10px] font-mono hover:bg-red-500/10 hover:text-red-500 transition-all">
                                        Purge
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    className={`flex-1 py-4 rounded-2xl font-bold uppercase tracking-[0.4em] text-xs transition-all duration-500 ease-bounce-sm active:scale-95
                                ${!isHigh ? 'bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.2)]' : ''}
                            `}
                                    style={isHigh ? {
                                        backgroundColor: accentColor,
                                        color: 'black',
                                        boxShadow: `0 0 30px ${highGlow}`
                                    } : {}}
                                >
                                    Save Signal
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-white/20 pb-12">
                            <div className="w-16 h-16 border border-white/10 rounded-full flex items-center justify-center mb-4">
                                <span className="text-2xl">⏳</span>
                            </div>
                            <p className="font-mono text-xs tracking-widest uppercase">Future Event</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
