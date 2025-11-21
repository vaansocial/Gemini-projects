import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Circle, 
  ChevronLeft, 
  ChevronRight, 
  Trophy, 
  Zap, 
  Activity, 
  Brain, 
  Smile, 
  Pill, 
  Moon, 
  Utensils,
  Sparkles
} from 'lucide-react';
import ProgressBar from './components/ProgressBar';
import MentorModal from './components/MentorModal';
import { Habit, DailyLog, UserStats } from './types';
import { getLogs, saveLog, getStats, saveStats, formatDate } from './services/storage';
import { getMentorWisdom } from './services/geminiService';

// --- Constants ---
const XP_PER_HABIT = 15;
const LEVEL_BASE_XP = 100;

const INITIAL_HABITS: Habit[] = [
  { id: '1', title: 'Stretching', description: 'Elongate the limbs for agility.', icon: 'Activity', xpValue: 10 },
  { id: '2', title: 'Practice Mindfulness', description: 'Meditate to restore mana.', icon: 'Brain', xpValue: 15 },
  { id: '3', title: 'Move Body', description: 'Physical exertion builds strength.', icon: 'Zap', xpValue: 20 },
  { id: '4', title: 'Take Vitamins', description: 'Ingest micro-nutrients.', icon: 'Pill', xpValue: 5 },
  { id: '5', title: 'Brush Teeth', description: 'Polish the ivory defenses.', icon: 'Smile', xpValue: 5 },
  { id: '6', title: 'Take Medications', description: 'Essential alchemy for health.', icon: 'Utensils', xpValue: 10 },
];

const IconMap: Record<string, React.ReactNode> = {
  'Activity': <Activity size={24} />,
  'Brain': <Brain size={24} />,
  'Zap': <Zap size={24} />,
  'Pill': <Pill size={24} />,
  'Smile': <Smile size={24} />,
  'Utensils': <Pill className="text-red-400" size={24} />, // Reuse Pill for meds but style diff
  'Moon': <Moon size={24} />,
};

