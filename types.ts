export interface Habit {
  id: string;
  title: string;
  description: string; // Flavor text
  icon: string;
  xpValue: number;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  completedHabitIds: string[];
  mood?: string;
}

export interface UserStats {
  level: number;
  currentXp: number;
  totalXp: number;
  streak: number;
  lastLoginDate: string;
}

export interface MentorResponse {
  message: string;
  tone: 'encouraging' | 'celebratory' | 'stern' | 'mystical';
}