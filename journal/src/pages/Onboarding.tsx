/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowRight, ArrowLeft, Search, UserPlus, Check } from 'lucide-react';

const INTERESTS_LIST = [
  { id: 'health', label: 'Health & Fitness', emoji: '🏋️' },
  { id: 'finance', label: 'Finance & Investing', emoji: '💰' },
  { id: 'spirituality', label: 'Spirituality', emoji: '🧘' },
  { id: 'career', label: 'Career Growth', emoji: '🚀' },
  { id: 'reading', label: 'Reading', emoji: '📚' },
  { id: 'relationships', label: 'Relationships', emoji: '🤝' },
  { id: 'creativity', label: 'Creativity', emoji: '🎨' },
  { id: 'travel', label: 'Travel', emoji: '✈️' },
  { id: 'productivity', label: 'Productivity', emoji: '⚡' },
  { id: 'mental_health', label: 'Mental Health', emoji: '🧠' },
];

export const Onboarding = () => {
  const [step, setStep] = useState(0); // 0=Welcome, 1-6=Flow, -1=Login
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const [hasSession, setHasSession] = useState(false);

  // Redirect if already fully onboarded
  useEffect(() => {
    const checkState = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase.from('profiles').select('id, first_name').eq('id', session.user.id).maybeSingle();
        // If they have a profile, kick them to dashboard
        if (profile) {
          navigate('/');
        } else {
          // OAuth User without profile
          setHasSession(true);
          const nameParts = session.user.user_metadata?.full_name?.split(' ') || [];
          setFormData(p => ({
            ...p,
            email: session.user.email || '',
            firstName: p.firstName || nameParts[0] || '',
            lastName: p.lastName || nameParts.slice(1).join(' ') || '',
          }));
          if (step === 0) setStep(1);
        }
      }
    };
    checkState();
  }, [navigate, step]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    goalImportance: 0,
    goalWhy: '',
    timeInvestment: '',
    customTime: '',
    interests: [] as string[]
  });

  const [loginData, setLoginData] = useState({ email: '', password: '' });

  // Step 6 variables
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
  const [requestedUsers, setRequestedUsers] = useState<Set<string>>(new Set());

  const updateForm = (updates: Partial<typeof formData>) => setFormData(p => ({ ...p, ...updates }));

  const handleNext = () => setStep(p => p + 1);
  const handleBack = () => setStep(p => Math.max(0, p - 1));

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword(loginData);
      if (error) throw error;
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(''); setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    setError(''); setIsLoading(true);
    try {
      const { data: existingUser } = await supabase.from('profiles').select('username').eq('username', formData.username).maybeSingle();
      if (existingUser) throw new Error('Username is already taken');

      let userId = '';

      if (hasSession) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) throw new Error('Session lost');
        userId = session.user.id;
      } else {
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });
        if (signUpError) throw signUpError;
        if (!authData.user) throw new Error('Failed to create account.');
        userId = authData.user.id;
      }

      const { error: profileError } = await supabase.from('profiles').insert([{ 
        id: userId, 
        username: formData.username, 
        first_name: formData.firstName,
        last_name: formData.lastName
      }]);
      if (profileError) throw profileError;
      
      handleNext();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = async () => {
    setError(''); setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('No active session. Please log in.');

      const timeToSave = formData.timeInvestment === 'Set Own Time' ? formData.customTime : formData.timeInvestment;

      const { error } = await supabase.from('profiles').update({
        goal_importance: formData.goalImportance,
        goal_why: formData.goalWhy,
        time_investment: timeToSave,
        interests: formData.interests
      }).eq('id', session.user.id);

      if (error) throw error;
      
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSuggestedUsers = async (query = '') => {
    const { data: { session } } = await supabase.auth.getSession();
    
    let q = supabase.from('profiles').select('id, username, first_name, last_name').limit(10);
    
    if (session?.user) {
        q = q.neq('id', session.user.id);
    }
    
    if (query) {
      q = q.ilike('username', `%${query}%`);
    }
    
    const { data } = await q;
    if (data) setSuggestedUsers(data);
  };

  useEffect(() => {
    if (step === 6) fetchSuggestedUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // --- Renders ---

  const renderProgressBar = () => {
    if (step <= 0) return null;
    const progress = (step / 6) * 100;
    return (
      <div className="fixed top-0 left-0 w-full h-1.5 bg-stone-200 z-50">
        <div 
          className="h-full bg-stone-900 transition-all duration-500 ease-out" 
          style={{ width: `${progress}%` }}
        />
      </div>
    );
  };

  const renderLogin = () => (
    <div className="animate-fade-in space-y-6">
      <h2 className="text-3xl font-serif font-bold text-stone-900">Welcome Back</h2>
      {error && <div className="text-red-600 bg-red-50 p-3 rounded-lg text-sm">{error}</div>}
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
          <input type="email" required value={loginData.email} onChange={e => setLoginData(p => ({...p, email: e.target.value}))} className="w-full p-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Password</label>
          <input type="password" required value={loginData.password} onChange={e => setLoginData(p => ({...p, password: e.target.value}))} className="w-full p-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900 outline-none" />
        </div>
        <button type="submit" disabled={isLoading} className="w-full py-4 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition-colors mt-4 mb-2">
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div className="relative flex items-center py-2">
        <div className="flex-grow border-t border-stone-200"></div>
        <span className="flex-shrink-0 mx-4 text-stone-400 text-sm">Or</span>
        <div className="flex-grow border-t border-stone-200"></div>
      </div>

      <button onClick={handleGoogleLogin} disabled={isLoading} className="w-full py-3 bg-white text-stone-900 border border-stone-200 rounded-xl font-medium text-lg hover:bg-stone-50 transition-colors flex items-center justify-center gap-3">
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>

      <button onClick={() => setStep(0)} className="w-full py-3 text-stone-500 font-medium">Back to Welcome</button>
    </div>
  );

  const renderStep0 = () => (
    <div className="animate-fade-in text-center space-y-8">
      <div className="w-20 h-20 bg-stone-900 rounded-2xl mx-auto flex items-center justify-center transform rotate-3 shadow-xl">
        <span className="text-white font-serif text-3xl font-bold italic">90</span>
      </div>
      <div>
        <h1 className="text-4xl font-serif font-bold text-stone-900 mb-4">Your 90-Day Journey Starts Here.</h1>
        <p className="text-stone-500 text-lg">Build habits, track progress, and achieve your vision.</p>
      </div>
      <div className="space-y-4 pt-4">
        {error && <div className="text-red-600 bg-red-50 p-3 rounded-lg text-sm">{error}</div>}
        
        <button onClick={handleGoogleLogin} disabled={isLoading} className="w-full py-4 bg-white text-stone-900 border border-stone-200 rounded-xl font-medium text-lg hover:bg-stone-50 transition-colors flex items-center justify-center gap-3">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-stone-200"></div>
          <span className="flex-shrink-0 mx-4 text-stone-400 text-sm">Or</span>
          <div className="flex-grow border-t border-stone-200"></div>
        </div>

        <button onClick={() => setStep(1)} className="w-full py-4 bg-stone-900 text-white rounded-xl font-medium text-lg hover:bg-stone-800 transition-colors shadow-lg shadow-stone-900/20 flex items-center justify-center gap-2">
          Sign Up with Email <ArrowRight size={20} />
        </button>
        <button onClick={() => setStep(-1)} className="w-full py-4 bg-transparent text-stone-600 rounded-xl font-medium text-lg hover:text-stone-900 transition-colors underline decoration-stone-300 underline-offset-4">
          Login
        </button>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="animate-fade-in space-y-6">
      <h2 className="text-3xl font-serif font-bold text-stone-900">Create Account</h2>
      <p className="text-stone-500">Let's get the basics out of the way.</p>
      {error && <div className="text-red-600 bg-red-50 p-3 rounded-lg text-sm">{error}</div>}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">First Name</label>
            <input type="text" required value={formData.firstName} onChange={e => updateForm({firstName: e.target.value})} className="w-full p-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Surname</label>
            <input type="text" required value={formData.lastName} onChange={e => updateForm({lastName: e.target.value})} className="w-full p-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900 outline-none" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Username</label>
          <input type="text" required value={formData.username} onChange={e => updateForm({username: e.target.value})} className="w-full p-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900 outline-none" />
        </div>
        {!hasSession && (
          <>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Email Address</label>
              <input type="email" required value={formData.email} onChange={e => updateForm({email: e.target.value})} className="w-full p-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Password</label>
              <input type="password" required value={formData.password} onChange={e => updateForm({password: e.target.value})} className="w-full p-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900 outline-none" />
            </div>
          </>
        )}
      </div>
      <div className="pt-4 flex gap-4">
        <button onClick={() => setStep(0)} className="w-14 h-14 bg-white border border-stone-200 rounded-xl flex items-center justify-center text-stone-500 hover:bg-stone-50 transition-colors"><ArrowLeft size={20} /></button>
        <button 
          onClick={handleCreateAccount} 
          disabled={isLoading || !formData.firstName || !formData.lastName || !formData.username || (!hasSession && (!formData.email || !formData.password))}
          className="flex-1 bg-stone-900 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? 'Creating...' : 'Continue'} <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="animate-fade-in space-y-8 text-center pt-8">
      <h2 className="text-3xl font-serif font-bold text-stone-900">How important is achieving your goals to you?</h2>
      <div className="flex justify-between items-center w-full pt-8 px-2">
        {[1, 2, 3, 4, 5].map(num => (
          <button
            key={num}
            onClick={() => updateForm({ goalImportance: num })}
            className={`w-[18%] aspect-[3/4] rounded-2xl flex flex-col items-center justify-center text-2xl font-bold transition-all duration-300 ${
              formData.goalImportance === num 
                ? 'bg-stone-900 text-white shadow-xl shadow-stone-900/20 transform -translate-y-2 border-stone-900' 
                : 'bg-white text-stone-400 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            {num}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-stone-400 px-4">
        <span>Not really</span>
        <span>Crucial</span>
      </div>
      <div className="pt-12 flex gap-4">
        <button onClick={handleBack} className="w-14 h-14 bg-white border border-stone-200 rounded-xl flex items-center justify-center text-stone-500 hover:bg-stone-50 transition-colors"><ArrowLeft size={20} /></button>
        <button onClick={handleNext} disabled={!formData.goalImportance} className="flex-1 bg-stone-900 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50">Continue <ArrowRight size={20} /></button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="animate-fade-in space-y-6 flex flex-col h-full pt-4">
      <h2 className="text-3xl font-serif font-bold text-stone-900">Why do you want to achieve your goals?</h2>
      <textarea 
        value={formData.goalWhy}
        onChange={e => updateForm({goalWhy: e.target.value})}
        placeholder="I want to achieve my goals because..."
        className="w-full p-6 bg-white border border-stone-200 rounded-2xl focus:ring-2 focus:ring-stone-900 outline-none resize-none text-lg text-stone-800 min-h-[250px]"
      />
      <div className="pt-4 flex gap-4 mt-auto">
        <button onClick={handleBack} className="w-14 h-14 bg-white border border-stone-200 rounded-xl flex items-center justify-center text-stone-500 hover:bg-stone-50 transition-colors"><ArrowLeft size={20} /></button>
        <button onClick={handleNext} disabled={!formData.goalWhy.trim()} className="flex-1 bg-stone-900 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50">Continue <ArrowRight size={20} /></button>
      </div>
    </div>
  );

  const renderStep4 = () => {
    const options = ['Not that willing', 'Maybe 1 hour per day', '3 hours per day', '4 hours per day', 'Set Own Time'];
    return (
      <div className="animate-fade-in space-y-8 pt-4">
        <h2 className="text-3xl font-serif font-bold text-stone-900">How much time are you willing to invest to achieving your goals?</h2>
        <div className="space-y-3">
          {options.map(opt => (
            <button
              key={opt}
              onClick={() => updateForm({ timeInvestment: opt })}
              className={`w-full p-5 rounded-2xl border-2 text-left font-medium transition-all ${
                formData.timeInvestment === opt 
                  ? 'border-stone-900 bg-stone-900 text-white shadow-lg' 
                  : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50'
              }`}
            >
              {opt}
            </button>
          ))}
          {formData.timeInvestment === 'Set Own Time' && (
            <div className="animate-fade-in pt-2">
              <input 
                type="text" 
                placeholder="e.g. 5 hours a week" 
                value={formData.customTime}
                onChange={e => updateForm({customTime: e.target.value})}
                className="w-full p-5 bg-white border-2 border-stone-200 rounded-2xl focus:border-stone-900 outline-none text-stone-800"
              />
            </div>
          )}
        </div>
        <div className="pt-4 flex gap-4">
          <button onClick={handleBack} className="w-14 h-14 bg-white border border-stone-200 rounded-xl flex items-center justify-center text-stone-500 hover:bg-stone-50 transition-colors"><ArrowLeft size={20} /></button>
          <button 
            onClick={handleNext} 
            disabled={!formData.timeInvestment || (formData.timeInvestment === 'Set Own Time' && !formData.customTime)} 
            className="flex-1 bg-stone-900 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >Continue <ArrowRight size={20} /></button>
        </div>
      </div>
    );
  };

  const renderStep5 = () => {
    const toggleInterest = (id: string) => {
      const isSelected = formData.interests.includes(id);
      if (isSelected) updateForm({ interests: formData.interests.filter(i => i !== id) });
      else updateForm({ interests: [...formData.interests, id] });
    };

    return (
      <div className="animate-fade-in space-y-8 pt-4">
        <h2 className="text-3xl font-serif font-bold text-stone-900">What are your interests?</h2>
        <div className="flex flex-wrap gap-3">
          {INTERESTS_LIST.map(interest => (
            <button
              key={interest.id}
              onClick={() => toggleInterest(interest.id)}
              className={`px-5 py-3 rounded-full border-2 font-medium transition-all duration-300 flex items-center gap-2 ${
                formData.interests.includes(interest.id)
                  ? 'border-stone-900 bg-stone-900 text-white'
                  : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50'
              }`}
            >
              <span className="text-lg">{interest.emoji}</span> {interest.label}
            </button>
          ))}
        </div>
        <div className="pt-8 flex gap-4">
          <button onClick={handleBack} className="w-14 h-14 bg-white border border-stone-200 rounded-xl flex items-center justify-center text-stone-500 hover:bg-stone-50 transition-colors"><ArrowLeft size={20} /></button>
          <button onClick={handleNext} disabled={formData.interests.length === 0} className="flex-1 bg-stone-900 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50">Continue <ArrowRight size={20} /></button>
        </div>
      </div>
    );
  };

  const renderStep6 = () => {
    const handleAddFriend = async (friendId: string) => {
      try {
        setRequestedUsers(prev => {
          const newSet = new Set(prev);
          newSet.add(friendId);
          return newSet;
        });
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;
        await supabase.from('friendships').insert([{ requester_id: session.user.id, receiver_id: friendId }]);
      } catch (err) {
        console.error(err);
      }
    };

    return (
      <div className="animate-fade-in space-y-6 pt-4 flex flex-col h-[600px]">
        <div>
          <h2 className="text-3xl font-serif font-bold text-stone-900">Social Discovery</h2>
          <p className="text-stone-500 mt-2">Connect with others on the journey.</p>
        </div>
        
        <div className="relative shrink-0">
          <Search className="absolute left-4 top-4 text-stone-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by username..." 
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); fetchSuggestedUsers(e.target.value); }}
            className="w-full p-4 pl-12 bg-white border border-stone-200 rounded-2xl focus:border-stone-900 focus:ring-2 focus:ring-stone-900 outline-none"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 min-h-0 pb-4">
          {suggestedUsers.map(user => (
            <div key={user.id} className="p-4 bg-white border border-stone-100 rounded-2xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center text-stone-500 font-bold">
                  {user.first_name?.charAt(0) || user.username?.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-stone-900">{user.first_name} {user.last_name}</h3>
                  <p className="text-sm text-stone-500">@{user.username}</p>
                </div>
              </div>
              {requestedUsers.has(user.id) ? (
                <button 
                  disabled
                  className="w-10 h-10 bg-sage-green-dark text-white rounded-full flex items-center justify-center shadow-sm"
                  title="Request Sent"
                >
                  <Check size={18} />
                </button>
              ) : (
                <button 
                  onClick={() => handleAddFriend(user.id)}
                  className="w-10 h-10 bg-stone-50 text-stone-600 rounded-full flex items-center justify-center hover:bg-stone-900 hover:text-white transition-colors"
                  title="Add Friend"
                >
                  <UserPlus size={18} />
                </button>
              )}
            </div>
          ))}
          {suggestedUsers.length === 0 && <p className="text-stone-500 text-center py-8">No users found.</p>}
        </div>

        <div className="pt-4 flex gap-4 shrink-0 border-t border-stone-200">
          {error && <div className="text-red-600 w-full text-center mb-2">{error}</div>}
          <button onClick={handleBack} className="w-14 h-14 bg-white border border-stone-200 rounded-xl flex items-center justify-center text-stone-500 hover:bg-stone-50 transition-colors"><ArrowLeft size={20} /></button>
          <button 
            onClick={handleFinish} 
            disabled={isLoading} 
            className="flex-1 bg-stone-900 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Finish & Go to Dashboard'}
          </button>
        </div>
      </div>
    );
  };

  const currentView = () => {
    switch(step) {
      case -1: return renderLogin();
      case 0: return renderStep0();
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      case 6: return renderStep6();
      default: return renderStep0();
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center relative">
      {renderProgressBar()}
      <div className="w-full max-w-md p-6">
        {currentView()}
      </div>
    </div>
  );
};
