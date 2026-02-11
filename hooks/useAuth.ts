
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
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error);
    }
    
    if (data) {
      setProfile({
        id: data.id,
        email: email,
        full_name: data.full_name,
        avatar_url: data.avatar_url
      });
    } else {
        // Fallback if profile row doesn't exist yet
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

  const updateProfile = async (fullName: string, avatarUrl: string) => {
    if (!supabase || !user) return;
    
    const updates = {
      id: user.id,
      full_name: fullName,
      avatar_url: avatarUrl,
      updated_at: new Date(),
    };

    const { error } = await supabase.from('profiles').upsert(updates);
    if (error) throw error;

    // Update local state immediately
    setProfile(prev => prev ? { ...prev, full_name: fullName, avatar_url: avatarUrl } : null);
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
