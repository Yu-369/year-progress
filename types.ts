
export interface DayData {
  date: Date;
  dayOfYear: number;
  isPast: boolean;
  isToday: boolean;
  isFuture: boolean;
  monthIndex: number; // 0-11
}

export interface DayLog {
  note: string;
  impact: 'LOW' | 'NEUTRAL' | 'HIGH';
  timestamp: number;
}

<<<<<<< HEAD
export interface DeadlineEvent {
  date: string; // ISO date string (YYYY-MM-DD)
  title: string;
  createdAt: number;
}

=======
>>>>>>> origin/main
export interface YearData {
  year: number;
  totalDays: number;
  daysPassed: number;
  percentage: number;
  days: DayData[];
  months: DayData[][]; // Grouped by month for easier layout
}

export enum ViewMode {
  MICRO = 'MICRO', // Day
  MESO = 'MESO',   // Year
  MACRO = 'MACRO'  // Life
}

export type Gender = 'MALE' | 'FEMALE';

export interface UserSettings {
  gender: Gender;
  birthDate: Date;
}

export interface LifeWeek {
<<<<<<< HEAD
  weekIndex: number;
=======
  weekIndex: number; 
>>>>>>> origin/main
  yearIndex: number;
  isPast: boolean;
  isCurrent: boolean;
  isFuture: boolean;
}
