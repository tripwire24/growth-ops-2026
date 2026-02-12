
import { useState, useEffect, useCallback } from 'react';
import { Experiment, ExperimentStatus, Comment, Board, UserProfile } from '../types';
import { INITIAL_EXPERIMENTS, INITIAL_BOARDS } from '../services/mockData';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { useAuth } from './useAuth';

export function useExperiments(isDemoMode: boolean = false, userProfile: UserProfile | null = null) {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); // Still need auth user for ID in real mode

  // Fetch Data (Boards & Experiments)
  const fetchData = useCallback(async () => {
    if (isDemoMode || !isSupabaseConfigured || !supabase) {
      // MOCK DATA
      setBoards(INITIAL_BOARDS);
      
      const enrichedExperiments = INITIAL_EXPERIMENTS.map(exp => ({
        ...exp,
        boardName: INITIAL_BOARDS.find(b => b.id === exp.board_id)?.name || 'Unknown Board'
      }));
      setExperiments(enrichedExperiments);
      
      setLoading(false);
      return;
    }

    try {
      setBoards(INITIAL_BOARDS);

      // Fetch Experiments with real owner names
      const { data, error } = await supabase
        .from('experiments')
        .select(`
          *,
          owner:profiles(full_name),
          comments(
            *,
            profile:profiles(full_name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData: Experiment[] = data.map((exp: any) => ({
        ...exp,
        owner: exp.owner?.full_name || 'Unknown',
        boardName: INITIAL_BOARDS.find(b => b.id === exp.board_id)?.name || 'General',
        comments: exp.comments.map((c: any) => ({
            ...c,
            // Use joined profile name for comments
            userName: c.profile?.full_name || 'Teammate', 
            timestamp: c.created_at,
            userId: c.user_id
        })).sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      }));

      setExperiments(formattedData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setExperiments(INITIAL_EXPERIMENTS);
      setBoards(INITIAL_BOARDS);
    } finally {
      setLoading(false);
    }
  }, [isDemoMode]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Experiment Actions ---

  const updateStatus = useCallback(async (id: string, newStatus: ExperimentStatus) => {
    setExperiments(prev => prev.map(exp => 
      exp.id === id ? { ...exp, status: newStatus } : exp
    ));

    if (!isDemoMode && isSupabaseConfigured && supabase) {
        await supabase.from('experiments').update({ status: newStatus }).eq('id', id);
    }
  }, [isDemoMode]);

  const updateExperiment = useCallback(async (updatedExp: Experiment) => {
    setExperiments(prev => prev.map(exp => 
      exp.id === updatedExp.id ? updatedExp : exp
    ));

    if (!isDemoMode && isSupabaseConfigured && supabase) {
        const { owner, comments, boardName, ...dbPayload } = updatedExp;
        await supabase.from('experiments').update(dbPayload).eq('id', updatedExp.id);
    }
  }, [isDemoMode]);

  const archiveExperiment = useCallback(async (id: string) => {
    setExperiments(prev => prev.map(exp => 
      exp.id === id ? { ...exp, status: 'learnings', archived: true } : exp
    ));
    if (!isDemoMode && isSupabaseConfigured && supabase) {
        await supabase.from('experiments').update({ status: 'learnings', archived: true }).eq('id', id);
    }
  }, [isDemoMode]);

  const deleteExperiment = useCallback(async (id: string) => {
    setExperiments(prev => prev.filter(exp => exp.id !== id));
    if (!isDemoMode && isSupabaseConfigured && supabase) {
      await supabase.from('experiments').delete().eq('id', id);
    }
  }, [isDemoMode]);

  const completeExperiment = useCallback(async (id: string) => {
    setExperiments(prev => prev.map(exp => 
        exp.id === id ? { ...exp, status: 'learnings', archived: true, locked: true } : exp
    ));
    if (!isDemoMode && isSupabaseConfigured && supabase) {
        await supabase.from('experiments').update({ status: 'learnings', archived: true, locked: true }).eq('id', id);
    }
  }, [isDemoMode]);

  const addExperiment = useCallback(async (experiment: Omit<Experiment, 'id' | 'created_at' | 'archived' | 'result' | 'owner' | 'comments' | 'locked' | 'boardName'>) => {
    const tempId = Math.random().toString(36).substr(2, 9);
    const boardName = boards.find(b => b.id === experiment.board_id)?.name;
    
    // Use Passed Profile Name if available, otherwise User Email, otherwise 'Me'
    const ownerName = userProfile?.full_name || user?.email || 'Me';

    const newExp: Experiment = {
      ...experiment,
      id: tempId,
      created_at: new Date().toISOString(),
      archived: false,
      locked: false,
      result: null,
      owner: ownerName, 
      comments: [],
      boardName
    };

    setExperiments(prev => [newExp, ...prev]);

    if (!isDemoMode && isSupabaseConfigured && supabase && user) {
        const { data, error } = await supabase.from('experiments').insert([{
            ...experiment,
            owner_id: user.id,
            status: 'idea',
            archived: false,
            locked: false
        }]).select();
        
        if(!error && data) {
            fetchData(); // Refetch to get server-generated timestamps/ids
        }
    }
  }, [user, userProfile, fetchData, isDemoMode, boards]);

  const addComment = useCallback(async (experimentId: string, text: string) => {
    const userName = userProfile?.full_name || user?.email || 'Me';

    const newComment: Comment = {
      id: Math.random().toString(36),
      userId: user?.id || 'temp',
      userName: userName,
      text,
      timestamp: new Date().toISOString()
    };

    setExperiments(prev => prev.map(exp => {
      if (exp.id === experimentId) {
        return { ...exp, comments: [...exp.comments, newComment] };
      }
      return exp;
    }));

    if (!isDemoMode && isSupabaseConfigured && supabase && user) {
        await supabase.from('comments').insert({
            experiment_id: experimentId,
            user_id: user.id,
            text: text
        });
    }
  }, [user, userProfile, isDemoMode]);

  // --- Board Actions ---

  const addBoard = useCallback((name: string, description: string) => {
    const newBoard: Board = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      description,
      created_at: new Date().toISOString()
    };
    setBoards(prev => [...prev, newBoard]);
    return newBoard.id; 
  }, []);

  const updateBoard = useCallback((id: string, name: string, description: string) => {
    setBoards(prev => prev.map(b => b.id === id ? { ...b, name, description } : b));
  }, []);

  return {
    experiments,
    boards,
    isLoading: loading,
    updateStatus,
    updateExperiment,
    archiveExperiment,
    deleteExperiment,
    completeExperiment,
    addExperiment,
    addComment,
    addBoard,
    updateBoard
  };
}
