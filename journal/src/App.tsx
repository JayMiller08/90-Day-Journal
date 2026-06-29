import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { JournalProvider } from './context/JournalContext';
import { Navigation } from './components/Navigation';
import { Menu } from 'lucide-react';

import { Dashboard } from './pages/Dashboard';
import { Vision } from './pages/Vision';
import { DailyLog } from './pages/DailyLog';
import { Review } from './pages/Review';
import { Onboarding } from './pages/Onboarding';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { Network } from './pages/Network';
import { Feed } from './pages/Feed';
import { FriendDashboard } from './pages/FriendDashboard';
import { Profile } from './pages/Profile';
import { NotificationBell } from './components/NotificationBell';
import { FriendDailyLog } from './pages/FriendDailyLog';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user || !profile) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
};



const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-stone-50 flex">
      <Navigation isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
      
      <main className="flex-1 md:ml-64 min-h-screen flex flex-col">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-stone-200 sticky top-0 z-10">
          <div className="flex items-center gap-3">
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
          <NotificationBell />
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex justify-end p-4 bg-transparent absolute top-0 right-0 z-10 w-full">
            <div className="mr-4 mt-2">
                <NotificationBell />
            </div>
        </div>

        <div className="flex-1 max-w-5xl mx-auto w-full h-full pt-6 md:pt-12">
          {children}
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <JournalProvider>
        <Router>
          <Routes>
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            <Route path="*" element={
              <ProtectedRoute>
                <AppLayout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/vision" element={<Vision />} />
                    <Route path="/day/:id" element={<DailyLog />} />
                    <Route path="/review/:milestone" element={<Review />} />
                    <Route path="/network" element={<Network />} />
                    <Route path="/feed" element={<Feed />} />
                    <Route path="/friend/:id" element={<FriendDashboard />} />
                    <Route path="/friend/:friendId/day/:dateId" element={<FriendDailyLog />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </AppLayout>
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </JournalProvider>
    </AuthProvider>
  );
}

export default App;
