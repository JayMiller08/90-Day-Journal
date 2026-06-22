/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useJournal, type MilestoneReview } from '../context/JournalContext';
import { Award } from 'lucide-react';

const defaultReview: MilestoneReview = {
  milestone: '30',
  wins: '',
  challenges: '',
  financial: '',
  spiritual: '',
  health: '',
  habitsToContinue: '',
  goalsNextPhase: '',
};

export const Review: React.FC = () => {
  const { milestone } = useParams<{ milestone: '30' | '60' | '90' }>();
  const { state, saveReview } = useJournal();
  const [review, setReview] = useState<MilestoneReview>(defaultReview);

  useEffect(() => {
    if (milestone) {
      setReview(state.reviews[milestone] || { ...defaultReview, milestone });
    }
  }, [milestone, state.reviews]);

  const handleChange = (field: keyof MilestoneReview, value: string) => {
    setReview(prev => {
      const newReview = { ...prev, [field]: value };
      if (milestone) saveReview(milestone, newReview);
      return newReview;
    });
  };

  const sections = [
    { key: 'wins', label: 'Wins achieved', placeholder: 'What went exceptionally well?' },
    { key: 'challenges', label: 'Challenges faced', placeholder: 'What were the roadblocks and how did you handle them?' },
    { key: 'financial', label: 'Financial progress', placeholder: 'Did you meet your savings/earning targets?' },
    { key: 'spiritual', label: 'Spiritual & Personal growth', placeholder: 'How have you grown internally?' },
    { key: 'health', label: 'Health improvements', placeholder: 'Changes in your energy, fitness, or nutrition?' },
    { key: 'habitsToContinue', label: 'Habits to continue (or drop)', placeholder: 'What stays and what goes?' },
    { key: 'goalsNextPhase', label: 'Goals for the next phase', placeholder: 'What are the main objectives for the next 30 days?' }
  ] as const;

  return (
    <div className="p-8 pb-20 max-w-4xl mx-auto animate-fade-in space-y-8">
      <header className="mb-10 border-b border-stone-200 pb-8">
        <h1 className="text-4xl font-serif text-stone-900 flex items-center">
          <Award className="mr-3 text-amber-500" size={40} />
          {milestone}-Day Milestone Review
        </h1>
        <p className="text-stone-500 mt-2 text-lg">
          Take a step back. Reflect on your progress and calibrate your next phase.
        </p>
      </header>

      <div className="space-y-8">
        {sections.map(({ key, label, placeholder }) => (
          <section key={key} className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
            <label className="block text-xl font-serif font-medium text-stone-800 mb-3">
              {label}
            </label>
            <textarea 
              value={review[key as keyof MilestoneReview]} 
              onChange={e => handleChange(key as keyof MilestoneReview, e.target.value)}
              placeholder={placeholder}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-sage-green focus:bg-white transition-colors resize-y text-stone-700"
            />
          </section>
        ))}
      </div>
    </div>
  );
};
