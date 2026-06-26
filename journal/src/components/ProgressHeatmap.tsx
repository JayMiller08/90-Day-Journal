import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJournal } from '../context/JournalContext';
import { useAuth } from '../context/AuthContext';

export const ProgressHeatmap: React.FC = () => {
  const { state } = useJournal();
  const { profile } = useAuth();
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

  const { cells, monthLabels, numColumns } = useMemo(() => {
    const start = new Date(profile?.created_at || new Date());
    start.setHours(0, 0, 0, 0);
    const startDayOfWeek = start.getDay(); // 0 is Sunday

    const generatedCells: any[] = [];
    
    // Add empty cells for padding
    for (let i = 0; i < startDayOfWeek; i++) {
      generatedCells.push({ type: 'empty', id: `empty-${i}` });
    }

    // Add 90 days
    for (let i = 1; i <= 90; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + (i - 1));
      generatedCells.push({ type: 'day', day: i, date });
    }

    const columns = Math.ceil(generatedCells.length / 7);
    const labels: { month: string, colIndex: number }[] = [];
    let currentMonth = -1;

    for (let col = 0; col < columns; col++) {
      const cellIndex = col * 7;
      for (let row = 0; row < 7; row++) {
        const cell = generatedCells[cellIndex + row];
        if (cell && cell.type === 'day') {
          const month = cell.date.getMonth();
          if (month !== currentMonth) {
            labels.push({ 
              month: cell.date.toLocaleString('default', { month: 'short' }), 
              colIndex: col 
            });
            currentMonth = month;
          }
          break; // found the month for this column, move to next column
        }
      }
    }

    return { cells: generatedCells, monthLabels: labels, numColumns: columns };
  }, [profile?.created_at]);

  return (
    <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-sm border border-stone-100 overflow-visible">
      <h2 className="text-xl font-serif text-stone-800 mb-6 border-b border-stone-100 pb-3">Progress</h2>
      
      <div className="w-full flex flex-col items-center">
        <div className="flex flex-col w-full sm:w-auto max-w-full">
          {/* Months Header Row */}
          <div className="flex pl-8 mb-2 gap-1 sm:gap-1.5 md:gap-2">
            {Array.from({ length: numColumns }).map((_, col) => {
              const label = monthLabels.find(m => m.colIndex === col);
              return (
                <div key={col} className="w-3 sm:w-4 md:w-5 relative h-4 shrink-0">
                  {label && (
                    <span className="absolute left-0 top-0 text-xs text-stone-500 font-medium whitespace-nowrap">
                      {label.month}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex">
            {/* Y-Axis: Days of Week */}
            <div className="flex flex-col gap-1 sm:gap-1.5 md:gap-2 pr-2 text-[10px] text-stone-400 font-medium text-right w-8 mt-0.5 shrink-0">
              <div className="h-3 sm:h-4 md:h-5"></div>
              <div className="h-3 sm:h-4 md:h-5 flex items-center justify-end leading-none">Mon</div>
              <div className="h-3 sm:h-4 md:h-5"></div>
              <div className="h-3 sm:h-4 md:h-5 flex items-center justify-end leading-none">Wed</div>
              <div className="h-3 sm:h-4 md:h-5"></div>
              <div className="h-3 sm:h-4 md:h-5 flex items-center justify-end leading-none">Fri</div>
              <div className="h-3 sm:h-4 md:h-5"></div>
            </div>

            {/* Heatmap Grid */}
            <div 
              className="grid gap-1 sm:gap-1.5 md:gap-2" 
              style={{ 
                gridTemplateRows: 'repeat(7, minmax(0, 1fr))',
                gridAutoFlow: 'column' 
              }}
            >
              {cells.map((cell) => {
                if (cell.type === 'empty') {
                  return <div key={cell.id} className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 rounded-sm bg-transparent" />;
                }

                const { day, date } = cell;
                const score = getScore(day.toString());
                const isHovered = hoveredDay === day;

                return (
                  <div 
                    key={day}
                    className="relative group"
                    onMouseEnter={() => setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                  >
                    <button
                      onClick={() => navigate(`/day/${day}`, { state: { isReadonly: !!state.dailyLogs[day.toString()] } })}
                      className={`w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 rounded-sm border ${getColorClass(score)} transition-all duration-200 hover:ring-2 ring-stone-400 ring-offset-1 block`}
                      aria-label={`Day ${day}`}
                    />
                    
                    {/* Tooltip */}
                    {isHovered && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-stone-900 text-white text-xs font-medium py-1.5 px-3 rounded-lg shadow-xl z-20 pointer-events-none">
                        <div className="mb-0.5">{date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</div>
                        <div className="text-stone-300 text-[10px]">
                          Day {day} • {score > 0 ? `${score} of 6 habits completed` : 'No log entry'}
                        </div>
                        {/* Arrow */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-stone-900"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex items-center gap-1.5 sm:gap-2 mt-6 sm:mt-8 text-xs text-stone-500 font-medium self-end">
          <span>Less</span>
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-sm border bg-stone-100 border-stone-200"></div>
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-sm border bg-sage-green border-sage-green opacity-40"></div>
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-sm border bg-sage-green border-sage-green opacity-70"></div>
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-sm border bg-sage-green-dark border-sage-green-dark"></div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
};
