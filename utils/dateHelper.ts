
import { DayData, YearData } from '../types';

export const isLeapYear = (year: number): boolean => {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
};

export const getDaysInYear = (year: number): number => {
  return isLeapYear(year) ? 366 : 365;
};

export const getDayOfYear = (date: Date): number => {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

export const generateYearData = (): YearData => {
  const now = new Date();
  const year = now.getFullYear();
  const totalDays = getDaysInYear(year);
  const currentDayOfYear = getDayOfYear(now);
  
  const days: DayData[] = [];
  const months: DayData[][] = Array.from({ length: 12 }, () => []);

  for (let i = 0; i < totalDays; i++) {
    // Construct date for day i
    // January 1st is day 1. We create a date starting Jan 1 and adding 'i' days.
    const date = new Date(year, 0, 1 + i);
    const dayOfYear = i + 1;
    
    // Determine status
    // We compare dayOfYear indices rather than raw timestamps to avoid timezone/hour drift issues for this specific visualization
    const isPast = dayOfYear < currentDayOfYear;
    const isToday = dayOfYear === currentDayOfYear;
    const isFuture = dayOfYear > currentDayOfYear;
    const monthIndex = date.getMonth();

    const dayData: DayData = {
      date,
      dayOfYear,
      isPast,
      isToday,
      isFuture,
      monthIndex
    };

    days.push(dayData);
    months[monthIndex].push(dayData);
  }

  // Percentage calculation
  const percentage = (currentDayOfYear / totalDays) * 100;

  return {
    year,
    totalDays,
    daysPassed: currentDayOfYear,
    percentage,
    days,
    months
  };
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);
};

export const formatTime = (date: Date): string => {
   return new Intl.DateTimeFormat('en-US', {
     hour: 'numeric',
     minute: 'numeric',
     hour12: true
   }).format(date);
}

// Moon Phase Calculator (0 = New Moon, 0.5 = Full Moon, 1 = New Moon)
export const getMoonPhase = (date: Date = new Date()): number => {
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();

    if (month < 3) {
        year--;
        month += 12;
    }

    ++month;

    let c = 365.25 * year;
    let e = 30.6 * month;
    let jd = c + e + day - 694039.09; // jd is total days elapsed
    jd /= 29.5305882; // divide by the moon cycle
    let b = parseInt(jd.toString()); // int(jd) -> b, take integer part of jd
    jd -= b; // subtract integer part to leave fractional part of original jd
    b = Math.round(jd * 8); // scale fraction from 0-8 and round

    if (b >= 8) b = 0; // 0 and 8 are the same so turn 8 into 0
    
    // Return standardized 0-1 float for animation
    return jd;
}
