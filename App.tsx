
import React, { useEffect, useState, useMemo, useRef } from 'react';
// @ts-ignore
import html2canvas from 'html2canvas';
import { motion, AnimatePresence } from 'framer-motion';
import { generateYearData, formatDate } from './utils/dateHelper';
import { getLogs, saveLog, deleteLog, getDateId } from './utils/storage';
import { YearData, DayData, ViewMode, Gender, DayLog } from './types';
import { StatsHeader } from './components/StatsHeader';
import { YearGrid } from './components/YearGrid';
import { DayPulse } from './components/DayPulse';
import { LifeGrid } from './components/LifeGrid';
import { ViewToggle } from './components/ViewToggle';
import { DayDetailModal } from './components/DayDetailModal';

// -- Scramble Hook --
const useScrambleNumber = (target: number, duration: number = 2000, decimals: number = 0) => {
  const [display, setDisplay] = useState("0");
  
  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const val = ease * target;
      setDisplay(val.toFixed(decimals));
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [target, duration, decimals]);
  
  return display;
};

// -- Precise Timer Hook --
const usePreciseProgress = (totalDays: number) => {
    const [percentage, setPercentage] = useState("0.000000");
    useEffect(() => {
        const update = () => {
            const now = new Date();
            const start = new Date(now.getFullYear(), 0, 1);
            const end = new Date(now.getFullYear() + 1, 0, 1);
            const total = end.getTime() - start.getTime();
            const passed = now.getTime() - start.getTime();
            const p = (passed / total) * 100;
            setPercentage(p.toFixed(6));
        };
        const timer = setInterval(update, 50);
        update();
        return () => clearInterval(timer);
    }, [totalDays]);
    return percentage;
}

