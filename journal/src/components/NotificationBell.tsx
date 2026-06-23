import React, { useEffect, useState, useRef } from 'react';
import { Bell } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select(`
          id, type, referenced_log_id, read_status, created_at, sender_id,
          sender:profiles!sender_id(first_name, last_name, avatar_url)
        `)
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (data) setNotifications(data);
    };

    fetchNotifications();

    const channel = supabase.channel('notifications_channel')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `receiver_id=eq.${user.id}`
      }, (payload) => {
        // Fetch the sender's details for this new notification
        const fetchNewNotif = async () => {
            const { data } = await supabase
                .from('notifications')
                .select(`
                id, type, referenced_log_id, read_status, created_at, sender_id,
                sender:profiles!sender_id(first_name, last_name, avatar_url)
                `)
                .eq('id', payload.new.id)
                .maybeSingle();
            if (data) {
                setNotifications(prev => [data, ...prev]);
            }
        };
        fetchNewNotif();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read_status).length;

  const handleNotificationClick = async (notification: any) => {
    setIsOpen(false);
    if (!notification.read_status) {
      await supabase.from('notifications').update({ read_status: true }).eq('id', notification.id);
      setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read_status: true } : n));
    }
    
    if (notification.type === 'new_entry') {
        navigate(`/friend/${notification.sender_id}/day/${notification.referenced_log_id}`);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-stone-500 hover:bg-stone-100 rounded-lg transition-colors"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-stone-200 overflow-hidden z-50">
          <div className="p-4 border-b border-stone-100 bg-stone-50">
            <h3 className="font-serif font-bold text-stone-900">Notifications</h3>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-stone-500">
                <p>No notifications yet.</p>
              </div>
            ) : (
              notifications.map(notif => (
                <button
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`w-full text-left p-4 flex gap-4 transition-colors hover:bg-stone-50 border-b border-stone-100 last:border-0 ${!notif.read_status ? 'bg-sage-green/5' : ''}`}
                >
                  <div className="w-10 h-10 rounded-full bg-stone-200 overflow-hidden flex-shrink-0">
                    {notif.sender?.avatar_url ? (
                        <img src={notif.sender.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-500 font-bold">
                            {notif.sender?.first_name?.charAt(0)}
                        </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-stone-800 leading-tight">
                        <span className="font-bold">{notif.sender?.first_name} {notif.sender?.last_name}</span> 
                        {notif.type === 'new_entry' ? ' just completed their daily journal!' : ' sent you a notification.'}
                    </p>
                    <p className="text-xs text-stone-400 mt-1">
                      {new Date(notif.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {!notif.read_status && (
                    <div className="w-2 h-2 rounded-full bg-sage-green mt-1.5 flex-shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
