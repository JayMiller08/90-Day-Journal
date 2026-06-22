/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Search, UserPlus, UserCheck, UserX } from 'lucide-react';

type Profile = { id: string; username: string; first_name: string; last_name: string };


export const Network = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'friends' | 'pending' | 'add'>('friends');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNetwork = async () => {
    if (!user) return;
    setIsLoading(true);

    // Fetch accepted friendships
    const { data: acceptedData } = await supabase
      .from('friendships')
      .select('*, requester:requester_id(id, username, first_name, last_name), receiver:receiver_id(id, username, first_name, last_name)')
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

    // Fetch pending requests where user is receiver
    const { data: pendingData } = await supabase
      .from('friendships')
      .select('*, requester:requester_id(id, username, first_name, last_name)')
      .eq('status', 'pending')
      .eq('receiver_id', user.id);

    if (pendingData) setPendingRequests(pendingData);

    setIsLoading(false);
  };

  useEffect(() => {
    fetchNetwork();
  }, [user]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !user) return;
    setIsLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('id, username, first_name, last_name')
      .ilike('username', `%${searchQuery}%`)
      .neq('id', user.id)
      .limit(10);
    setSearchResults(data || []);
    setIsLoading(false);
  };

  const sendRequest = async (receiverId: string) => {
      if (!user) return;
      await supabase.from('friendships').insert([{ requester_id: user.id, receiver_id: receiverId, status: 'pending' }]);
      alert('Request sent!');
      setSearchQuery('');
      setSearchResults([]);
  };

  const acceptRequest = async (id: string) => {
      await supabase.from('friendships').update({ status: 'accepted' }).eq('id', id);
      fetchNetwork();
  };

  const declineRequest = async (id: string) => {
      await supabase.from('friendships').update({ status: 'declined' }).eq('id', id);
      fetchNetwork();
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
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
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {activeTab === 'friends' && (
          <div>
            {friends.length === 0 ? (
                <p className="text-stone-500">No friends yet. Head to "Find Friends" to connect!</p>
            ) : (
                <ul className="space-y-4">
                    {friends.map(f => (
                        <li key={f.id} className="flex items-center justify-between p-4 bg-white border border-stone-200 rounded-xl shadow-sm">
                            <div>
                                <p className="font-bold text-stone-900">{f.friend.first_name} {f.friend.last_name}</p>
                                <p className="text-sm text-stone-500">@{f.friend.username}</p>
                            </div>
                            <UserCheck className="text-green-600" size={20} />
                        </li>
                    ))}
                </ul>
            )}
          </div>
        )}

        {activeTab === 'pending' && (
          <div>
            {pendingRequests.length === 0 ? (
                <p className="text-stone-500">No pending requests.</p>
            ) : (
                <ul className="space-y-4">
                    {pendingRequests.map(req => (
                        <li key={req.id} className="flex items-center justify-between p-4 bg-white border border-stone-200 rounded-xl shadow-sm">
                            <div>
                                <p className="font-bold text-stone-900">{req.requester.first_name} {req.requester.last_name}</p>
                                <p className="text-sm text-stone-500">@{req.requester.username}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => acceptRequest(req.id)} className="p-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800"><UserCheck size={18} /></button>
                                <button onClick={() => declineRequest(req.id)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"><UserX size={18} /></button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
          </div>
        )}

        {activeTab === 'add' && (
          <div>
            <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                <input
                    type="text"
                    placeholder="Search by username..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 p-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-stone-900 outline-none"
                />
                <button type="submit" disabled={isLoading} className="bg-stone-900 text-white px-6 py-3 rounded-lg flex items-center gap-2">
                    <Search size={18} /> Search
                </button>
            </form>
            {searchResults.length > 0 && (
                <ul className="space-y-4">
                    {searchResults.map(profile => (
                        <li key={profile.id} className="flex items-center justify-between p-4 bg-white border border-stone-200 rounded-xl shadow-sm">
                            <div>
                                <p className="font-bold text-stone-900">{profile.first_name} {profile.last_name}</p>
                                <p className="text-sm text-stone-500">@{profile.username}</p>
                            </div>
                            <button onClick={() => sendRequest(profile.id)} className="flex items-center gap-2 text-stone-700 bg-stone-100 px-4 py-2 rounded-lg hover:bg-stone-200">
                                <UserPlus size={18} /> Add
                            </button>
                        </li>
                    ))}
                </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
