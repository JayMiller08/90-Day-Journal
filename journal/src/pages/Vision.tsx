import React from 'react';
import { useJournal, type Goal } from '../context/JournalContext';
import { Target, Lock, Edit3 } from 'lucide-react';

export const Vision: React.FC = () => {
  const { state, saveVision } = useJournal();
  const [goals, setGoals] = React.useState<Goal[]>(state.vision.goals);
  const [purpose, setPurpose] = React.useState(state.vision.purpose);
  const [isLocked, setIsLocked] = React.useState(state.vision.isLocked);

  const handleGoalChange = (index: number, value: string) => {
    const newGoals = [...goals];
    newGoals[index] = value;
    setGoals(newGoals);
  };

  const handleSave = () => {
    saveVision(goals, purpose);
    setIsLocked(true);
  };

  return (
    <div className="p-8 pb-20 max-w-4xl mx-auto animate-fade-in">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-serif text-stone-900 flex items-center">
            <Target className="mr-3 text-sage-green-dark" size={32} />
            90-Day Vision & Goals
          </h1>
          <p className="text-stone-500 mt-2 text-lg">Define your trajectory for the next 90 days.</p>
        </div>
        {isLocked ? (
          <button 
            onClick={() => setIsLocked(false)}
            className="flex items-center space-x-2 text-stone-500 hover:text-stone-900 transition-colors px-4 py-2 rounded-full hover:bg-stone-100"
          >
            <Edit3 size={18} />
            <span>Edit Vision</span>
          </button>
        ) : (
          <button 
            onClick={handleSave}
            className="flex items-center space-x-2 bg-sage-green-dark text-white px-6 py-2.5 rounded-full hover:bg-opacity-90 transition-all shadow-sm hover:shadow-md"
          >
            <Lock size={18} />
            <span className="font-medium">Save & Commit</span>
          </button>
        )}
      </header>

      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-serif text-stone-800 mb-6 border-b border-stone-200 pb-2">Top 10 Goals</h2>
          {isLocked ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goals.map((goal, i) => (
                goal.trim() && (
                  <div key={i} className="flex items-start space-x-3 bg-white p-4 rounded-xl shadow-sm border border-stone-100">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-sage-green/20 text-sage-green-dark flex items-center justify-center font-bold text-sm">
                      {i + 1}
                    </span>
                    <p className="text-stone-800 leading-relaxed pt-1">{goal}</p>
                  </div>
                )
              ))}
              {!goals.some(g => g.trim()) && (
                <p className="text-stone-400 italic">No goals defined yet.</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {goals.map((goal, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <span className="text-stone-400 font-medium w-6 text-right">{i + 1}.</span>
                  <input
                    type="text"
                    value={goal}
                    onChange={(e) => handleGoalChange(i, e.target.value)}
                    placeholder={`Goal #${i + 1}`}
                    className="flex-1 bg-white border border-stone-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sage-green focus:border-transparent transition-all"
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-serif text-stone-800 mb-6 border-b border-stone-200 pb-2">Why these goals matter to me:</h2>
          {isLocked ? (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 min-h-[150px]">
              {purpose ? (
                <p className="text-stone-700 leading-relaxed whitespace-pre-wrap">{purpose}</p>
              ) : (
                <p className="text-stone-400 italic">Purpose not defined.</p>
              )}
            </div>
          ) : (
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Reflect on your deeper purpose here..."
              className="w-full bg-white border border-stone-200 rounded-2xl p-6 min-h-[200px] focus:outline-none focus:ring-2 focus:ring-sage-green focus:border-transparent transition-all resize-y"
            />
          )}
        </section>
      </div>
    </div>
  );
};
