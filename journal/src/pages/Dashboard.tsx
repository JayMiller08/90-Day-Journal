import React from 'react';
import { Link } from 'react-router-dom';
import { useJournal } from '../context/JournalContext';
import { LayoutDashboard, Target, Calendar, ArrowRight } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { state } = useJournal();
  
  // Calculate completed daily logs
  const completedDays = Object.keys(state.dailyLogs).length;
  const progressPercentage = Math.round((completedDays / 90) * 100);

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in space-y-10">
      <header className="mb-8">
        <h1 className="text-4xl font-serif text-stone-900 flex items-center">
          <LayoutDashboard className="mr-3 text-sage-green-dark" size={32} />
          Dashboard
        </h1>
        <p className="text-stone-500 mt-2 text-lg">Your 90-day journey at a glance.</p>
      </header>

      {/* Progress Overview */}
      <section className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 flex items-center justify-between">
        <div>
          <h2 className="text-sm uppercase tracking-wider font-semibold text-stone-400 mb-1">Macro Progress</h2>
          <p className="text-4xl font-serif text-stone-800">
            Day <span className="text-sage-green-dark">{completedDays}</span> <span className="text-2xl text-stone-400">/ 90</span>
          </p>
        </div>
        <div className="w-1/2">
          <div className="flex justify-between text-sm font-medium text-stone-500 mb-2">
            <span>Progress</span>
            <span>{progressPercentage}%</span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-sage-green-dark h-3 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/day/1" className="group bg-sage-green/10 p-6 rounded-2xl hover:bg-sage-green/20 transition-colors border border-sage-green/20 flex flex-col justify-between min-h-[160px]">
          <div>
            <Calendar className="text-sage-green-dark mb-4" size={32} />
            <h3 className="text-xl font-serif text-stone-900 mb-2">Today's Entry</h3>
            <p className="text-stone-600 text-sm">Log your morning routine, habits, and daily reflection.</p>
          </div>
          <div className="flex items-center text-sage-green-dark font-medium mt-4 group-hover:translate-x-1 transition-transform">
            <span>Start Writing</span>
            <ArrowRight size={16} className="ml-2" />
          </div>
        </Link>

        <Link to="/vision" className="group bg-white p-6 rounded-2xl shadow-sm border border-stone-100 hover:border-stone-300 transition-colors flex flex-col justify-between min-h-[160px]">
          <div>
            <Target className="text-stone-700 mb-4" size={32} />
            <h3 className="text-xl font-serif text-stone-900 mb-2">Review Vision</h3>
            <p className="text-stone-500 text-sm">Stay aligned with your top 10 goals and deeper purpose.</p>
          </div>
          <div className="flex items-center text-stone-700 font-medium mt-4 group-hover:translate-x-1 transition-transform">
            <span>View Goals</span>
            <ArrowRight size={16} className="ml-2" />
          </div>
        </Link>
      </section>

      {/* Current Top Goals Snippet */}
      <section className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100">
        <h2 className="text-xl font-serif text-stone-800 mb-6 border-b border-stone-100 pb-3">Your Top Goals</h2>
        {state.vision.goals.filter(g => g.trim()).length > 0 ? (
          <ul className="space-y-3">
            {state.vision.goals.filter(g => g.trim()).slice(0, 5).map((goal, i) => (
              <li key={i} className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-sage-green"></div>
                <span className="text-stone-700">{goal}</span>
              </li>
            ))}
            {state.vision.goals.filter(g => g.trim()).length > 5 && (
              <li className="text-sm text-stone-400 italic pt-2">...and {state.vision.goals.filter(g => g.trim()).length - 5} more.</li>
            )}
          </ul>
        ) : (
          <div className="text-center py-6">
            <p className="text-stone-500 mb-4">You haven't defined your 90-day goals yet.</p>
            <Link to="/vision" className="inline-block bg-stone-900 text-white px-5 py-2 rounded-full text-sm hover:bg-stone-800 transition-colors">
              Set Your Vision
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};
