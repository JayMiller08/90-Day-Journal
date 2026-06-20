import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type Goal = string;

export interface DailyLog {
  id: string; // e.g. '1', '2'
  morning: {
    wakeUpTime: string;
    mood: string;
    energy: number;
    top3Priorities: [string, string, string];
  };
  meditation: {
    minutes: number;
    focus: string;
    insight: string;
  };
  faith: {
    bibleVerse: string;
    prayerPoints: string;
  };
  business: {
    tasksCompleted: string;
    progressMade: string;
  };
  health: {
    exercise: string;
    duration: number;
    waterIntake: number;
    nutrition: string;
  };
  financial: {
    earned: number;
    spent: number;
    saved: number;
    notes: string;
  };
  habits: {
    read: boolean;
    exercise: boolean;
    pray: boolean;
    meditate: boolean;
    saveMoney: boolean;
    learn: boolean;
  };
  gratitude: [string, string, string];
  evening: {
    biggestWin: string;
    lessonLearned: string;
    improveTomorrow: string;
  };
}

export interface MilestoneReview {
  milestone: '30' | '60' | '90';
  wins: string;
  challenges: string;
  financial: string;
  spiritual: string;
  health: string;
  habitsToContinue: string;
  goalsNextPhase: string;
}

interface JournalState {
  vision: {
    goals: Goal[];
    purpose: string;
    isLocked: boolean;
  };
  dailyLogs: Record<string, DailyLog>;
  reviews: Record<string, MilestoneReview>;
}

interface JournalContextProps {
  state: JournalState;
  saveVision: (goals: Goal[], purpose: string) => void;
  saveDailyLog: (id: string, log: DailyLog) => void;
  saveReview: (milestone: '30' | '60' | '90', review: MilestoneReview) => void;
}

const defaultState: JournalState = {
  vision: {
    goals: Array(10).fill(''),
    purpose: '',
    isLocked: false,
  },
  dailyLogs: {},
  reviews: {},
};

const JournalContext = createContext<JournalContextProps | undefined>(undefined);

const LOCAL_STORAGE_KEY = '90DaySuccessJournal_v1';

export const JournalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<JournalState>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : defaultState;
    } catch (error) {
      console.error('Failed to parse localStorage data', error);
      return defaultState;
    }
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const saveVision = (goals: Goal[], purpose: string) => {
    setState(prev => ({
      ...prev,
      vision: { goals, purpose, isLocked: true }
    }));
  };

  const saveDailyLog = (id: string, log: DailyLog) => {
    setState(prev => ({
      ...prev,
      dailyLogs: {
        ...prev.dailyLogs,
        [id]: log
      }
    }));
  };

  const saveReview = (milestone: '30' | '60' | '90', review: MilestoneReview) => {
    setState(prev => ({
      ...prev,
      reviews: {
        ...prev.reviews,
        [milestone]: review
      }
    }));
  };

  return (
    <JournalContext.Provider value={{ state, saveVision, saveDailyLog, saveReview }}>
      {children}
    </JournalContext.Provider>
  );
};

export const useJournal = () => {
  const context = useContext(JournalContext);
  if (!context) {
    throw new Error('useJournal must be used within a JournalProvider');
  }
  return context;
};