const App: React.FC = () => {
  // State
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [logs, setLogs] = useState<Record<string, DailyLog>>({});
  const [stats, setStats] = useState<UserStats>({
    level: 1,
    currentXp: 0,
    totalXp: 0,
    streak: 0,
    lastLoginDate: formatDate(new Date())
  });
  const [habits] = useState<Habit[]>(INITIAL_HABITS);
  
  // Modal State
  const [isMentorOpen, setIsMentorOpen] = useState(false);
  const [mentorMessage, setMentorMessage] = useState("");
  const [isMentorLoading, setIsMentorLoading] = useState(false);

  // Derived State
  const dateKey = formatDate(currentDate);
  const currentLog = logs[dateKey] || { date: dateKey, completedHabitIds: [] };
  const isToday = dateKey === formatDate(new Date());
  const xpForNextLevel = stats.level * LEVEL_BASE_XP;
  
  // Effects
  useEffect(() => {
    setLogs(getLogs());
    setStats(getStats());
  }, []);

  // --- Handlers ---

  const handleToggleHabit = (habitId: string) => {
    const isCompleted = currentLog.completedHabitIds.includes(habitId);
    let newCompletedIds = [];
    let xpChange = 0;

    if (isCompleted) {
      newCompletedIds = currentLog.completedHabitIds.filter(id => id !== habitId);
      xpChange = -XP_PER_HABIT; // Simplified XP removal
    } else {
      newCompletedIds = [...currentLog.completedHabitIds, habitId];
      xpChange = XP_PER_HABIT;
    }

    // Update Log
    const newLog = { ...currentLog, completedHabitIds: newCompletedIds };
    const newLogs = { ...logs, [dateKey]: newLog };
    
    setLogs(newLogs);
    saveLog(dateKey, newLog);

    // Update Stats if editing today
    // (In a real app we might lock past XP, but let's keep it flexible for now)
    if (isToday || true) {
      updateStats(xpChange);
    }
  };

  const updateStats = (xpDelta: number) => {
    setStats(prev => {
      let newXp = prev.currentXp + xpDelta;
      let newLevel = prev.level;
      let newTotal = prev.totalXp + xpDelta;

      // Level Up Logic
      if (newXp >= newLevel * LEVEL_BASE_XP) {
        newXp = newXp - (newLevel * LEVEL_BASE_XP);
        newLevel++;
        // Could trigger level up animation here
      } else if (newXp < 0 && newLevel > 1) {
        // Level Down Logic (optional, simplified)
        newLevel--;
        newXp = (newLevel * LEVEL_BASE_XP) + newXp;
      } else if (newXp < 0) {
        newXp = 0;
      }

      const newStats = {
        ...prev,
        level: newLevel,
        currentXp: newXp,
        totalXp: newTotal,
      };
      
      saveStats(newStats);
      return newStats;
    });
  };

  const handlePrevDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const handleConsultMentor = async () => {
    setIsMentorOpen(true);
    setIsMentorLoading(true);
    
    const completedCount = currentLog.completedHabitIds.length;
    const uncompletedHabits = habits.filter(h => !currentLog.completedHabitIds.includes(h.id));

    const message = await getMentorWisdom(
      completedCount,
      habits.length,
      stats,
      habits,
      uncompletedHabits
    );

    setMentorMessage(message);
    setIsMentorLoading(false);
  };

  // --- Render Helpers ---

  const getCompletionPercentage = () => {
    return (currentLog.completedHabitIds.length / habits.length) * 100;
  };

  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col pb-20 md:pb-0">
      
      {/* HEADER / HERO SECTION */}
      <header className="bg-surface border-b border-slate-700 p-4 sticky top-0 z-30 shadow-md">
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* User Identity */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-900 flex items-center justify-center shadow-lg border border-slate-500">
              <Trophy className="text-white" size={20} />
            </div>
            <div>
              <h1 className="font-bold text-xl leading-none">Level {stats.level} Scout</h1>
              <div className="text-xs text-slate-400 mt-1">Total XP: {stats.totalXp}</div>
            </div>
          </div>

          {/* Level Progress */}
          <div className="flex-1 w-full md:max-w-xs">
            <ProgressBar 
              current={stats.currentXp} 
              max={xpForNextLevel} 
              color="bg-gradient-to-r from-primary to-indigo-500" 
              label={`XP to Level ${stats.level + 1}`}
            />
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-3xl mx-auto w-full p-4">
        
        {/* Date Navigation */}
        <div className="flex items-center justify-between mb-6 bg-surface/50 p-3 rounded-xl backdrop-blur-sm border border-slate-700/50">
          <button onClick={handlePrevDay} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div className="flex flex-col items-center">
            <h2 className="font-bold text-lg">
              {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h2>
            {!isToday && (
               <span className="text-xs text-slate-400 uppercase tracking-wider">Viewing History</span>
            )}
          </div>
          <button 
            onClick={handleNextDay} 
            disabled={isToday}
            className={`p-2 rounded-lg transition-colors ${isToday ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-700'}`}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Daily Progress */}
        <div className="mb-8">
           <div className="flex justify-between text-sm mb-2 text-slate-400">
             <span>Quest Progress</span>
             <span>{Math.round(getCompletionPercentage())}%</span>
           </div>
           <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-700 ease-out"
                style={{ width: `${getCompletionPercentage()}%` }}
              ></div>
           </div>
        </div>

        {/* Habit Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {habits.map((habit) => {
            const isCompleted = currentLog.completedHabitIds.includes(habit.id);
            
            return (
              <button
                key={habit.id}
                onClick={() => handleToggleHabit(habit.id)}
                className={`
                  relative overflow-hidden group p-4 rounded-2xl border text-left transition-all duration-300
                  ${isCompleted 
                    ? 'bg-emerald-900/20 border-emerald-500/50 shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)]' 
                    : 'bg-surface border-slate-700 hover:border-primary/50 hover:shadow-lg'}
                `}
              >
                {/* Background pattern for completed */}
                {isCompleted && (
                   <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
                )}

                <div className="flex items-start justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div className={`
                      p-3 rounded-lg transition-colors duration-300
                      ${isCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400 group-hover:text-primary group-hover:bg-slate-600'}
                    `}>
                      {IconMap[habit.icon] || <Activity />}
                    </div>
                    <div>
                      <h3 className={`font-bold text-base ${isCompleted ? 'text-emerald-400' : 'text-slate-200'}`}>
                        {habit.title}
                      </h3>
                      <p className="text-xs text-slate-500 italic">{habit.description}</p>
                    </div>
                  </div>
                  
                  <div className={`
                    transition-all duration-300 transform
                    ${isCompleted ? 'scale-110 text-emerald-400' : 'text-slate-600 group-hover:text-slate-400'}
                  `}>
                    {isCompleted ? <CheckCircle2 size={28} className="drop-shadow-md" /> : <Circle size={28} />}
                  </div>
                </div>
                
                {/* XP Badge */}
                <div className={`
                   absolute bottom-2 right-3 text-[10px] font-bold uppercase tracking-wider transition-opacity duration-300
                   ${isCompleted ? 'text-emerald-500/60' : 'text-slate-600 opacity-0 group-hover:opacity-100'}
                `}>
                  +{habit.xpValue} XP
                </div>
              </button>
            );
          })}
        </div>

        {/* Empty State or All Done */}
        {habits.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            No quests assigned by the guild master yet.
          </div>
        )}
        
        {currentLog.completedHabitIds.length === habits.length && habits.length > 0 && (
          <div className="mt-8 p-6 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-2xl border border-indigo-500/30 text-center animate-pulse-slow">
             <Sparkles className="mx-auto text-yellow-300 mb-2 animate-spin-slow" size={32} />
             <h3 className="text-xl font-bold text-white mb-1">Daily Quest Complete!</h3>
             <p className="text-indigo-200 text-sm">Rest easy, hero. Your streak is safe.</p>
          </div>
        )}

      </main>

      {/* FLOATING ACTION BUTTON / FOOTER */}
      <div className="fixed bottom-6 right-6 z-40 md:right-1/2 md:translate-x-1/2 md:bottom-8">
        <button
          onClick={handleConsultMentor}
          className="group flex items-center gap-2 bg-primary hover:bg-violet-500 text-white px-6 py-3 rounded-full shadow-lg shadow-violet-900/50 transition-all transform hover:-translate-y-1 active:scale-95"
        >
          <Sparkles size={18} className="animate-pulse" />
          <span className="font-bold">Consult Oracle</span>
        </button>
      </div>

      <MentorModal 
        isOpen={isMentorOpen}
        onClose={() => setIsMentorOpen(false)}
        message={mentorMessage}
        isLoading={isMentorLoading}
      />

    </div>
  );
};

export default App;