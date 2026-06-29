/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useJournal, type DailyLog as DailyLogType } from '../context/JournalContext';
import { Sun, Brain, Heart, Briefcase, Activity, DollarSign, CheckSquare, Coffee, Moon, Globe, Lock } from 'lucide-react';

const defaultLog: DailyLogType = {
  id: '',
  morning: { wakeUpTime: '', mood: '😊', energy: 5, top3Priorities: ['', '', ''] },
  meditation: { minutes: 0, focus: '', insight: '' },
  faith: { bibleVerse: '', prayerPoints: '' },
  business: { tasksCompleted: '', progressMade: '' },
  health: { exercise: '', duration: 0, waterIntake: 0, nutrition: '' },
  financial: { earned: 0, spent: 0, saved: 0, notes: '' },
  habits: { read: false, exercise: false, pray: false, meditate: false, saveMoney: false, learn: false },
  gratitude: ['', '', ''],
  evening: { biggestWin: '', lessonLearned: '', improveTomorrow: '' }
};

export const DailyLog: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isReadonly = location.state?.isReadonly || false;
  const { state, saveDailyLog } = useJournal();
  const [log, setLog] = useState<DailyLogType>(defaultLog);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    // Only show if we're not readonly, they have less than 3 saved logs, and haven't seen it yet
    if (!isReadonly && Object.keys(state.dailyLogs).length < 3) {
      const hasSeen = localStorage.getItem('hasSeenPublicTutorial');
      if (!hasSeen) {
        setShowTutorial(true);
      }
    }
  }, [state.dailyLogs, isReadonly]);

  const dismissTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('hasSeenPublicTutorial', 'true');
  };

  useEffect(() => {
    if (id) {
      setLog(state.dailyLogs[id] || { ...defaultLog, id });
    }
  }, [id, state.dailyLogs]);

  const handleChange = (section: keyof DailyLogType, field: string, value: any) => {
    if (isReadonly) return;
    setLog(prev => {
      const newLog = {
        ...prev,
        [section]: {
          ...(prev[section] as any),
          [field]: value
        }
      };
      return newLog;
    });
  };

  const handleArrayChange = (section: keyof DailyLogType, index: number, value: string) => {
    if (isReadonly) return;
    setLog(prev => {
      const newArray = [...(prev[section] as string[])];
      newArray[index] = value;
      const newLog = { ...prev, [section]: newArray };
      return newLog;
    });
  };

  const handleMorningPriority = (index: number, value: string) => {
    if (isReadonly) return;
    setLog(prev => {
      const newPriorities = [...prev.morning.top3Priorities];
      newPriorities[index] = value;
      const newLog = {
        ...prev,
        morning: { ...prev.morning, top3Priorities: newPriorities }
      };
      return newLog as DailyLogType;
    });
  };

  return (
    <div className="p-8 pb-20 max-w-4xl mx-auto animate-fade-in space-y-8">
      <header className="mb-10 flex items-center justify-between">
        <div>
            <h1 className="text-4xl font-serif text-stone-900">Day {id} {isReadonly && <span className="text-2xl text-stone-400 ml-2">(Read-Only)</span>}</h1>
            <p className="text-stone-500 mt-2 text-lg">Your daily workspace for success.</p>
        </div>
        <div className="flex items-center gap-3 relative">
            {showTutorial && (
              <div className="absolute top-full right-0 mt-4 w-72 bg-stone-900 text-white p-4 rounded-xl shadow-xl z-50 animate-fade-in">
                <div className="absolute -top-2 right-6 w-4 h-4 bg-stone-900 transform rotate-45"></div>
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <Globe size={18} className="text-green-400" />
                  Share Your Journey
                </h3>
                <p className="text-sm text-stone-300 mb-4">
                  Make your entry <strong>Public</strong> if you want your friends to see your progress on their feed. Private entries are only visible to you.
                </p>
                <button 
                  onClick={dismissTutorial}
                  className="w-full py-2 bg-white text-stone-900 rounded-lg text-sm font-bold hover:bg-stone-100 transition-colors"
                >
                  Got it!
                </button>
              </div>
            )}
            <button
                disabled={isReadonly}
                onClick={() => {
                  handleChange('is_public' as any, '', !log.is_public);
                  if (showTutorial) dismissTutorial();
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors relative z-10 ${
                    log.is_public 
                        ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                        : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                } ${showTutorial ? 'ring-4 ring-stone-900/20' : ''} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                {log.is_public ? <Globe size={18} /> : <Lock size={18} />}
                {log.is_public ? 'Public' : 'Private'}
            </button>
        </div>
      </header>

      <fieldset disabled={isReadonly} className="space-y-8 border-none p-0 m-0">
      {/* 1. Morning Success Routine */}
      <section className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="bg-stone-50 border-b border-stone-100 px-6 py-4 flex items-center">
          <Sun className="text-amber-500 mr-3" size={24} />
          <h2 className="text-xl font-serif font-medium text-stone-800">Morning Success Routine</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">Wake-up time</label>
              <input type="time" value={log.morning.wakeUpTime} onChange={e => handleChange('morning', 'wakeUpTime', e.target.value)} className="w-full border-stone-200 rounded-lg p-2.5 focus:ring-sage-green focus:border-transparent" />
            </div>
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-stone-600 mb-1">Mood</label>
                <select value={log.morning.mood} onChange={e => handleChange('morning', 'mood', e.target.value)} className="w-full border-stone-200 rounded-lg p-2.5 focus:ring-sage-green focus:border-transparent">
                  <option value="🤩">🤩 Excellent</option>
                  <option value="😊">😊 Good</option>
                  <option value="😐">😐 Neutral</option>
                  <option value="😔">😔 Rough</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-stone-600 mb-1">Energy: {log.morning.energy}</label>
                <input type="range" min="1" max="10" value={log.morning.energy} onChange={e => handleChange('morning', 'energy', parseInt(e.target.value))} className="w-full mt-2 accent-sage-green" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-2">Today's Top 3 Priorities</label>
            <div className="space-y-2">
              {[0, 1, 2].map(i => (
                <div key={i} className="flex items-center space-x-2">
                  <span className="text-stone-400 font-medium">{i + 1}.</span>
                  <input type="text" value={log.morning.top3Priorities[i]} onChange={e => handleMorningPriority(i, e.target.value)} className="flex-1 border-stone-200 rounded-lg p-2 text-sm focus:ring-sage-green" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Meditation & Mindset */}
      <section className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="bg-stone-50 border-b border-stone-100 px-6 py-4 flex items-center">
          <Brain className="text-indigo-400 mr-3" size={24} />
          <h2 className="text-xl font-serif font-medium text-stone-800">Meditation & Mindset</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">Minutes meditated</label>
              <input type="number" min="0" value={log.meditation.minutes} onChange={e => handleChange('meditation', 'minutes', parseInt(e.target.value) || 0)} className="w-full border-stone-200 rounded-lg p-2.5 focus:ring-sage-green" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">Focus</label>
              <input type="text" value={log.meditation.focus} onChange={e => handleChange('meditation', 'focus', e.target.value)} className="w-full border-stone-200 rounded-lg p-2.5 focus:ring-sage-green" />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-stone-600 mb-1">Key insight</label>
            <textarea value={log.meditation.insight} onChange={e => handleChange('meditation', 'insight', e.target.value)} className="w-full h-full min-h-[100px] border-stone-200 rounded-lg p-3 focus:ring-sage-green resize-none" />
          </div>
        </div>
      </section>

      {/* 3. Faith & Prayer */}
      <section className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="bg-stone-50 border-b border-stone-100 px-6 py-4 flex items-center">
          <Heart className="text-rose-400 mr-3" size={24} />
          <h2 className="text-xl font-serif font-medium text-stone-800">Faith & Prayer</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Bible verse of the day</label>
            <input type="text" value={log.faith.bibleVerse} onChange={e => handleChange('faith', 'bibleVerse', e.target.value)} className="w-full border-stone-200 rounded-lg p-2.5 focus:ring-sage-green font-serif italic text-stone-700" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Prayer points</label>
            <textarea value={log.faith.prayerPoints} onChange={e => handleChange('faith', 'prayerPoints', e.target.value)} className="w-full border-stone-200 rounded-lg p-3 min-h-[100px] focus:ring-sage-green" />
          </div>
        </div>
      </section>

      {/* 4. Business / Career */}
      <section className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="bg-stone-50 border-b border-stone-100 px-6 py-4 flex items-center">
          <Briefcase className="text-slate-500 mr-3" size={24} />
          <h2 className="text-xl font-serif font-medium text-stone-800">Business / Career / School</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Tasks completed</label>
            <textarea value={log.business.tasksCompleted} onChange={e => handleChange('business', 'tasksCompleted', e.target.value)} placeholder="• Finished the report..." className="w-full border-stone-200 rounded-lg p-3 min-h-[120px] focus:ring-sage-green" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Progress made today</label>
            <textarea value={log.business.progressMade} onChange={e => handleChange('business', 'progressMade', e.target.value)} className="w-full border-stone-200 rounded-lg p-3 min-h-[120px] focus:ring-sage-green" />
          </div>
        </div>
      </section>

      {/* 5. Health & Fitness */}
      <section className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="bg-stone-50 border-b border-stone-100 px-6 py-4 flex items-center">
          <Activity className="text-emerald-500 mr-3" size={24} />
          <h2 className="text-xl font-serif font-medium text-stone-800">Health & Fitness</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">Exercise completed</label>
              <input type="text" value={log.health.exercise} onChange={e => handleChange('health', 'exercise', e.target.value)} className="w-full border-stone-200 rounded-lg p-2.5 focus:ring-sage-green" />
            </div>
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-stone-600 mb-1">Duration (min)</label>
                <input type="number" value={log.health.duration} onChange={e => handleChange('health', 'duration', parseInt(e.target.value) || 0)} className="w-full border-stone-200 rounded-lg p-2.5 focus:ring-sage-green" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-stone-600 mb-1">Water (glasses)</label>
                <div className="flex items-center space-x-2">
                  <button onClick={() => handleChange('health', 'waterIntake', Math.max(0, log.health.waterIntake - 1))} className="px-3 py-2 bg-stone-100 rounded-lg hover:bg-stone-200">-</button>
                  <span className="font-medium text-lg w-6 text-center">{log.health.waterIntake}</span>
                  <button onClick={() => handleChange('health', 'waterIntake', log.health.waterIntake + 1)} className="px-3 py-2 bg-stone-100 rounded-lg hover:bg-stone-200">+</button>
                </div>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Nutrition notes</label>
            <textarea value={log.health.nutrition} onChange={e => handleChange('health', 'nutrition', e.target.value)} className="w-full border-stone-200 rounded-lg p-3 min-h-[120px] focus:ring-sage-green" />
          </div>
        </div>
      </section>

      {/* 6. Financial Tracker & 7. Habits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
          <div className="bg-stone-50 border-b border-stone-100 px-6 py-4 flex items-center">
            <DollarSign className="text-green-600 mr-2" size={24} />
            <h2 className="text-xl font-serif font-medium text-stone-800">Financial</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Earned</label>
                <input type="number" value={log.financial.earned} onChange={e => handleChange('financial', 'earned', parseFloat(e.target.value) || 0)} className="w-full border-stone-200 rounded-lg p-2 focus:ring-sage-green" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Spent</label>
                <input type="number" value={log.financial.spent} onChange={e => handleChange('financial', 'spent', parseFloat(e.target.value) || 0)} className="w-full border-stone-200 rounded-lg p-2 focus:ring-sage-green" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Saved</label>
                <input type="number" value={log.financial.saved} onChange={e => handleChange('financial', 'saved', parseFloat(e.target.value) || 0)} className="w-full border-stone-200 rounded-lg p-2 focus:ring-sage-green" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">Investment notes</label>
              <textarea value={log.financial.notes} onChange={e => handleChange('financial', 'notes', e.target.value)} className="w-full border-stone-200 rounded-lg p-2.5 h-20 focus:ring-sage-green" />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
          <div className="bg-stone-50 border-b border-stone-100 px-6 py-4 flex items-center">
            <CheckSquare className="text-blue-500 mr-3" size={24} />
            <h2 className="text-xl font-serif font-medium text-stone-800">Habits Tracker</h2>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4">
            {Object.entries(log.habits).map(([habit, isChecked]) => (
              <label key={habit} className="flex items-center space-x-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={isChecked} 
                  onChange={e => handleChange('habits', habit, e.target.checked)}
                  className="w-5 h-5 text-sage-green-dark border-stone-300 rounded focus:ring-sage-green cursor-pointer"
                />
                <span className={`capitalize transition-colors ${isChecked ? 'text-sage-green-dark font-medium' : 'text-stone-600 group-hover:text-stone-800'}`}>
                  {habit.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </label>
            ))}
          </div>
        </section>
      </div>

      {/* 8. Gratitude */}
      <section className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="bg-stone-50 border-b border-stone-100 px-6 py-4 flex items-center">
          <Coffee className="text-orange-400 mr-3" size={24} />
          <h2 className="text-xl font-serif font-medium text-stone-800">Gratitude</h2>
        </div>
        <div className="p-6 space-y-3">
          <p className="text-sm font-medium text-stone-500 mb-2">I am grateful for...</p>
          {[0, 1, 2].map(i => (
            <div key={i} className="flex items-center space-x-3">
              <span className="w-6 text-center text-stone-400 font-serif italic text-lg">{i + 1}</span>
              <input type="text" value={log.gratitude[i]} onChange={e => handleArrayChange('gratitude', i, e.target.value)} className="flex-1 bg-transparent border-b border-stone-200 focus:border-sage-green focus:outline-none py-2 px-1 transition-colors" />
            </div>
          ))}
        </div>
      </section>

      {/* 9. Evening Reflection */}
      <section className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="bg-stone-50 border-b border-stone-100 px-6 py-4 flex items-center">
          <Moon className="text-indigo-900 mr-3" size={24} />
          <h2 className="text-xl font-serif font-medium text-stone-800">Evening Reflection</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Biggest win today</label>
            <input type="text" value={log.evening.biggestWin} onChange={e => handleChange('evening', 'biggestWin', e.target.value)} className="w-full border-stone-200 rounded-lg p-2.5 focus:ring-sage-green bg-stone-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Lesson learned</label>
            <input type="text" value={log.evening.lessonLearned} onChange={e => handleChange('evening', 'lessonLearned', e.target.value)} className="w-full border-stone-200 rounded-lg p-2.5 focus:ring-sage-green" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">What can I improve tomorrow?</label>
            <input type="text" value={log.evening.improveTomorrow} onChange={e => handleChange('evening', 'improveTomorrow', e.target.value)} className="w-full border-stone-200 rounded-lg p-2.5 focus:ring-sage-green" />
          </div>
        </div>
      </section>
      </fieldset>

      {!isReadonly && (
        <div className="flex justify-end pt-4">
          <button
            onClick={async () => {
              if (!id) return;
              setIsSaving(true);
              try {
                await saveDailyLog(id, log);
                setShowToast(true);
                setTimeout(() => setShowToast(false), 4000);
              } catch (error) {
                console.error("Failed to save entry", error);
              } finally {
                setIsSaving(false);
              }
            }}
            disabled={isSaving}
            className="flex items-center gap-2 bg-stone-900 text-white px-8 py-3 rounded-xl font-medium hover:bg-stone-800 transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              'Save Entry'
            )}
          </button>
        </div>
      )}

      {/* Success Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-stone-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in z-50">
          <CheckSquare className="text-sage-green" size={24} />
          <div>
            <p className="font-medium">Entry saved.</p>
            <p className="text-stone-300 text-sm">Your friends have been notified.</p>
          </div>
        </div>
      )}

    </div>
  );
};
