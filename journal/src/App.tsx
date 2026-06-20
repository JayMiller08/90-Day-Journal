import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { JournalProvider } from './context/JournalContext';
import { Navigation } from './components/Navigation';

import { Dashboard } from './pages/Dashboard';
import { Vision } from './pages/Vision';
import { DailyLog } from './pages/DailyLog';
import { Review } from './pages/Review';

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-stone-50 flex">
      <Navigation />
      <main className="flex-1 ml-64 min-h-screen">
        <div className="max-w-5xl mx-auto w-full h-full">
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
