import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Target, CalendarDays, Award } from 'lucide-react';

export const Navigation: React.FC = () => {
  return (
    <nav className="fixed left-0 top-0 h-full w-64 bg-white border-r border-stone-200 shadow-sm flex flex-col">
      <div className="p-6 border-b border-stone-100">
        <h1 className="text-xl font-serif font-bold text-stone-900 leading-tight">
          90-Day Success<br/>Journal
        </h1>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        <NavLink 
          to="/" 
          className={({ isActive }) => 
            `flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-sage-green/10 text-sage-green-dark font-medium' : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'}`
          }
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        
        <NavLink 
          to="/vision" 
          className={({ isActive }) => 
            `flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-sage-green/10 text-sage-green-dark font-medium' : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'}`
          }
        >
          <Target size={20} />
          <span>Vision & Goals</span>
        </NavLink>

        <div className="pt-6 pb-2 px-4">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
            Daily Logs
          </p>
        </div>
        
        <NavLink 
          to="/day/1" 
          className={({ isActive }) => 
            `flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-sage-green/10 text-sage-green-dark font-medium' : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'}`
          }
        >
          <CalendarDays size={20} />
          <span>Today's Entry</span>
        </NavLink>

        <div className="pt-6 pb-2 px-4">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
            Milestones
          </p>
        </div>

        <NavLink 
          to="/review/30" 
          className={({ isActive }) => 
            `flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-sage-green/10 text-sage-green-dark font-medium' : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'}`
          }
        >
          <Award size={20} />
          <span>30-Day Review</span>
        </NavLink>
        
        <NavLink 
          to="/review/60" 
          className={({ isActive }) => 
            `flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-sage-green/10 text-sage-green-dark font-medium' : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'}`
          }
        >
          <Award size={20} />
          <span>60-Day Review</span>
        </NavLink>

        <NavLink 
          to="/review/90" 
          className={({ isActive }) => 
            `flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-sage-green/10 text-sage-green-dark font-medium' : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'}`
          }
        >
          <Award size={20} />
          <span>90-Day Review</span>
        </NavLink>
      </div>
    </nav>
  );
};
