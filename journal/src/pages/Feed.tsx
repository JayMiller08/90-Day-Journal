/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Activity, CheckCircle, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Feed = () => {
  const { user } = useAuth();
  const [feedItems, setFeedItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      if (!user) return;
      
      // Step 1: Get accepted friends' IDs
      const { data: friendships } = await supabase
        .from('friendships')
        .select('requester_id, receiver_id')
        .eq('status', 'accepted')
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`);
        
      if (!friendships || friendships.length === 0) {
          setIsLoading(false);
          return;
      }
      
      const friendIds = friendships.map(f => f.requester_id === user.id ? f.receiver_id : f.requester_id);
      
      // Step 2: Fetch public daily logs from those friends
      // Using an inner join to profiles to get display_name and username
      const { data: logs } = await supabase
        .from('daily_logs')
        .select('*, profiles(id, username, display_name)')
        .in('user_id', friendIds)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(20);
        
      if (logs) setFeedItems(logs);
      setIsLoading(false);
    };
    
    fetchFeed();
  }, [user]);

  const countCompletedHabits = (habits: any) => {
      if (!habits) return 0;
      return Object.values(habits).filter(Boolean).length;
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <div className="flex items-center gap-3 mb-8">
        <Activity className="text-stone-900" size={32} />
        <h1 className="text-3xl font-serif font-bold text-stone-900">Accountability Feed</h1>
      </div>

      {isLoading ? (
          <p className="text-stone-500">Loading feed...</p>
      ) : feedItems.length === 0 ? (
          <div className="text-center py-12 bg-white border border-stone-200 rounded-2xl shadow-sm">
            <p className="text-stone-500 mb-4">Your feed is quiet. Connect with friends to see their public logs!</p>
            <Link to="/network" className="inline-block bg-stone-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-stone-800">
                Find Friends
            </Link>
          </div>
      ) : (
          <div className="space-y-6">
              {feedItems.map(item => (
                  <div key={item.id} className="bg-white border border-stone-200 rounded-2xl shadow-sm p-6">
                      <div className="flex items-center justify-between mb-4 pb-4 border-b border-stone-100">
                          <Link to={`/friend/${item.profiles.id}`} className="hover:underline">
                              <h3 className="font-bold text-stone-900">{item.profiles.display_name}</h3>
                              <p className="text-sm text-stone-500">@{item.profiles.username}</p>
                          </Link>
                          <span className="text-xs font-medium bg-stone-100 text-stone-600 px-3 py-1 rounded-full">
                              Day {item.date_id}
                          </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                          <div className="bg-green-50 p-4 rounded-xl flex items-center gap-3">
                              <CheckCircle className="text-green-600" size={24} />
                              <div>
                                  <p className="text-sm font-medium text-green-900">Habits</p>
                                  <p className="text-2xl font-bold text-green-700">{countCompletedHabits(item.habits)} / 6</p>
                              </div>
                          </div>
                          
                          <div className="bg-orange-50 p-4 rounded-xl flex items-center gap-3">
                              <Flame className="text-orange-600" size={24} />
                              <div>
                                  <p className="text-sm font-medium text-orange-900">Energy</p>
                                  <p className="text-2xl font-bold text-orange-700">{item.morning?.energy || 0} / 10</p>
                              </div>
                          </div>
                      </div>
                      
                      {item.evening?.biggestWin && (
                          <div className="mt-4 p-4 bg-stone-50 rounded-xl">
                              <p className="text-sm font-medium text-stone-500 mb-1">Biggest Win</p>
                              <p className="text-stone-800 italic">"{item.evening.biggestWin}"</p>
                          </div>
                      )}
                  </div>
              ))}
          </div>
      )}
    </div>
  );
};
