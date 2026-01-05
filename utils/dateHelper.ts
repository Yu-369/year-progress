
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

export const getSunTimes = (date: Date, lat: number, lng: number): { sunrise: string, sunset: string } => {
    // Simple implementation of Sunrise Equation
    const PI = Math.PI;
    const deg2rad = (deg: number) => deg * PI / 180;
    const rad2deg = (rad: number) => rad * 180 / PI;

    // Day of the year
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    // Convert longitude to hour value and calculate an approximate time
    const lngHour = lng / 15;
    
    const calculateTime = (isSunrise: boolean) => {
        const t = dayOfYear + ((isSunrise ? 6 : 18) - lngHour) / 24;
        
        // Sun's mean anomaly
        const M = (0.9856 * t) - 3.289;

        // Sun's true longitude
        let L = M + (1.916 * Math.sin(deg2rad(M))) + (0.020 * Math.sin(deg2rad(2 * M))) + 282.634;
        if (L > 360) L -= 360;
        else if (L < 0) L += 360;

        // Right ascension
        let RA = rad2deg(Math.atan(0.91764 * Math.tan(deg2rad(L))));
        if (RA > 360) RA -= 360;
        else if (RA < 0) RA += 360;

        // Right ascension value needs to be in the same quadrant as L
        const Lquadrant  = (Math.floor( L/90)) * 90;
        const RAquadrant = (Math.floor(RA/90)) * 90;
        RA = RA + (Lquadrant - RAquadrant);

        // Right ascension value needs to be converted into hours
        RA = RA / 15;

        // Sun's declination
        const sinDec = 0.39782 * Math.sin(deg2rad(L));
        const cosDec = Math.cos(Math.asin(sinDec));

        // Sun's local hour angle
        const cosH = (Math.cos(deg2rad(90.833)) - (sinDec * Math.sin(deg2rad(lat)))) / (cosDec * Math.cos(deg2rad(lat)));
        
        if (cosH >  1) return null; // Sun never rises
        if (cosH < -1) return null; // Sun never sets

        // Finish calculating H and convert into hours
        const H = isSunrise 
            ? 360 - rad2deg(Math.acos(cosH)) 
            : rad2deg(Math.acos(cosH));
        
        const H_hours = H / 15;

        // Calculate local mean time of rising/setting
        const T = H_hours + RA - (0.06571 * t) - 6.622;

        // Adjust back to UTC
        let UT = T - lngHour;
        if (UT > 24) UT -= 24;
        else if (UT < 0) UT += 24;

        // Convert to local time
        const localOffset = -date.getTimezoneOffset() / 60;
        let localT = UT + localOffset;
        if (localT > 24) localT -= 24;
        else if (localT < 0) localT += 24;

        return localT;
    }

    const formatTime = (decimalTime: number | null) => {
        if (decimalTime === null) return "--:--";
        const hrs = Math.floor(decimalTime);
        const mins = Math.floor((decimalTime - hrs) * 60);
        const period = hrs >= 12 ? 'PM' : 'AM';
        const displayHrs = hrs % 12 || 12;
        return `${displayHrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${period}`;
    }

    return {
        sunrise: formatTime(calculateTime(true)),
        sunset: formatTime(calculateTime(false))
    };
};
