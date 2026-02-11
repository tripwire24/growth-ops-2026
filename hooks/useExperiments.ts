import { useState, useEffect, useCallback } from 'react';
import { Experiment, ExperimentStatus, Comment } from '../types';
import { INITIAL_EXPERIMENTS } from '../services/mockData';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { useAuth } from './useAuth';

export function useExperiments() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fetch Experiments
  const fetchExperiments = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setExperiments(INITIAL_EXPERIMENTS);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('experiments')
        .select(`
          *,
          owner:profiles(full_name),
          comments(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform Supabase data to our Frontend types
      const formattedData: Experiment[] = data.map((exp: any) => ({
        ...exp,
        // Map joined profile data to owner name string
        owner: exp.owner?.full_name || 'Unknown',
        comments: exp.comments.map((c: any) => ({
            ...c,
            // In a real app we'd fetch comment author name too
            userName: 'Teammate', 
            timestamp: c.created_at 
        }))
      }));

      setExperiments(formattedData);
    } catch (err) {
      console.error('Error fetching experiments:', err);
      // Fallback if DB fails or is empty
      setExperiments(INITIAL_EXPERIMENTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExperiments();
    
    // Optional: Realtime subscription could go here
    if (isSupabaseConfigured && supabase) {
        const subscription = supabase
            .channel('public:experiments')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'experiments' }, fetchExperiments)
            .subscribe();
            
        return () => {
            supabase.removeChannel(subscription);
        }
    }
  }, [fetchExperiments]);

  const updateStatus = useCallback(async (id: string, newStatus: ExperimentStatus) => {
    // Optimistic Update
    setExperiments(prev => prev.map(exp => 
      exp.id === id ? { ...exp, status: newStatus } : exp
    ));

    if (isSupabaseConfigured && supabase) {
        await supabase.from('experiments').update({ status: newStatus }).eq('id', id);
    }
  }, []);

  const updateExperiment = useCallback(async (updatedExp: Experiment) => {
    setExperiments(prev => prev.map(exp => 
      exp.id === updatedExp.id ? updatedExp : exp
    ));

    if (isSupabaseConfigured && supabase) {
        const { owner, comments, ...dbPayload } = updatedExp;
        await supabase.from('experiments').update(dbPayload).eq('id', updatedExp.id);
    }
  }, []);

  const archiveExperiment = useCallback(async (id: string) => {
    setExperiments(prev => prev.map(exp => 
      exp.id === id ? { ...exp, status: 'learnings', archived: true } : exp
    ));
    if (isSupabaseConfigured && supabase) {
        await supabase.from('experiments').update({ status: 'learnings', archived: true }).eq('id', id);
    }
  }, []);

  const completeExperiment = useCallback(async (id: string) => {
    setExperiments(prev => prev.map(exp => 
        exp.id === id ? { ...exp, status: 'learnings', archived: true, locked: true } : exp
    ));
    if (isSupabaseConfigured && supabase) {
        await supabase.from('experiments').update({ status: 'learnings', archived: true, locked: true }).eq('id', id);
    }
  }, []);

  const addExperiment = useCallback(async (experiment: Omit<Experiment, 'id' | 'created_at' | 'archived' | 'result' | 'owner' | 'comments' | 'tags' | 'locked'>) => {
    // Generate Temp ID for UI
    const tempId = Math.random().toString(36).substr(2, 9);
    
    const newExp: Experiment = {
      ...experiment,
      id: tempId,
      created_at: new Date().toISOString(),
      archived: false,
      locked: false,
      result: null,
      tags: [],
      owner: user?.email || 'Me', 
      comments: []
    };

    setExperiments(prev => [newExp, ...prev]);

    if (isSupabaseConfigured && supabase && user) {
        // Insert into DB
        const { data, error } = await supabase.from('experiments').insert([{
            ...experiment,
            owner_id: user.id, // Assuming profile exists
            status: 'idea',
            archived: false,
            locked: false
        }]).select();
        
        // If success, replace temp ID with real ID (requires refetch or logic)
        if(!error && data) {
            fetchExperiments();
        }
    }
  }, [user, fetchExperiments]);

  const addComment = useCallback(async (experimentId: string, text: string) => {
    // Optimistic
    const newComment: Comment = {
      id: Math.random().toString(36),
      userId: user?.id || 'temp',
      userName: 'Me',
      text,
      timestamp: new Date().toISOString()
    };

    setExperiments(prev => prev.map(exp => {
      if (exp.id === experimentId) {
        return { ...exp, comments: [...exp.comments, newComment] };
      }
      return exp;
    }));

    if (isSupabaseConfigured && supabase && user) {
        await supabase.from('comments').insert({
            experiment_id: experimentId,
            user_id: user.id,
            text: text
        });
    }
  }, [user]);

  return {
    experiments,
    isLoading: loading,
    updateStatus,
    updateExperiment,
    archiveExperiment,
    completeExperiment,
    addExperiment,
    addComment
  };
}