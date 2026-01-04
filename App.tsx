
import React, { useEffect, useState, useMemo, useRef } from 'react';
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
  const [birthDate, setBirthDate] = useState<Date>(new Date(2000, 0, 1)); // Local time to avoid timezone offset issues
  
  // -- UI State --
  const [hoveredDay, setHoveredDay] = useState<DayData | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState<ViewMode>(ViewMode.MESO);
  const [isYearOverview, setIsYearOverview] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // -- Date Picker UI State --
  const [isSelectingYear, setIsSelectingYear] = useState(false);

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
    // If a day is selected, we might be opening the modal, so don't deselect yet
    // Actually, let's keep it simple: clicking void deselects.
    // The Modal overlays this anyway.
    if (selectedDay) {
        triggerHaptic('light');
        setSelectedDay(null);
    }
  };

  const handleSelectDay = (day: DayData) => {
    if (!day.isFuture) {
        // Only allow selecting Past/Today
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

  const handleUpdateDate = (field: 'day' | 'month' | 'year', value: number) => {
      const newDate = new Date(birthDate);
      if (field === 'day') newDate.setDate(value);
      if (field === 'month') newDate.setMonth(value);
      if (field === 'year') newDate.setFullYear(value);
      
      // Validation to ensure date exists (e.g. Feb 31)
      if (isNaN(newDate.getTime())) return;
      setBirthDate(newDate);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.value) return;
      const [y, m, d] = e.target.value.split('-').map(Number);
      // Construct date in local time
      const newDate = new Date(y, m - 1, d);
      if (!isNaN(newDate.getTime())) {
          setBirthDate(newDate);
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
  const daysLeft = data.totalDays - data.daysPassed;
  const percentage = Math.floor(data.percentage);

  // Helper to determine slide position based on view index
  const viewOrder = [ViewMode.MICRO, ViewMode.MESO, ViewMode.MACRO];
  const activeIndex = viewOrder.indexOf(currentView);

  const getSlideStyle = (mode: ViewMode) => {
    const index = viewOrder.indexOf(mode);
    const offset = (index - activeIndex) * 100; 
    return {
      transform: `translateX(${offset}%)`,
      visibility: Math.abs(index - activeIndex) > 1 ? 'hidden' as const : 'visible' as const, 
    };
  };

  const generateYearList = () => {
      const currentYear = new Date().getFullYear();
      const years = [];
      for (let y = currentYear; y >= 1900; y--) {
          years.push(y);
      }
      return years;
  };

  // Format birthdate for input value manually to avoid UTC conversion shifts
  const birthDateInputValue = `${birthDate.getFullYear()}-${String(birthDate.getMonth() + 1).padStart(2, '0')}-${String(birthDate.getDate()).padStart(2, '0')}`;

  return (
    <div 
      className="h-[100dvh] w-full bg-void flex flex-col overflow-hidden relative font-sans"
      onClick={handleVoidClick}
    >
      <div className="noise-overlay" />

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
      
      {/* -- MENU LAYER -- */}
      {/* Backdrop */}
      <div 
        className={`
            fixed inset-0 z-[60] bg-void/10 backdrop-blur-sm transition-opacity duration-500
            ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none delay-200'}
        `}
        onClick={() => {
            triggerHaptic('light');
            setIsMenuOpen(false);
            setIsSelectingYear(false);
        }} 
      />

      {/* Card Slide Panel */}
      <div 
        className={`
            fixed inset-0 z-[65] flex flex-col items-center justify-center p-8 text-center 
            bg-void/80 backdrop-blur-2xl transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
            ${isMenuOpen ? 'translate-y-0' : '-translate-y-full'}
        `}
      >
            <span className="text-acid font-mono text-[10px] tracking-[0.6em] mb-12 uppercase border-b border-acid/20 pb-2 drop-shadow-lg">Configuration</span>
            
            {/* -- IDENTITY MODULE -- */}
            <div className="w-full max-w-sm mb-12 flex flex-col gap-8 relative z-10">
               
               {/* -- DATE SELECTOR -- */}
               <div className="w-full">
                  <div className="text-white/50 text-[9px] uppercase tracking-[0.3em] mb-4 text-left pl-1">Date of Origin</div>
                  
                  {isSelectingYear ? (
                      // Year Selection Matrix
                      <div className="absolute inset-0 z-20 bg-void/90 border border-white/10 rounded-xl flex flex-col p-4 h-[300px] shadow-2xl backdrop-blur-xl">
                          <div className="text-white/40 text-[10px] uppercase tracking-widest mb-2 flex justify-between">
                              <span>Select Year</span>
                              <button onClick={() => setIsSelectingYear(false)} className="text-acid hover:text-white">Close</button>
                          </div>
                          <div className="grid grid-cols-4 gap-2 overflow-y-auto no-scrollbar flex-1 pb-4">
                              {generateYearList().map(year => (
                                  <button
                                    key={year}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        triggerHaptic('tick');
                                        handleUpdateDate('year', year);
                                        setIsSelectingYear(false);
                                    }}
                                    className={`
                                        py-2 text-sm font-mono rounded hover:bg-white/10 transition-colors
                                        ${birthDate.getFullYear() === year ? 'text-acid font-bold bg-white/5' : 'text-white/50'}
                                    `}
                                  >
                                      {year}
                                  </button>
                              ))}
                          </div>
                      </div>
                  ) : (
                      // Standard Display
                      <div className="flex items-baseline justify-between gap-2 border-b border-white/30 pb-2">
                         <div className="relative group cursor-pointer">
                             <input 
                                type="date"
                                value={birthDateInputValue}
                                onChange={handleDateChange}
                                className="absolute inset-0 opacity-0 z-10 w-full h-full"
                             />
                             <span className="text-4xl font-display font-bold text-white tracking-tight group-hover:text-acid transition-colors drop-shadow-lg">
                                {birthDate.getDate().toString().padStart(2, '0')}
                             </span>
                         </div>
                         
                         <div className="relative group cursor-pointer">
                             <input 
                                type="date"
                                value={birthDateInputValue}
                                onChange={handleDateChange}
                                className="absolute inset-0 opacity-0 z-10 w-full h-full"
                             />
                             <span className="text-4xl font-display font-bold text-white/70 tracking-tight group-hover:text-acid/70 transition-colors uppercase drop-shadow-lg">
                                {birthDate.toLocaleString('default', { month: 'short' })}
                             </span>
                         </div>

                         {/* YEAR - Triggers Matrix */}
                         <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                triggerHaptic('tick');
                                setIsSelectingYear(true);
                            }}
                            className="text-4xl font-display font-bold text-white/40 tracking-tight hover:text-acid/40 transition-colors drop-shadow-lg"
                         >
                            {birthDate.getFullYear()}
                         </button>
                      </div>
                  )}
               </div>

               {/* Gender Selector */}
               <div className="w-full">
                  <div className="text-white/50 text-[9px] uppercase tracking-[0.3em] mb-3 text-left pl-1">Biotype</div>
                  <div className="flex gap-4">
                    {['MALE', 'FEMALE'].map((g) => (
                      <button
                        key={g}
                        onClick={() => setGender(g as Gender)}
                        className={`
                            flex-1 py-4 px-4 text-sm font-display tracking-widest uppercase transition-all duration-300 border backdrop-blur-md shadow-lg
                            ${gender === g 
                                ? 'bg-acid/90 text-void border-acid font-bold' 
                                : 'bg-black/20 text-white/60 border-white/20 hover:border-white/40 hover:text-white'}
                        `}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
               </div>
            </div>
            
            {/* -- STATS MODULE -- */}
            <div className="w-full max-w-sm border-t border-white/20 pt-12 z-10">
                 <div className="text-white/50 text-[9px] uppercase tracking-[0.3em] mb-6">System Clock</div>
                 <PreciseTimerDisplay totalDays={data.totalDays} />
            </div>
            
            <div className="mt-12 z-10">
                 <button 
                    className="group relative px-8 py-3 overflow-hidden rounded-full bg-black/40 border border-white/10 hover:bg-white/10 transition-all duration-300 backdrop-blur-md shadow-xl"
                    onClick={() => {
                        triggerHaptic('light');
                        setIsMenuOpen(false);
                    }}
                >
                    <span className="relative z-10 text-[10px] font-mono uppercase tracking-[0.3em] text-white group-hover:text-acid transition-colors">Return</span>
                </button>
            </div>
      </div>

      {/* -- HEADER -- */}
      <div className="absolute top-0 left-0 right-0 z-[70] pointer-events-none">
          <div className="absolute inset-0 h-32 bg-gradient-to-b from-void via-void/90 to-transparent pointer-events-none"></div>
          <StatsHeader 
            data={data} 
            isOpen={isMenuOpen}
            onMenuClick={() => setIsMenuOpen(!isMenuOpen)} 
          />
      </div>

      {/* -- MAIN SLIDING STAGE -- */}
      <div className="relative flex-1 w-full h-full overflow-hidden z-10">
        
        {/* VIEW 0: MICRO */}
        <div 
          className="absolute inset-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] w-full h-full"
          style={getSlideStyle(ViewMode.MICRO)}
        >
             <div className="w-full h-full overflow-hidden flex items-center justify-center pt-32 pb-48">
                <DayPulse />
             </div>
        </div>

        {/* VIEW 1: MESO */}
        <div 
          className="absolute inset-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] w-full h-full"
          style={getSlideStyle(ViewMode.MESO)}
        >
            <div className="w-full h-full overflow-y-auto overflow-x-hidden no-scrollbar pt-32 pb-48 scroll-smooth">
                <div className="w-full min-h-full flex items-center justify-center">
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
            </div>
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
                     <div className="animate-reveal flex flex-col items-center gap-2">
                         <div className="text-4xl font-display font-bold text-white tracking-tighter">24H</div>
                         <div className="text-white/40 text-[9px] uppercase tracking-[0.3em]">
                             Daily Cycle
                        </div>
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
        <div className="text-4xl font-display font-bold text-white tabular-nums tracking-tighter drop-shadow-xl">
            {precise}%
        </div>
    )
}

export default App;
