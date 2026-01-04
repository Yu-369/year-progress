
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
  weekIndex: number; 
  yearIndex: number;
  isPast: boolean;
  isCurrent: boolean;
  isFuture: boolean;
}
