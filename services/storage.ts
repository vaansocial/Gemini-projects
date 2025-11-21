import { DailyLog, UserStats } from "../types";

const KEYS = {
  LOGS: 'questlife_logs',
  STATS: 'questlife_stats',
};

export const getLogs = (): Record<string, DailyLog> => {
  const stored = localStorage.getItem(KEYS.LOGS);
  return stored ? JSON.parse(stored) : {};
};

export const saveLog = (date: string, log: DailyLog) => {
  const logs = getLogs();
  logs[date] = log;
  localStorage.setItem(KEYS.LOGS, JSON.stringify(logs));
};

export const getStats = (): UserStats => {
  const stored = localStorage.getItem(KEYS.STATS);
  return stored ? JSON.parse(stored) : {
    level: 1,
    currentXp: 0,
    totalXp: 0,
    streak: 0,
    lastLoginDate: new Date().toISOString().split('T')[0]
  };
};

export const saveStats = (stats: UserStats) => {
  localStorage.setItem(KEYS.STATS, JSON.stringify(stats));
};

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};