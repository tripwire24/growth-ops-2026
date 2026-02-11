
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { X, User, Camera } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  onSave: (fullName: string, avatarUrl: string) => Promise<void>;
  onLogout: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, profile, onSave, onLogout }) => {
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(fullName, avatarUrl);
      onClose();
    } catch (error) {
      console.error(error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-sm border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
           <h3 className="font-bold text-slate-800 dark:text-white">Profile Settings</h3>
           <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
             <X size={20} />
           </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
           <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-indigo-100 dark:border-slate-700">
                   {avatarUrl ? (
                     <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                   ) : (
                     <User size={40} className="text-indigo-400 dark:text-slate-500" />
                   )}
                </div>
              </div>
              <div className="text-center">
                 <p className="text-sm font-medium text-slate-900 dark:text-white">{profile?.email}</p>
                 <p className="text-xs text-slate-500">Member</p>
              </div>
           </div>

           <div className="space-y-4">
             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input 
                   type="text" 
                   value={fullName}
                   onChange={(e) => setFullName(e.target.value)}
                   className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                   placeholder="e.g. John Doe"
                />
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Avatar URL (Optional)</label>
                <input 
                   type="text" 
                   value={avatarUrl}
                   onChange={(e) => setAvatarUrl(e.target.value)}
                   className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-xs"
                   placeholder="https://..."
                />
             </div>
           </div>
           
           <div className="pt-2">
             <button 
               type="submit"
               disabled={loading}
               className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium shadow-sm transition-colors disabled:opacity-70"
             >
               {loading ? 'Saving...' : 'Save Changes'}
             </button>
           </div>
        </form>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-b-xl">
           <button 
             onClick={() => {
                if(confirm('Are you sure you want to log out?')) {
                   onLogout();
                   onClose();
                }
             }}
             className="w-full py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
           >
             Log Out
           </button>
        </div>
      </div>
    </div>
  );
};
