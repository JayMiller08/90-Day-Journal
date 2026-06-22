import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Target, CalendarDays, Award, X, Activity, Users, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavigationProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ isOpen, setIsOpen }) => {
  const closeMenu = () => setIsOpen(false);
  const { signOut } = useAuth();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-stone-900/50 z-40 md:hidden transition-opacity"
          onClick={closeMenu}
        />
      )}

      <nav className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-stone-200 shadow-sm flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-6 border-b border-stone-100 flex items-center justify-between">
          <h1 className="text-xl font-serif font-bold text-stone-900 leading-tight">
            90-Day Success<br/>Journal
          </h1>
          <button 
            className="md:hidden p-2 text-stone-500 hover:bg-stone-100 rounded-lg"
            onClick={closeMenu}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          <NavLink 
            to="/" 
            onClick={closeMenu}
            className={({ isActive }) => 
              `flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-sage-green/10 text-sage-green-dark font-medium' : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'}`
            }
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink 
            to="/vision" 
            onClick={closeMenu}
            className={({ isActive }) => 
              `flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-sage-green/10 text-sage-green-dark font-medium' : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'}`
            }
          >
            <Target size={20} />
            <span>Vision & Goals</span>
          </NavLink>

          <NavLink 
            to="/profile" 
            onClick={closeMenu}
            className={({ isActive }) => 
              `flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-sage-green/10 text-sage-green-dark font-medium' : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'}`
            }
          >
            <User size={20} />
            <span>Profile</span>
          </NavLink>

          <div className="pt-6 pb-2 px-4">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
              Social
            </p>
          </div>
          
          <NavLink 
            to="/feed" 
            onClick={closeMenu}
            className={({ isActive }) => 
              `flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-sage-green/10 text-sage-green-dark font-medium' : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'}`
            }
          >
            <Activity size={20} />
            <span>Feed</span>
          </NavLink>

          <NavLink 
            to="/network" 
            onClick={closeMenu}
            className={({ isActive }) => 
              `flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-sage-green/10 text-sage-green-dark font-medium' : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'}`
            }
          >
            <Users size={20} />
            <span>Network</span>
          </NavLink>

          <div className="pt-6 pb-2 px-4">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
              Daily Logs
            </p>
          </div>
          
          <NavLink 
            to="/day/1" 
            onClick={closeMenu}
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
            onClick={closeMenu}
            className={({ isActive }) => 
              `flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-sage-green/10 text-sage-green-dark font-medium' : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'}`
            }
          >
            <Award size={20} />
            <span>30-Day Review</span>
          </NavLink>
          
          <NavLink 
            to="/review/60" 
            onClick={closeMenu}
            className={({ isActive }) => 
              `flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-sage-green/10 text-sage-green-dark font-medium' : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'}`
            }
          >
            <Award size={20} />
            <span>60-Day Review</span>
          </NavLink>

          <NavLink 
            to="/review/90" 
            onClick={closeMenu}
            className={({ isActive }) => 
              `flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-sage-green/10 text-sage-green-dark font-medium' : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'}`
            }
          >
            <Award size={20} />
            <span>90-Day Review</span>
          </NavLink>
        </div>
        
        <div className="p-4 border-t border-stone-100">
          <button 
            onClick={() => signOut()}
            className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl transition-colors text-stone-600 hover:bg-stone-50 hover:text-stone-900"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </nav>
    </>
  );
};

