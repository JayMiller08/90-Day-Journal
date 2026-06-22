import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Camera, Check, Loader2, Edit3, X } from 'lucide-react';

export const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  const [profile, setProfile] = useState({
    username: '',
    firstName: '',
    lastName: '',
    bio: '',
    avatarUrl: '',
    createdAt: ''
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      if (data) {
        setProfile({
          username: data.username || '',
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          bio: data.bio || '',
          avatarUrl: data.avatar_url || '',
          createdAt: data.created_at || ''
        });
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      first_name: profile.firstName,
      last_name: profile.lastName,
      bio: profile.bio,
      avatar_url: profile.avatarUrl
    }).eq('id', user.id);
    
    setSaving(false);
    if (!error) {
      setIsEditing(false); // return to view mode
      setToast('Profile updated successfully!');
      setTimeout(() => setToast(''), 3000);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user?.id}-${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      setProfile(p => ({ ...p, avatarUrl: data.publicUrl }));
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-[50vh]"><Loader2 className="animate-spin text-stone-400" size={32} /></div>;

  const joinDate = profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '';

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 animate-fade-in relative">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 bg-stone-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-fade-in z-50">
          <Check size={18} className="text-sage-green" />
          <span className="font-medium">{toast}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm">
        
        {/* Banner */}
        <div className="h-48 bg-gradient-to-r from-[#6b7c6b] to-[#8fa18f] relative">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
        </div>

        {/* Profile Content */}
        <div className="px-6 sm:px-10 pb-10 relative">
          
          {/* Avatar & Actions Row */}
          <div className="flex justify-between items-end -mt-16 sm:-mt-20 mb-6">
            <div className="relative group">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-white p-1.5 shadow-lg relative">
                <div className="w-full h-full rounded-full bg-stone-100 overflow-hidden flex items-center justify-center relative">
                  {profile.avatarUrl ? (
                    <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-bold text-stone-400">
                      {profile.firstName?.charAt(0)}{profile.lastName?.charAt(0)}
                    </span>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <Loader2 className="animate-spin text-stone-900" size={24} />
                    </div>
                  )}
                </div>
              </div>
              {isEditing && (
                <>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-2 right-2 bg-stone-900 text-white p-3 rounded-full shadow-lg hover:bg-stone-800 transition-colors z-10"
                  >
                    <Camera size={18} />
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </>
              )}
            </div>

            <div className="pb-4">
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="bg-white border-2 border-stone-200 text-stone-900 px-6 py-2.5 rounded-full font-bold hover:bg-stone-50 transition-colors flex items-center gap-2"
                >
                  <Edit3 size={18} />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>

          {/* View Mode OR Edit Mode */}
          {!isEditing ? (
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-serif font-bold text-stone-900 leading-tight">
                  {profile.firstName} {profile.lastName}
                </h1>
                <p className="text-stone-500 font-medium">@{profile.username}</p>
              </div>
              
              <div className="pt-2">
                <p className="text-stone-800 text-lg leading-relaxed whitespace-pre-wrap">
                  {profile.bio || "No bio added yet. Tell people about your 90-day mission."}
                </p>
              </div>

              <div className="pt-4 flex items-center gap-6 text-sm text-stone-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sage-green-dark"></span>
                  Joined {joinDate}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 pt-4 animate-fade-in border-t border-stone-100">
              <h2 className="text-xl font-serif font-bold text-stone-900 mb-4">Edit Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">First Name</label>
                  <input 
                    type="text" 
                    value={profile.firstName} 
                    onChange={e => setProfile(p => ({...p, firstName: e.target.value}))}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Last Name</label>
                  <input 
                    type="text" 
                    value={profile.lastName} 
                    onChange={e => setProfile(p => ({...p, lastName: e.target.value}))}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900 outline-none" 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Bio <span className="text-stone-400 font-normal ml-1">({profile.bio.length}/150)</span>
                </label>
                <textarea 
                  value={profile.bio} 
                  onChange={e => setProfile(p => ({...p, bio: e.target.value.slice(0, 150)}))}
                  placeholder="A brief description of who you are and your 90-day mission."
                  className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900 outline-none resize-none h-32" 
                />
              </div>

              <div className="pt-6 flex justify-end gap-3">
                <button 
                  onClick={() => setIsEditing(false)}
                  disabled={saving || uploading}
                  className="bg-white border border-stone-200 text-stone-600 px-6 py-3 rounded-xl font-medium hover:bg-stone-50 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <X size={18} /> Cancel
                </button>
                <button 
                  onClick={handleSave} 
                  disabled={saving || uploading}
                  className="bg-stone-900 text-white px-8 py-3 rounded-xl font-medium hover:bg-stone-800 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-stone-900/20"
                >
                  {saving ? <><Loader2 className="animate-spin" size={18} /> Saving...</> : <><Check size={18} /> Save Changes</>}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
