
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types';
import { X, User, Camera, Upload, Linkedin, Mail, AlignLeft } from 'lucide-react';
import { CustomAlert } from './CustomAlert';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  onSave: (updates: Partial<UserProfile>, avatarFile?: File) => Promise<void>;
  onLogout: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, profile, onSave, onLogout }) => {
  // State
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [avatarFile, setAvatarFile] = useState<File | undefined>(undefined);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  // Alert State
  const [alertConfig, setAlertConfig] = useState<{isOpen: boolean, title: string, message: string, type: 'error' | 'success'}>({
    isOpen: false, title: '', message: '', type: 'success'
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile && isOpen) {
      setFormData({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        linkedin_url: profile.linkedin_url || '',
        contact_email: profile.contact_email || profile.email || '',
      });
      setPreviewUrl(profile.avatar_url || '');
      setAvatarFile(undefined);
    }
  }, [profile, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      // Create a preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData, avatarFile);
      setAlertConfig({
        isOpen: true,
        title: 'Profile Updated',
        message: 'Your profile details have been saved successfully.',
        type: 'success'
      });
      // Don't close immediately, let user see success
    } catch (error: any) {
      console.error("Profile update failed:", error);
      
      let friendlyMessage = error.message;
      
      if (error.message.includes('schema cache') || error.message.includes('relation "public.profiles" does not exist')) {
        friendlyMessage = "Database Setup Required: The 'profiles' table is missing. Please run the SQL migration script in your Supabase SQL Editor.";
      }

      setAlertConfig({
        isOpen: true,
        title: 'Update Failed',
        message: friendlyMessage,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const closeAlert = () => {
    setAlertConfig(prev => ({ ...prev, isOpen: false }));
    if (alertConfig.type === 'success') {
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
             <h3 className="font-bold text-slate-800 dark:text-white">Profile Settings</h3>
             <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
               <X size={20} />
             </button>
          </div>
          
          <div className="overflow-y-auto flex-1 p-6">
            <form id="profile-form" onSubmit={handleSubmit} className="space-y-6">
               {/* Avatar Upload */}
               <div className="flex flex-col items-center gap-4">
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-24 h-24 rounded-full bg-indigo-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-800 shadow-lg relative">
                       {previewUrl ? (
                         <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
                       ) : (
                         <User size={48} className="text-indigo-400 dark:text-slate-500" />
                       )}
                       
                       {/* Overlay */}
                       <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera size={24} className="text-white" />
                       </div>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleFileChange} 
                    />
                    <div className="absolute bottom-0 right-0 bg-indigo-600 text-white p-1.5 rounded-full shadow-sm border-2 border-white dark:border-slate-900">
                      <Upload size={12} />
                    </div>
                  </div>
                  <div className="text-center">
                     <p className="text-sm font-medium text-slate-900 dark:text-white">{profile?.email}</p>
                     <p className="text-xs text-slate-500">Tap image to change</p>
                  </div>
               </div>

               <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                         type="text" 
                         value={formData.full_name || ''}
                         onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                         className="w-full pl-9 pr-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                         placeholder="e.g. John Doe"
                      />
                    </div>
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Bio / Role</label>
                    <div className="relative">
                      <AlignLeft size={16} className="absolute left-3 top-3 text-slate-400" />
                      <textarea 
                         value={formData.bio || ''}
                         onChange={(e) => setFormData({...formData, bio: e.target.value})}
                         rows={3}
                         className="w-full pl-9 pr-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none"
                         placeholder="Tell us a bit about yourself..."
                      />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 gap-4">
                   <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contact Email</label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                           type="email" 
                           value={formData.contact_email || ''}
                           onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                           className="w-full pl-9 pr-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                           placeholder="contact@example.com"
                        />
                      </div>
                   </div>

                   <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">LinkedIn URL</label>
                      <div className="relative">
                        <Linkedin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                           type="url" 
                           value={formData.linkedin_url || ''}
                           onChange={(e) => setFormData({...formData, linkedin_url: e.target.value})}
                           className="w-full pl-9 pr-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                           placeholder="https://linkedin.com/in/..."
                        />
                      </div>
                   </div>
                 </div>
               </div>
            </form>
          </div>

          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-b-xl shrink-0 space-y-3">
             <button 
               type="submit"
               form="profile-form"
               disabled={loading}
               className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium shadow-sm transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
             >
               {loading ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span> : 'Save Changes'}
             </button>
             
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
      
      {/* Custom Styled Alert */}
      <CustomAlert 
        isOpen={alertConfig.isOpen}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={closeAlert}
      />
    </>
  );
};
