import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { JournalProvider } from './context/JournalContext';
import { Navigation } from './components/Navigation';
import { Menu } from 'lucide-react';

import { Dashboard } from './pages/Dashboard';
import { Vision } from './pages/Vision';
import { DailyLog } from './pages/DailyLog';
import { Review } from './pages/Review';

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-stone-50 flex">
      <Navigation isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
      
      <main className="flex-1 md:ml-64 min-h-screen flex flex-col">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center gap-3 p-4 bg-white border-b border-stone-200 sticky top-0 z-10">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-2 text-stone-600 hover:bg-stone-100 rounded-lg"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-serif font-bold text-stone-900">
            90-Day Journal
          </h1>
        </div>

        <div className="flex-1 max-w-5xl mx-auto w-full h-full">
          {children}
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <JournalProvider>
      <Router>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/vision" element={<Vision />} />
            <Route path="/day/:id" element={<DailyLog />} />
            <Route path="/review/:milestone" element={<Review />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </Router>
    </JournalProvider>
  );
}

export default App;
