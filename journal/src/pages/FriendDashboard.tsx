/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Lock, FileText, Target } from 'lucide-react';

export const FriendDashboard = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [friend, setFriend] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [goals, setGoals] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFriend, setIsFriend] = useState(false);

  useEffect(() => {
    const fetchFriendData = async () => {
      if (!user || !id) return;

      // 1. Check friendship status
      const { data: friendship } = await supabase
        .from('friendships')
        .select('id')
        .eq('status', 'accepted')
        .or(`and(requester_id.eq.${user.id},receiver_id.eq.${id}),and(requester_id.eq.${id},receiver_id.eq.${user.id})`)
        .maybeSingle();

      if (!friendship) {
        setIsLoading(false);
        return;
      }
      setIsFriend(true);

      // 2. Fetch friend's profile
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
      if (profile) setFriend(profile);

      // 3. Fetch friend's goals and public logs
      const { data: goalsData } = await supabase.from('goals').select('*').eq('user_id', id).maybeSingle();
      if (goalsData) setGoals(goalsData);

      const { data: logsData } = await supabase.from('daily_logs').select('*').eq('user_id', id).eq('is_public', true).order('created_at', { ascending: false });
      if (logsData) setLogs(logsData);

      setIsLoading(false);
    };

    fetchFriendData();
  }, [id, user]);

  if (isLoading) return <div className="p-8 text-stone-500">Loading friend's dashboard...</div>;

  if (!isFriend) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center mt-20 bg-white border border-stone-200 rounded-2xl shadow-sm">
        <Lock className="mx-auto text-stone-400 mb-4" size={48} />
        <h1 className="text-2xl font-serif font-bold text-stone-900 mb-2">Private Journal</h1>
        <p className="text-stone-500">You must be friends to view this journal.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      <header className="flex items-center gap-4 border-b border-stone-200 pb-6">
        <div className="w-16 h-16 bg-stone-200 rounded-full flex items-center justify-center text-2xl font-bold text-stone-500">
            {friend?.display_name?.charAt(0).toUpperCase()}
        </div>
        <div>
            <h1 className="text-3xl font-serif font-bold text-stone-900">{friend?.display_name}'s Journal</h1>
            <p className="text-stone-500">@{friend?.username}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
            <h2 className="text-xl font-bold font-serif flex items-center gap-2"><FileText size={20} /> Public Daily Logs</h2>
            {logs.length === 0 ? (
                <p className="text-stone-500 italic">No public logs available.</p>
            ) : (
                logs.map(log => (
                    <div key={log.id} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <span className="font-bold text-stone-900">Day {log.date_id}</span>
                            <span className="text-sm bg-stone-100 px-3 py-1 rounded-full text-stone-600">
                                {new Date(log.created_at).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="space-y-4">
                            {log.evening?.biggestWin && (
                                <div>
                                    <p className="text-xs font-bold text-stone-400 uppercase">Biggest Win</p>
                                    <p className="text-stone-800">{log.evening.biggestWin}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-xs font-bold text-stone-400 uppercase">Energy</p>
                                <p className="text-stone-800">{log.morning?.energy || 0} / 10</p>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                <h2 className="text-xl font-bold font-serif mb-4 flex items-center gap-2"><Target size={20} /> Vision</h2>
                {goals?.purpose ? (
                    <p className="text-stone-700 italic">"{goals.purpose}"</p>
                ) : (
                    <p className="text-stone-500 italic">No vision shared.</p>
                )}
                
                <h3 className="font-bold text-stone-900 mt-6 mb-2">Goals</h3>
                {goals?.goals && goals.goals.filter(Boolean).length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1 text-stone-700">
                        {goals.goals.filter(Boolean).map((g: string, i: number) => <li key={i}>{g}</li>)}
                    </ul>
                ) : (
                    <p className="text-stone-500 italic text-sm">No goals shared.</p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
