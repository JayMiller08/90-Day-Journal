import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJournal } from '../context/JournalContext';

export const ProgressHeatmap: React.FC = () => {
  const { state } = useJournal();
  const navigate = useNavigate();
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  const getScore = (dayStr: string) => {
    const log = state.dailyLogs[dayStr];
    if (!log || !log.habits) return 0;
    const h = log.habits;
    let score = 0;
    if (h.read) score++;
    if (h.exercise) score++;
    if (h.pray) score++;
    if (h.meditate) score++;
    if (h.saveMoney) score++;
    if (h.learn) score++;
    return score;
  };

  const getColorClass = (score: number) => {
    if (score === 0) return 'bg-stone-100 border-stone-200';
    if (score <= 2) return 'bg-sage-green border-sage-green opacity-40';
    if (score <= 4) return 'bg-sage-green border-sage-green opacity-70';
    return 'bg-sage-green-dark border-sage-green-dark';
  };

  // Generate 90 days
  const days = Array.from({ length: 90 }, (_, i) => i + 1);

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-stone-100 overflow-x-auto">
      <h2 className="text-xl font-serif text-stone-800 mb-6 border-b border-stone-100 pb-3">Habit Heatmap</h2>
      
      <div className="min-w-[600px] flex flex-col items-center">
        <div 
          className="grid gap-2" 
          style={{ 
            gridTemplateRows: 'repeat(7, minmax(0, 1fr))',
            gridAutoFlow: 'column' 
          }}
        >
          {days.map(day => {
            const score = getScore(day.toString());
            return (
              <div 
                key={day}
                className="relative group"
                onMouseEnter={() => setHoveredDay(day)}
                onMouseLeave={() => setHoveredDay(null)}
              >
                <button
                  onClick={() => navigate(`/day/${day}`, { state: { isReadonly: !!state.dailyLogs[day.toString()] } })}
                  className={`w-5 h-5 rounded-sm border ${getColorClass(score)} transition-all duration-200 hover:ring-2 ring-stone-400 ring-offset-1 block`}
                  aria-label={`Day ${day}`}
                />
                
                {/* Tooltip */}
                {hoveredDay === day && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-stone-900 text-white text-xs font-medium py-1.5 px-3 rounded-lg shadow-xl z-10 pointer-events-none">
                    Day {day}
                    <div className="text-stone-300 text-[10px] mt-0.5">
                      {score > 0 ? `${score} of 6 habits completed` : 'No log entry'}
                    </div>
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-stone-900"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Legend */}
        <div className="flex items-center gap-2 mt-8 text-xs text-stone-500 font-medium self-end">
          <span>Less</span>
          <div className="w-4 h-4 rounded-sm border bg-stone-100 border-stone-200"></div>
          <div className="w-4 h-4 rounded-sm border bg-sage-green border-sage-green opacity-40"></div>
          <div className="w-4 h-4 rounded-sm border bg-sage-green border-sage-green opacity-70"></div>
          <div className="w-4 h-4 rounded-sm border bg-sage-green-dark border-sage-green-dark"></div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
};
