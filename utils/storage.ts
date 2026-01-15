
<<<<<<< HEAD
import { DayLog, DeadlineEvent } from '../types';
=======
import { DayLog } from '../types';
>>>>>>> origin/main

const STORAGE_KEY = 'year_progress_logs';

export const getLogs = (): Record<string, DayLog> => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error("Failed to load logs", e);
    return {};
  }
};

export const saveLog = (dateId: string, log: DayLog) => {
  const current = getLogs();
  const updated = { ...current, [dateId]: log };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const deleteLog = (dateId: string) => {
<<<<<<< HEAD
  const current = getLogs();
  const { [dateId]: deleted, ...rest } = current;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
  return rest;
}

const DEADLINE_KEY = 'year_progress_deadline';

export const getDeadline = (): DeadlineEvent | null => {
  const raw = localStorage.getItem(DEADLINE_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const saveDeadline = (deadline: DeadlineEvent): void => {
  localStorage.setItem(DEADLINE_KEY, JSON.stringify(deadline));
};

export const deleteDeadline = (): void => {
  localStorage.removeItem(DEADLINE_KEY);
};

=======
    const current = getLogs();
    const { [dateId]: deleted, ...rest } = current;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
    return rest;
}

>>>>>>> origin/main
// Helper to generate a consistent ID for dates (YYYY-MM-DD)
export const getDateId = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
