import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Sun, Brain, Heart, Briefcase, Activity, DollarSign, CheckSquare, Coffee, Moon, ArrowLeft } from 'lucide-react';
import type { DailyLog as DailyLogType } from '../context/JournalContext';

export const FriendDailyLog: React.FC = () => {
  const { friendId, dateId } = useParams<{ friendId: string; dateId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [log, setLog] = useState<DailyLogType | null>(null);
  const [friend, setFriend] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !friendId || !dateId) return;

      // Check friendship
      const { data: friendship } = await supabase
        .from('friendships')
        .select('id')
        .eq('status', 'accepted')
        .or(`and(requester_id.eq.${user.id},receiver_id.eq.${friendId}),and(requester_id.eq.${friendId},receiver_id.eq.${user.id})`)
        .maybeSingle();

      if (!friendship) {
        setIsLoading(false);
        return;
      }

      const { data: profileData } = await supabase.from('profiles').select('first_name, last_name').eq('id', friendId).maybeSingle();
      if (profileData) setFriend(profileData);

      const { data: logData } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', friendId)
        .eq('date_id', dateId)
        .eq('is_public', true)
        .maybeSingle();

      if (logData) {
        setLog({
          id: logData.date_id,
          is_public: logData.is_public,
          morning: logData.morning,
          meditation: logData.meditation,
          faith: logData.faith,
          business: logData.business,
          health: logData.health,
          financial: logData.financial,
          habits: logData.habits,
          gratitude: logData.gratitude,
          evening: logData.evening,
        });
      }
      setIsLoading(false);
    };

    fetchData();
  }, [friendId, dateId, user]);

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (!log) return <div className="p-8">Entry not found or is private.</div>;

  return (
    <div className="p-8 pb-20 max-w-4xl mx-auto animate-fade-in space-y-8">
      <header className="mb-10 flex items-center justify-between">
        <div>
            <button onClick={() => navigate(-1)} className="flex items-center text-stone-500 hover:text-stone-900 mb-4 transition-colors">
                <ArrowLeft size={16} className="mr-2" /> Back
            </button>
            <h1 className="text-4xl font-serif text-stone-900">Day {dateId} <span className="text-2xl text-stone-400 ml-2">({friend?.first_name}'s Journal)</span></h1>
        </div>
      </header>

      <fieldset disabled={true} className="space-y-8 border-none p-0 m-0 opacity-90">
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
              <input type="time" value={log.morning.wakeUpTime} readOnly className="w-full border-stone-200 rounded-lg p-2.5 focus:ring-sage-green focus:border-transparent" />
            </div>
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-stone-600 mb-1">Mood</label>
                <select value={log.morning.mood} disabled className="w-full border-stone-200 rounded-lg p-2.5 focus:ring-sage-green focus:border-transparent">
                  <option value="🤩">🤩 Excellent</option>
                  <option value="😊">😊 Good</option>
                  <option value="😐">😐 Neutral</option>
                  <option value="😔">😔 Rough</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-stone-600 mb-1">Energy: {log.morning.energy}</label>
                <input type="range" min="1" max="10" value={log.morning.energy} readOnly className="w-full mt-2 accent-sage-green" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-2">Top 3 Priorities</label>
            <div className="space-y-2">
              {[0, 1, 2].map(i => (
                <div key={i} className="flex items-center space-x-2">
                  <span className="text-stone-400 font-medium">{i + 1}.</span>
                  <input type="text" value={log.morning.top3Priorities[i] || ''} readOnly className="flex-1 border-stone-200 rounded-lg p-2 text-sm focus:ring-sage-green" />
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
              <input type="number" value={log.meditation.minutes} readOnly className="w-full border-stone-200 rounded-lg p-2.5 focus:ring-sage-green" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">Focus</label>
              <input type="text" value={log.meditation.focus} readOnly className="w-full border-stone-200 rounded-lg p-2.5 focus:ring-sage-green" />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-stone-600 mb-1">Key insight</label>
            <textarea value={log.meditation.insight} readOnly className="w-full h-full min-h-[100px] border-stone-200 rounded-lg p-3 focus:ring-sage-green resize-none" />
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
            <input type="text" value={log.faith.bibleVerse} readOnly className="w-full border-stone-200 rounded-lg p-2.5 focus:ring-sage-green font-serif italic text-stone-700" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Prayer points</label>
            <textarea value={log.faith.prayerPoints} readOnly className="w-full border-stone-200 rounded-lg p-3 min-h-[100px] focus:ring-sage-green" />
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
            <textarea value={log.business.tasksCompleted} readOnly className="w-full border-stone-200 rounded-lg p-3 min-h-[120px] focus:ring-sage-green" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Progress made today</label>
            <textarea value={log.business.progressMade} readOnly className="w-full border-stone-200 rounded-lg p-3 min-h-[120px] focus:ring-sage-green" />
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
              <input type="text" value={log.health.exercise} readOnly className="w-full border-stone-200 rounded-lg p-2.5 focus:ring-sage-green" />
            </div>
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-stone-600 mb-1">Duration (min)</label>
                <input type="number" value={log.health.duration} readOnly className="w-full border-stone-200 rounded-lg p-2.5 focus:ring-sage-green" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-stone-600 mb-1">Water (glasses)</label>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-lg w-6 text-center">{log.health.waterIntake}</span>
                </div>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Nutrition notes</label>
            <textarea value={log.health.nutrition} readOnly className="w-full border-stone-200 rounded-lg p-3 min-h-[120px] focus:ring-sage-green" />
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
                <input type="number" value={log.financial.earned} readOnly className="w-full border-stone-200 rounded-lg p-2 focus:ring-sage-green" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Spent</label>
                <input type="number" value={log.financial.spent} readOnly className="w-full border-stone-200 rounded-lg p-2 focus:ring-sage-green" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Saved</label>
                <input type="number" value={log.financial.saved} readOnly className="w-full border-stone-200 rounded-lg p-2 focus:ring-sage-green" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">Investment notes</label>
              <textarea value={log.financial.notes} readOnly className="w-full border-stone-200 rounded-lg p-2.5 h-20 focus:ring-sage-green" />
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
              <label key={habit} className="flex items-center space-x-3 cursor-not-allowed group">
                <input 
                  type="checkbox" 
                  checked={isChecked} 
                  disabled
                  className="w-5 h-5 text-sage-green-dark border-stone-300 rounded focus:ring-sage-green"
                />
                <span className={`capitalize transition-colors ${isChecked ? 'text-sage-green-dark font-medium' : 'text-stone-600'}`}>
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
              <input type="text" value={log.gratitude[i] || ''} readOnly className="flex-1 bg-transparent border-b border-stone-200 focus:border-sage-green focus:outline-none py-2 px-1" />
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
            <input type="text" value={log.evening.biggestWin} readOnly className="w-full border-stone-200 rounded-lg p-2.5 focus:ring-sage-green bg-stone-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Lesson learned</label>
            <input type="text" value={log.evening.lessonLearned} readOnly className="w-full border-stone-200 rounded-lg p-2.5 focus:ring-sage-green" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">What can I improve tomorrow?</label>
            <input type="text" value={log.evening.improveTomorrow} readOnly className="w-full border-stone-200 rounded-lg p-2.5 focus:ring-sage-green" />
          </div>
        </div>
      </section>
      </fieldset>
    </div>
  );
};
