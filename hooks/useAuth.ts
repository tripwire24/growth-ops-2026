
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { User } from '@supabase/supabase-js';
import { UserProfile } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string, email: string) => {
    if (!supabase) return;
    
    // Try to fetch profile
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
       // If the error is 'PGRST116' it means no rows returned, which is fine (new user).
       // If it is '42P01' (undefined_table) or schema cache error, we log it for the developer.
       if (error.code !== 'PGRST116') {
         console.error('Fetch Profile Error:', error);
       }
    }
    
    if (data) {
      setProfile({
        id: data.id,
        email: email,
        full_name: data.full_name,
        avatar_url: data.avatar_url,
        bio: data.bio,
        linkedin_url: data.linkedin_url,
        contact_email: data.contact_email
      });
    } else {
        // Fallback: If profile row doesn't exist, we create a temporary local profile object
        // This will be saved to DB on the first "Update Profile" action.
        setProfile({ id: userId, email });
    }
  };

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id, currentUser.email || '');
      }
      setLoading(false);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
          fetchProfile(currentUser.id, currentUser.email || '');
      } else {
          setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithMagicLink = async (email: string) => {
    if (!supabase) return;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) throw error;
  };

  const signInWithPassword = async (email: string, password: string) => {
    if (!supabase) return;
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    if (!supabase) return;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      }
    });
    if (error) throw error;
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
     if (!supabase || !user) return null;
     
     const fileExt = file.name.split('.').pop();
     const fileName = `${user.id}-${Math.random()}.${fileExt}`;
     const filePath = `${fileName}`;

     // 1. Upload
     const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

     if (uploadError) {
         console.warn("Avatar upload failed (Check bucket permissions):", uploadError);
         return null;
     }

     // 2. Get Public URL
     const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
     return data.publicUrl;
  };

  const updateProfile = async (updates: Partial<UserProfile>, avatarFile?: File) => {
    if (!supabase || !user) return;

    let newAvatarUrl = updates.avatar_url;

    // Handle File Upload if provided
    if (avatarFile) {
        const uploadedUrl = await uploadAvatar(avatarFile);
        if (uploadedUrl) {
            newAvatarUrl = uploadedUrl;
        }
    }
    
    // Explicitly construct the DB payload to control what is sent
    const dbUpdates = {
      id: user.id,
      updated_at: new Date().toISOString(),
      full_name: updates.full_name,
      avatar_url: newAvatarUrl,
      bio: updates.bio,
      linkedin_url: updates.linkedin_url,
      contact_email: updates.contact_email
    };

    // Use Upsert to handle both insert (new profile) and update (existing profile)
    const { error } = await supabase.from('profiles').upsert(dbUpdates);
    
    if (error) {
        // Log the full error to help debug SQL/Schema issues
        console.error("Supabase Upsert Error:", error);
        
        // Pass the error up so UI can display it
        throw new Error(error.message);
    }

    // Update local state immediately to reflect changes in UI
    setProfile(prev => prev ? { ...prev, ...updates, avatar_url: newAvatarUrl || prev.avatar_url } : null);
  };
  
  const signOut = async () => {
    await supabase?.auth.signOut();
    setProfile(null);
    setUser(null);
  };

  return { 
    user, 
    profile,
    loading, 
    signInWithMagicLink, 
    signInWithPassword, 
    signUp, 
    signOut,
    updateProfile
  };
}
