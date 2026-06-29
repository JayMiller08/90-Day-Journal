/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Search, UserPlus, UserCheck, UserX, Clock } from 'lucide-react';

type Profile = { id: string; username: string; first_name: string; last_name: string; avatar_url: string };

export const Network = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'friends' | 'pending' | 'add'>('friends');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  
  const [friends, setFriends] = useState<any[]>([]);
  const [pendingRequestsIn, setPendingRequestsIn] = useState<any[]>([]);
  const [pendingRequestsOut, setPendingRequestsOut] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const fetchNetwork = async () => {
    if (!user) return;
    setIsLoading(true);

    // Fetch accepted friendships
    const { data: acceptedData } = await supabase
      .from('friendships')
      .select('*, requester:requester_id(id, username, first_name, last_name, avatar_url), receiver:receiver_id(id, username, first_name, last_name, avatar_url)')
      .eq('status', 'accepted')
      .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`);

    if (acceptedData) {
        const formattedFriends = acceptedData.map(f => {
            const isRequester = f.requester_id === user.id;
            return {
                id: f.id,
                friend: isRequester ? f.receiver : f.requester
            };
        });
        setFriends(formattedFriends);
    }

    // Fetch incoming pending requests
    const { data: pendingInData } = await supabase
      .from('friendships')
      .select('*, requester:requester_id(id, username, first_name, last_name, avatar_url)')
      .eq('status', 'pending')
      .eq('receiver_id', user.id);

    if (pendingInData) setPendingRequestsIn(pendingInData);

    // Fetch outgoing pending requests (to disable "Add Friend" buttons)
    const { data: pendingOutData } = await supabase
      .from('friendships')
      .select('receiver_id')
      .eq('status', 'pending')
      .eq('requester_id', user.id);
      
    if (pendingOutData) {
      setPendingRequestsOut(new Set(pendingOutData.map(r => r.receiver_id)));
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchNetwork();
    
    // Realtime subscription
    const channel = supabase.channel('friendships_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'friendships' }, () => {
         fetchNetwork();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch search or suggested
  useEffect(() => {
    const fetchSearch = async () => {
      if (!user) return;
      setIsLoading(true);
      
      if (!debouncedSearch.trim()) {
        // Suggested profiles
        const { data } = await supabase
          .from('profiles')
          .select('id, username, first_name, last_name, avatar_url')
          .neq('id', user.id)
          .limit(20);
        if (data) setSearchResults(data);
      } else {
        // Search
        const { data } = await supabase
          .from('profiles')
          .select('id, username, first_name, last_name, avatar_url')
          .ilike('username', `%${debouncedSearch}%`)
          .neq('id', user.id)
          .limit(10);
        setSearchResults(data || []);
      }
      setIsLoading(false);
    };
    
    if (activeTab === 'add') {
      fetchSearch();
    }
  }, [debouncedSearch, activeTab, user]);

  const sendRequest = async (receiverId: string) => {
      if (!user) return;
      // Optimistic update for outbound request
      setPendingRequestsOut(prev => {
        const next = new Set(prev);
        next.add(receiverId);
        return next;
      });
      await supabase.from('friendships').insert([{ requester_id: user.id, receiver_id: receiverId, status: 'pending' }]);
  };

  const acceptRequest = async (id: string) => {
      await supabase.from('friendships').update({ status: 'accepted' }).eq('id', id);
  };

  const declineRequest = async (id: string) => {
      await supabase.from('friendships').update({ status: 'declined' }).eq('id', id);
  };

  const renderAvatar = (p: any) => {
    if (p.avatar_url) {
      return <img src={p.avatar_url} alt="Avatar" className="w-12 h-12 rounded-full object-cover border border-stone-200" />;
    }
    return (
      <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center text-stone-500 font-bold border border-stone-200">
        {p.first_name?.charAt(0) || p.username?.charAt(0)}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fade-in">
      <h1 className="text-3xl font-serif font-bold text-stone-900 mb-8">Network</h1>
      
      <div className="flex space-x-4 mb-8 border-b border-stone-200">
        {(['friends', 'pending', 'add'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 px-1 text-sm font-medium capitalize border-b-2 transition-colors ${
              activeTab === tab ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-500 hover:text-stone-700'
            }`}
          >
            {tab === 'add' ? 'Find Friends' : tab}
            {tab === 'pending' && pendingRequestsIn.length > 0 && (
              <span className="ml-2 bg-sage-green-dark text-white text-xs px-2 py-0.5 rounded-full">{pendingRequestsIn.length}</span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {activeTab === 'friends' && (
          <div className="animate-fade-in">
            {friends.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-2xl border border-stone-100 shadow-sm">
                  <p className="text-stone-500 mb-4">No friends yet. Head to "Find Friends" to connect!</p>
                  <button onClick={() => setActiveTab('add')} className="px-6 py-2 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition-colors">Find Friends</button>
                </div>
            ) : (
                <ul className="space-y-4">
                    {friends.map(f => (
                        <li key={f.id} className="flex items-center justify-between p-4 bg-white border border-stone-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                            <Link to={`/friend/${f.friend.id}`} className="flex items-center gap-4 flex-1 group">
                                {renderAvatar(f.friend)}
                                <div>
                                    <p className="font-bold text-stone-900 group-hover:text-sage-green-dark transition-colors">{f.friend.first_name} {f.friend.last_name}</p>
                                    <p className="text-sm text-stone-500">@{f.friend.username}</p>
                                </div>
                            </Link>
                            <UserCheck className="text-sage-green-dark" size={20} />
                        </li>
                    ))}
                </ul>
            )}
          </div>
        )}

        {activeTab === 'pending' && (
          <div className="animate-fade-in">
            {pendingRequestsIn.length === 0 ? (
                <p className="text-stone-500">No pending requests.</p>
            ) : (
                <ul className="space-y-4">
                    {pendingRequestsIn.map(req => (
                        <li key={req.id} className="flex items-center justify-between p-4 bg-white border border-stone-200 rounded-xl shadow-sm">
                            <Link to={`/friend/${req.requester.id}`} className="flex items-center gap-4 flex-1 group">
                                {renderAvatar(req.requester)}
                                <div>
                                    <p className="font-bold text-stone-900 group-hover:text-sage-green-dark transition-colors">{req.requester.first_name} {req.requester.last_name}</p>
                                    <p className="text-sm text-stone-500">@{req.requester.username}</p>
                                </div>
                            </Link>
                            <div className="flex gap-2">
                                <button onClick={() => acceptRequest(req.id)} className="p-2.5 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors shadow-lg shadow-stone-900/20" title="Accept"><UserCheck size={18} /></button>
                                <button onClick={() => declineRequest(req.id)} className="p-2.5 bg-red-50 border border-red-100 text-red-600 rounded-lg hover:bg-red-100 transition-colors" title="Decline"><UserX size={18} /></button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
          </div>
        )}

        {activeTab === 'add' && (
          <div className="animate-fade-in">
            <div className="relative mb-6">
                <Search className="absolute left-4 top-3.5 text-stone-400" size={20} />
                <input
                    type="text"
                    placeholder="Search by username..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-3 pl-12 border border-stone-200 bg-white rounded-xl focus:ring-2 focus:ring-stone-900 outline-none shadow-sm transition-shadow"
                />
            </div>
            
            {!debouncedSearch && <h2 className="text-sm uppercase tracking-wider font-semibold text-stone-400 mb-4 px-2">Suggested for you</h2>}
            
            {isLoading ? (
              <div className="text-center py-8 text-stone-400 animate-pulse">Loading profiles...</div>
            ) : searchResults.length > 0 ? (
                <ul className="space-y-4">
                    {searchResults.map(profile => {
                      const isPending = pendingRequestsOut.has(profile.id);
                      const isFriend = friends.some(f => f.friend.id === profile.id);
                      
                      return (
                        <li key={profile.id} className="flex items-center justify-between p-4 bg-white border border-stone-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                            <Link to={`/friend/${profile.id}`} className="flex items-center gap-4 flex-1 group">
                                {renderAvatar(profile)}
                                <div>
                                    <p className="font-bold text-stone-900 group-hover:text-sage-green-dark transition-colors">{profile.first_name} {profile.last_name}</p>
                                    <p className="text-sm text-stone-500">@{profile.username}</p>
                                </div>
                            </Link>
                            
                            {isFriend ? (
                              <button disabled className="flex items-center gap-2 text-sage-green-dark bg-sage-green/10 px-4 py-2 rounded-lg font-medium">
                                  <UserCheck size={18} /> Friends
                              </button>
                            ) : isPending ? (
                              <button disabled className="flex items-center gap-2 text-stone-500 bg-stone-100 px-4 py-2 rounded-lg font-medium">
                                  <Clock size={18} /> Pending
                              </button>
                            ) : (
                              <button onClick={() => sendRequest(profile.id)} className="flex items-center gap-2 text-stone-700 bg-stone-50 border border-stone-200 px-4 py-2 rounded-lg hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-colors font-medium">
                                  <UserPlus size={18} /> Add
                              </button>
                            )}
                        </li>
                      );
                    })}
                </ul>
            ) : (
              <p className="text-stone-500 text-center py-8">No users found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