const App: React.FC = () => {
  // -- Data State --
  const [data, setData] = useState<YearData | null>(null);
  const [logs, setLogs] = useState<Record<string, DayLog>>({});
  
  // -- User Settings State --
  const [gender, setGender] = useState<Gender>('MALE');
  const [birthDate, setBirthDate] = useState<Date>(new Date(2000, 0, 1)); 
  
  // -- UI State --
  const [hoveredDay, setHoveredDay] = useState<DayData | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState<ViewMode>(ViewMode.MESO);
  // Default to true for the 15-col grid view
  const [isYearOverview, setIsYearOverview] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // -- Swipe Handling --
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    setData(generateYearData());
    setLogs(getLogs()); // Load saved logs
    setMounted(true);
    const interval = setInterval(() => setData(generateYearData()), 60000);
    return () => clearInterval(interval);
  }, []);

  const triggerHaptic = (type: 'light' | 'heavy' | 'tick' = 'light') => {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(type === 'heavy' ? 20 : 5);
      }
  };

  const handleVoidClick = () => {
    if (selectedDay) {
        triggerHaptic('light');
        setSelectedDay(null);
    }
  };

  const handleSelectDay = (day: DayData) => {
    if (!day.isFuture) {
        setSelectedDay(day);
        setHoveredDay(null);
    }
  };

  const handleSaveLog = (log: DayLog) => {
      if (!selectedDay) return;
      const dateId = getDateId(selectedDay.date);
      const updatedLogs = saveLog(dateId, log);
      setLogs(updatedLogs);
      triggerHaptic('heavy');
  };

  const handleDeleteLog = () => {
      if (!selectedDay) return;
      const dateId = getDateId(selectedDay.date);
      const updatedLogs = deleteLog(dateId);
      setLogs(updatedLogs);
      triggerHaptic('heavy');
  }

  const handleExportVisual = async () => {
      setIsExporting(true);
      triggerHaptic('heavy');
      
      setTimeout(async () => {
        const element = document.getElementById('visual-export-target');
        if (element) {
            try {
                const canvas = await html2canvas(element, {
                    backgroundColor: '#050505',
                    scale: 2, // Retina quality
                    logging: false,
                    useCORS: true
                });
                const link = document.createElement('a');
                link.download = `year-progress-snapshot-${new Date().toISOString().slice(0, 10)}.png`;
                link.href = canvas.toDataURL();
                link.click();
            } catch (err) {
                console.error("Export failed", err);
            }
        }
        setIsExporting(false);
      }, 500); // Wait for render
  };

  const handleNativeDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (!val) return;
      
      // Parse YYYY-MM-DD manually to prevent UTC shift
      const [y, m, d] = val.split('-').map(Number);
      const newDate = new Date(y, m - 1, d);
      
      setBirthDate(newDate);
      triggerHaptic('tick');
  };

  // -- SWIPE LOGIC --
  const onTouchStart = (e: React.TouchEvent) => {
      if (e.touches.length > 1) {
          touchStartX.current = null;
          touchStartY.current = null;
          return;
      }
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
      if (!touchStartX.current || !touchStartY.current) return;
      
      const diffX = touchStartX.current - e.changedTouches[0].clientX;
      const diffY = touchStartY.current - e.changedTouches[0].clientY;

      touchStartX.current = null;
      touchStartY.current = null;

      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
          if (diffX > 0) {
              if (currentView === ViewMode.MICRO) setCurrentView(ViewMode.MESO);
              else if (currentView === ViewMode.MESO) setCurrentView(ViewMode.MACRO);
          } else {
              if (currentView === ViewMode.MACRO) setCurrentView(ViewMode.MESO);
              else if (currentView === ViewMode.MESO) setCurrentView(ViewMode.MICRO);
          }
          triggerHaptic('light');
      }
  };

  // -- CALCULATE MACRO STATS --
  const macroStats = useMemo(() => {
      const maxYears = gender === 'MALE' ? 71 : 76;
      const totalWeeks = maxYears * 52;
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - birthDate.getTime());
      const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
      const weeksLived = Math.min(diffWeeks, totalWeeks);
      
      const age = (diffTime / (1000 * 60 * 60 * 24 * 365.25)).toFixed(2);
      const percent = ((weeksLived / totalWeeks) * 100);
      
      return { age, percent, maxYears };
  }, [gender, birthDate]);


  if (!mounted || !data) return null;

  const activeDay = hoveredDay;
  const percentage = Math.floor(data.percentage);

  const viewOrder = [ViewMode.MICRO, ViewMode.MESO, ViewMode.MACRO];
  const activeIndex = viewOrder.indexOf(currentView);

  const getSlideStyle = (mode: ViewMode) => {
    const index = viewOrder.indexOf(mode);
    const offset = (index - activeIndex) * 100; 
    return {
      transform: `translateX(${offset}%)`,
      willChange: 'transform',
      visibility: Math.abs(index - activeIndex) > 1 ? 'hidden' as const : 'visible' as const, 
    };
  };

  // -- View Context Labels --
  const getViewTitle = () => {
      switch(currentView) {
          case ViewMode.MICRO: return "Solar Cycle";
          case ViewMode.MESO: return "Annual Orbit";
          case ViewMode.MACRO: return "Life Span";
          default: return "";
      }
  };

  const getViewSubtitle = () => {
      switch(currentView) {
          case ViewMode.MICRO: return "Daily Rotation";
          case ViewMode.MESO: return `Day ${data.daysPassed} of ${data.totalDays}`;
          case ViewMode.MACRO: return "Memento Mori";
          default: return "";
      }
  };

  // Helper for input value
  const dateInputValue = `${birthDate.getFullYear()}-${String(birthDate.getMonth() + 1).padStart(2, '0')}-${String(birthDate.getDate()).padStart(2, '0')}`;

  return (
    <div 
      className="h-[100dvh] w-full bg-void flex flex-col overflow-hidden relative font-sans"
      onClick={handleVoidClick}
    >
      <div className="noise-overlay" />

      {/* -- HIDDEN EXPORT TARGET -- */}
      {isExporting && (
          <div id="visual-export-target" className="fixed top-0 left-0 w-[1080px] h-[1920px] bg-[#050505] z-[9999] p-20 flex flex-col items-center justify-between pointer-events-none">
              <div className="w-full flex justify-between items-start border-b border-white/20 pb-10">
                  <h1 className="text-8xl font-display font-bold text-white tracking-tighter">YEAR<br/><span className="text-acid">{data.year}</span></h1>
              </div>
              <div className="flex-1 w-full flex items-center justify-center my-12 scale-150">
                 <YearGrid 
                    data={data} logs={logs} hoveredDay={null} selectedDay={null} isOverview={true}
                    onHoverDay={() => {}} onSelectDay={() => {}} onToggleOverview={() => {}}
                 />
              </div>
          </div>
      )}

      {/* -- DAY DETAIL MODAL -- */}
      {selectedDay && (
          <DayDetailModal 
            day={selectedDay}
            existingLog={logs[getDateId(selectedDay.date)]}
            onClose={() => setSelectedDay(null)}
            onSave={handleSaveLog}
            onDelete={handleDeleteLog}
          />
      )}
      
      {/* -- SIDEBAR MENU (LEFT DRAWER) -- */}
      <div 
        className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMenuOpen(false)}
      />

      <div 
        className={`
            fixed top-0 bottom-0 left-0 w-80 max-w-[85vw] bg-[#0A0A0A] border-r border-white/10 shadow-[20px_0_40px_rgba(0,0,0,0.5)] z-[65]
            transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] flex flex-col
            ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-1 overflow-y-auto p-8 pt-24 flex flex-col gap-8 no-scrollbar">
             {/* Header */}
             <div className="pb-6 border-b border-white/5">
                <h2 className="text-3xl font-display font-bold text-white tracking-tight">System Config</h2>
            </div>

            {/* 1. Origin Settings (STYLED NATIVE) */}
            <div>
                 <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest block mb-4">Origin Date</span>
                 
                 <div className="relative group w-full cursor-pointer">
                    {/* Visual Layer */}
                    <div className="flex items-stretch bg-[#111] border border-white/10 rounded-xl overflow-hidden transition-all duration-300 group-hover:border-acid/30 group-hover:shadow-[0_0_15px_rgba(204,255,0,0.05)]">
                        {/* Year Block */}
                        <div className="flex-1 flex flex-col items-center justify-center p-3 border-r border-white/10 bg-white/5">
                            <span className="text-[9px] font-mono text-white/30 uppercase">Year</span>
                            <span className="text-xl font-display font-bold text-white tracking-tight">{birthDate.getFullYear()}</span>
                        </div>
                         {/* Month Block */}
                         <div className="flex-1 flex flex-col items-center justify-center p-3 border-r border-white/10">
                            <span className="text-[9px] font-mono text-white/30 uppercase">Month</span>
                            <span className="text-xl font-display font-bold text-white tracking-tight">{String(birthDate.getMonth() + 1).padStart(2, '0')}</span>
                        </div>
                         {/* Day Block */}
                         <div className="flex-1 flex flex-col items-center justify-center p-3 relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <div className="w-1.5 h-1.5 bg-acid rounded-full shadow-[0_0_5px_#CCFF00]"></div>
                             </div>
                            <span className="text-[9px] font-mono text-white/30 uppercase">Day</span>
                            <span className="text-xl font-display font-bold text-white tracking-tight">{String(birthDate.getDate()).padStart(2, '0')}</span>
                        </div>
                    </div>

                    {/* Interaction Layer (Invisible Native Input) */}
                    <input 
                        type="date"
                        required
                        value={dateInputValue}
                        onChange={handleNativeDateChange}
                        onClick={() => triggerHaptic('light')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    />
                 </div>
            </div>

            {/* 2. Biotype Settings */}
            <div>
                 <span className="block text-[10px] font-mono text-white/50 uppercase tracking-widest mb-4">Biotype</span>
                 <div className="flex gap-2">
                    {['MALE', 'FEMALE'].map((g) => (
                    <button
                        key={g}
                        onClick={() => { setGender(g as Gender); triggerHaptic('tick'); }}
                        className={`
                            flex-1 py-4 rounded-xl text-[10px] font-mono tracking-widest uppercase transition-all duration-300 border
                            ${gender === g 
                                ? 'bg-acid text-black border-acid font-bold shadow-[0_0_20px_rgba(204,255,0,0.2)]' 
                                : 'bg-[#111] text-white/30 border-white/10 hover:border-white/20 hover:text-white'}
                        `}
                    >
                        {g}
                    </button>
                    ))}
                 </div>
            </div>

            {/* 3. Actions */}
            <div className="mt-auto pt-8 flex flex-col gap-3">
                 <button 
                    onClick={handleExportVisual}
                    disabled={isExporting}
                    className="w-full py-4 flex items-center justify-center gap-3 rounded-xl border border-white/10 hover:bg-white/5 text-white transition-all active:scale-95 group"
                 >
                    <div className="p-1 rounded bg-white/5 group-hover:bg-white/10 transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-widest">{isExporting ? 'Processing...' : 'Export Visual'}</span>
                 </button>

                 <button 
                    onClick={() => {
                        triggerHaptic('tick');
                        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
                        const anchor = document.createElement('a');
                        anchor.href = dataStr;
                        anchor.download = "year_log_backup.json";
                        anchor.click();
                    }}
                    className="w-full py-4 flex items-center justify-center gap-3 rounded-xl border border-white/10 hover:bg-white/5 text-white transition-all active:scale-95 group"
                 >
                    <div className="p-1 rounded bg-white/5 group-hover:bg-white/10 transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-widest">Backup JSON</span>
                 </button>
            </div>
            
            <div className="pt-8 border-t border-white/5">
                <PreciseTimerDisplay totalDays={data.totalDays} />
            </div>
        </div>
      </div>

      <StatsHeader 
        data={data} 
        isOpen={isMenuOpen}
        onMenuClick={() => setIsMenuOpen(!isMenuOpen)} 
      />
      
      {/* -- VIEW CONTEXT TITLE -- */}
      <div className="fixed top-24 left-0 w-full text-center z-40 pointer-events-none mix-blend-difference">
          <AnimatePresence mode="wait">
            <motion.div
                key={currentView}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="flex flex-col items-center"
            >
                <h2 className="text-xl font-display font-bold text-white tracking-widest uppercase">{getViewTitle()}</h2>
                <span className="text-[10px] font-mono text-white/40 tracking-[0.3em] mt-1 uppercase">{getViewSubtitle()}</span>
            </motion.div>
          </AnimatePresence>
      </div>

      {/* -- MAIN SLIDING STAGE -- */}
      <div 
        className="relative flex-1 w-full h-full overflow-hidden z-10"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        
        {/* VIEW 0: MICRO */}
        <div 
          className="absolute inset-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] w-full h-full"
          style={getSlideStyle(ViewMode.MICRO)}
        >
             <div className="w-full h-full overflow-hidden flex items-center justify-center pt-32 pb-48">
                <DayPulse />
             </div>
        </div>

        {/* VIEW 1: MESO (MATRIX) */}
        <div 
          className="absolute inset-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] w-full h-full flex flex-col items-center justify-center"
          style={getSlideStyle(ViewMode.MESO)}
        >
            {/* Animating Container for Scroll vs Center Layout */}
            <motion.div 
                layout
                className={`w-full h-full overflow-hidden
                     ${isYearOverview 
                        ? 'overflow-y-auto no-scrollbar pt-48 pb-32' // Adjusted for fit
                        : 'overflow-y-auto no-scrollbar pt-56 pb-48'
                     }
                `}
                transition={{ type: "spring", stiffness: 120, damping: 20, mass: 0.8 }}
            >
                <div className={`w-full min-h-full flex items-center justify-center`}>
                    <YearGrid 
                        data={data} 
                        logs={logs}
                        hoveredDay={hoveredDay}
                        selectedDay={selectedDay}
                        isOverview={isYearOverview}
                        onHoverDay={setHoveredDay}
                        onSelectDay={handleSelectDay}
                        onToggleOverview={() => setIsYearOverview(!isYearOverview)}
                    />
                </div>
            </motion.div>
        </div>

        {/* VIEW 2: MACRO */}
        <div 
           className="absolute inset-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] w-full h-full"
           style={getSlideStyle(ViewMode.MACRO)}
        >
            <div className="w-full h-full overflow-y-auto overflow-x-hidden no-scrollbar pt-32 pb-48 scroll-smooth">
                <LifeGrid gender={gender} birthDate={birthDate} />
            </div>
        </div>

      </div>

      {/* -- FOOTER -- */}
      <div className="absolute bottom-0 left-0 right-0 z-50 pointer-events-none">
          <div className="absolute inset-0 h-56 -top-28 bg-gradient-to-t from-void via-void/95 to-transparent pointer-events-none translate-y-28"></div>
          
          <footer className="relative h-56 w-full flex flex-col items-center justify-between pb-10 pt-4 text-center">
            {/* Dynamic HUD */}
            <div className="flex-1 flex flex-col justify-center pointer-events-auto min-h-[100px] w-full px-8">
                {currentView === ViewMode.MESO && (
                    <div className="animate-reveal">
                        {activeDay ? (
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-5xl font-display font-bold text-white tracking-tighter drop-shadow-2xl">
                                    {formatDate(activeDay.date)}
                                </span>
                                <span className={`text-[10px] font-mono tracking-[0.3em] uppercase mt-2 ${activeDay.isToday ? 'text-acid' : 'text-white/40'}`}>
                                    {activeDay.isPast ? 'Tap to Log' : activeDay.isToday ? 'Current Cycle' : 'Future Event'}
                                </span>
                            </div>
                        ) : (
                            <PercentageDisplay value={percentage} />
                        )}
                    </div>
                )}
                
                {currentView === ViewMode.MICRO && (
                     <div className="animate-reveal">
                         <DayCompletionDisplay />
                    </div>
                )}

                {currentView === ViewMode.MACRO && (
                    <div className="animate-reveal flex flex-col items-center">
                        <div className="flex items-baseline gap-1">
                             <MacroStatDisplay value={parseFloat(macroStats.age)} suffix="y" />
                        </div>
                        <div className="text-white/30 text-[9px] uppercase tracking-[0.3em] mt-3">
                            Global Avg. Expectancy ({macroStats.maxYears}y)
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div className="mt-4 pointer-events-auto mb-2 z-50">
                <ViewToggle currentView={currentView} onViewChange={setCurrentView} />
            </div>
          </footer>
      </div>
    </div>
  );
};

const DayCompletionDisplay: React.FC = () => {
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
    <div className="flex flex-col items-center">
      <div className="flex items-start justify-center relative">
        <h1 className="text-6xl font-display font-bold text-white tracking-tighter tabular-nums">
            {percent}
        </h1>
        <span className="text-2xl font-display text-acid font-bold mt-2 -ml-2">%</span>
      </div>
      <span className="text-[9px] text-white/30 tracking-[0.3em] uppercase mt-1">Day Completion</span>
    </div>
  );
};

const PercentageDisplay: React.FC<{ value: number }> = ({ value }) => {
  const animatedValue = useScrambleNumber(value);
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-start justify-center relative">
        <h1 className="text-6xl font-display font-bold text-white tracking-tighter tabular-nums">
            {animatedValue}
        </h1>
        <span className="text-2xl font-display text-acid font-bold mt-2 -ml-2">%</span>
      </div>
      <span className="text-[9px] text-white/30 tracking-[0.3em] uppercase mt-1">Year Completion</span>
    </div>
  );
};

const MacroStatDisplay: React.FC<{ value: number, suffix: string }> = ({ value, suffix }) => {
    const animatedValue = useScrambleNumber(value, 1500, 2);
    return (
        <div className="flex items-baseline">
            <span className="text-6xl font-display font-bold text-white tracking-tighter tabular-nums">
                {animatedValue}
            </span>
            <span className="text-2xl font-display text-acid font-bold ml-1">{suffix}</span>
        </div>
    )
}

const PreciseTimerDisplay: React.FC<{ totalDays: number }> = ({ totalDays }) => {
    const precise = usePreciseProgress(totalDays);
    return (
        <div className="text-xl font-display font-bold text-white/20 tabular-nums tracking-tighter">
            {precise}%
        </div>
    )
}

export default App;
