/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export type Goal = string;

export interface DailyLog {
  id: string; // e.g. '1', '2'
  is_public?: boolean;
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
  isLoading: boolean;
  saveVision: (goals: Goal[], purpose: string) => Promise<void>;
  saveDailyLog: (id: string, log: DailyLog) => Promise<void>;
  saveReview: (milestone: '30' | '60' | '90', review: MilestoneReview) => Promise<void>;
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

export const JournalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<JournalState>(defaultState);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setState(defaultState);
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [goalsRes, logsRes, reviewsRes] = await Promise.all([
          supabase.from('goals').select('*').eq('user_id', user.id).maybeSingle(),
          supabase.from('daily_logs').select('*').eq('user_id', user.id),
          supabase.from('milestone_reviews').select('*').eq('user_id', user.id)
        ]);

        const newState = { ...defaultState };
        
        if (goalsRes.data) {
          newState.vision = {
            goals: goalsRes.data.goals || Array(10).fill(''),
            purpose: goalsRes.data.purpose || '',
            isLocked: goalsRes.data.is_locked || false,
          };
        }

        if (logsRes.data) {
          newState.dailyLogs = {};
          logsRes.data.forEach((log) => {
            newState.dailyLogs[log.date_id] = {
              id: log.date_id,
              is_public: log.is_public,
              morning: log.morning,
              meditation: log.meditation,
              faith: log.faith,
              business: log.business,
              health: log.health,
              financial: log.financial,
              habits: log.habits,
              gratitude: log.gratitude,
              evening: log.evening,
            };
          });
        }

        if (reviewsRes.data) {
          newState.reviews = {};
          reviewsRes.data.forEach((rev) => {
            newState.reviews[rev.milestone] = {
              milestone: rev.milestone as '30' | '60' | '90',
              wins: rev.wins,
              challenges: rev.challenges,
              financial: rev.financial,
              spiritual: rev.spiritual,
              health: rev.health,
              habitsToContinue: rev.habits_to_continue,
              goalsNextPhase: rev.goals_next_phase,
            };
          });
        }

        setState(newState);
      } catch (error) {
        console.error("Error fetching journal data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const saveVision = async (goals: Goal[], purpose: string) => {
    if (!user) return;
    
    // Optimistic update
    setState(prev => ({
      ...prev,
      vision: { goals, purpose, isLocked: true }
    }));

    // Update remote
    const { data: existing } = await supabase.from('goals').select('id').eq('user_id', user.id).maybeSingle();
    
    if (existing) {
        await supabase.from('goals').update({ goals, purpose, is_locked: true }).eq('id', existing.id);
    } else {
        await supabase.from('goals').insert([{ user_id: user.id, goals, purpose, is_locked: true }]);
    }
  };

  const saveDailyLog = async (id: string, log: DailyLog) => {
    if (!user) return;

    // Optimistic update
    setState(prev => ({
      ...prev,
      dailyLogs: {
        ...prev.dailyLogs,
        [id]: log
      }
    }));

    // Transform log to match db schema
    const dbPayload = {
      user_id: user.id,
      date_id: id,
      is_public: log.is_public ?? false,
      morning: log.morning,
      meditation: log.meditation,
      faith: log.faith,
      business: log.business,
      health: log.health,
      financial: log.financial,
      habits: log.habits,
      gratitude: log.gratitude,
      evening: log.evening
    };

    const { data: existing } = await supabase.from('daily_logs').select('id').eq('user_id', user.id).eq('date_id', id).maybeSingle();
    
    if (existing) {
        await supabase.from('daily_logs').update(dbPayload).eq('id', existing.id);
    } else {
        await supabase.from('daily_logs').insert([dbPayload]);
    }
  };

  const saveReview = async (milestone: '30' | '60' | '90', review: MilestoneReview) => {
    if (!user) return;

    // Optimistic update
    setState(prev => ({
      ...prev,
      reviews: {
        ...prev.reviews,
        [milestone]: review
      }
    }));

    const dbPayload = {
      user_id: user.id,
      milestone,
      wins: review.wins,
      challenges: review.challenges,
      financial: review.financial,
      spiritual: review.spiritual,
      health: review.health,
      habits_to_continue: review.habitsToContinue,
      goals_next_phase: review.goalsNextPhase
    };

    const { data: existing } = await supabase.from('milestone_reviews').select('id').eq('user_id', user.id).eq('milestone', milestone).maybeSingle();

    if (existing) {
        await supabase.from('milestone_reviews').update(dbPayload).eq('id', existing.id);
    } else {
        await supabase.from('milestone_reviews').insert([dbPayload]);
    }
  };

  return (
    <JournalContext.Provider value={{ state, isLoading, saveVision, saveDailyLog, saveReview }}>
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
