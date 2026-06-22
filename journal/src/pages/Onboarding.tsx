/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const Onboarding = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<any>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const checkState = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (currentSession?.user) {
        setSession(currentSession);
        // Check if they have a profile
        const { data: profile } = await supabase.from('profiles').select('id').eq('id', currentSession.user.id).maybeSingle();
        if (profile) {
          navigate('/');
        }
      }
    };
    checkState();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
        // 1. Check if username is available
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', username)
          .maybeSingle();
          
        if (existingUser) {
            setError('Username is already taken');
            setIsLoading(false);
            return;
        }

        let currentUserId = session?.user?.id;

        if (!currentUserId) {
            // 2. Sign up the user
            const { data: authData, error: signUpError } = await supabase.auth.signUp({
              email,
              password,
            });

            if (signUpError) throw signUpError;
            currentUserId = authData?.user?.id;
        }

        if (currentUserId) {
          // 3. Create profile
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([{ 
                id: currentUserId, 
                username, 
                display_name: displayName 
            }]);

          if (profileError) throw profileError;
          
          // Force hard reload to update AuthContext and JournalContext globally
          window.location.href = '/';
        }
    } catch (err: any) {
        console.error('Onboarding error:', err);
        setError(err.message || 'An error occurred during sign up');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200 max-w-md w-full">
        <h1 className="text-3xl font-serif font-bold text-stone-900 mb-6">
          Welcome to 90-Day Journal
        </h1>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-4">
          {!session && (
            <>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-900 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-900 outline-none"
                />
              </div>
            </>
          )}
          {session && (
              <div className="bg-blue-50 text-blue-700 p-4 rounded-lg mb-4 text-sm">
                  You are signed in as {session.user.email}, but you need to complete your profile to continue.
              </div>
          )}
          <div className="pt-4 border-t border-stone-100">
              <h3 className="text-sm font-medium text-stone-700 mb-3">Profile Details</h3>
              <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Username</label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full p-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Display Name</label>
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full p-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-900 outline-none"
                    />
                  </div>
              </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-stone-900 text-white py-3 rounded-lg font-medium hover:bg-stone-800 transition-colors disabled:opacity-50 mt-6"
          >
            {isLoading ? 'Processing...' : (session ? 'Complete Profile' : 'Sign Up')}
          </button>
        </form>
      </div>
    </div>
  );
};
