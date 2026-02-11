
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { KanbanBoard } from './components/KanbanBoard';
import { VaultTable } from './components/VaultTable';
import { AnalyticsView } from './components/AnalyticsView';
import { ExperimentModal } from './components/ExperimentModal';
import { BoardModal } from './components/BoardModal';
import { AuthPage } from './components/AuthPage';
import { useExperiments } from './hooks/useExperiments';
import { useAuth } from './hooks/useAuth';
import { isSupabaseConfigured } from './services/supabase';
import { Experiment, Board, UserProfile } from './types';

export default function GrowthApp() {
  const { user, profile: authProfile, loading: authLoading, updateProfile: updateAuthProfile, signOut } = useAuth();
  
  // State for Guest/Demo Mode
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [guestProfile, setGuestProfile] = useState<UserProfile>({
    id: 'guest',
    email: 'guest@demo.com',
    full_name: 'Guest User',
    avatar_url: ''
  });

  // Determine active profile (Auth or Guest)
  const activeProfile = isGuestMode ? guestProfile : authProfile;

  // Data Hook - Now accepts the active profile for attribution
  const { experiments, boards, updateStatus, updateExperiment, addExperiment, archiveExperiment, deleteExperiment, completeExperiment, addBoard, updateBoard } = useExperiments(isGuestMode, activeProfile);
  
  // UI State
  const [activeTab, setActiveTab] = useState<'kanban' | 'vault' | 'analytics'>('kanban');
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
  const [isExperimentModalOpen, setIsExperimentModalOpen] = useState(false);
  
  // Board State
  const [activeBoardId, setActiveBoardId] = useState<string>('');
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | undefined>(undefined);

  const [viewingSetup, setViewingSetup] = useState(false);

  // Initialize Active Board
  useEffect(() => {
    if (boards.length > 0 && !activeBoardId) {
        setActiveBoardId(boards[0].id);
    }
  }, [boards, activeBoardId]);

  // Debug log to confirm correct app is loaded
  useEffect(() => {
    console.log("Growth Ops PWA Loaded Successfully");
  }, []);

  // 1. Loading State
  if (isSupabaseConfigured && authLoading) {
      return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white gap-4">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="animate-pulse">Loading Growth Ops...</p>
        </div>
      );
  }

  // 2. Auth Enforced (Only if configured, not loading, and NOT in guest mode)
  if (isSupabaseConfigured && !user && !isGuestMode) {
    return <AuthPage onContinueAsGuest={() => setIsGuestMode(true)} />;
  }

  // 3. Setup/Connect Screen (Triggered manually from Mock Mode)
  if (!isSupabaseConfigured && viewingSetup) {
    return <AuthPage onBackToDemo={() => setViewingSetup(false)} />;
  }

  // --- Handlers ---

  const handleUpdateProfile = async (name: string, avatar: string) => {
    if (isGuestMode) {
      setGuestProfile(prev => ({ ...prev, full_name: name, avatar_url: avatar }));
    } else {
      await updateAuthProfile(name, avatar);
    }
  };

  const handleLogout = async () => {
    if (isGuestMode) {
      setIsGuestMode(false);
    } else {
      await signOut();
    }
  };

  const handleNewExperiment = () => {
    const title = prompt("Enter experiment title:");
    if (!title) return;
    
    if (!activeBoardId) {
        alert("Please create a board first.");
        return;
    }

    addExperiment({
      board_id: activeBoardId,
      title,
      description: 'Describe your hypothesis...',
      status: 'idea',
      ice_impact: 5,
      ice_confidence: 5,
      ice_ease: 5,
      market: 'US',
      type: 'Acquisition',
    });
  };

  const openExperiment = (exp: Experiment) => {
    setSelectedExperiment(exp);
    setIsExperimentModalOpen(true);
  };

  const handleCreateBoard = () => {
      setEditingBoard(undefined);
      setIsBoardModalOpen(true);
  };

  const handleEditBoard = (board: Board) => {
      setEditingBoard(board);
      setIsBoardModalOpen(true);
  };

  const handleSaveBoard = (name: string, description: string) => {
      if (editingBoard) {
          updateBoard(editingBoard.id, name, description);
      } else {
          const newId = addBoard(name, description);
          setActiveBoardId(newId);
      }
  };

  // Filter experiments for ALL views based on Board
  const boardExperiments = experiments.filter(e => e.board_id === activeBoardId);

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      onNewExperiment={handleNewExperiment}
      isMockMode={!isSupabaseConfigured || isGuestMode}
      onConnect={() => setViewingSetup(true)}
      // Board Props
      boards={boards}
      activeBoardId={activeBoardId}
      onSwitchBoard={setActiveBoardId}
      onCreateBoard={handleCreateBoard}
      onEditBoard={handleEditBoard}
      // Profile Props
      userProfile={activeProfile}
      onUpdateProfile={handleUpdateProfile}
      onLogout={handleLogout}
    >
      {activeTab === 'kanban' && (
        <KanbanBoard 
          experiments={boardExperiments} 
          onStatusUpdate={updateStatus}
          onCardClick={openExperiment}
          onArchive={archiveExperiment}
        />
      )}
      
      {activeTab === 'vault' && (
        <div className="p-6 h-full overflow-hidden">
          <VaultTable 
            experiments={boardExperiments} // PASSING FILTERED LIST
            onEdit={openExperiment}
            onDelete={deleteExperiment}
          />
        </div>
      )}

      {activeTab === 'analytics' && (
        <AnalyticsView experiments={boardExperiments} /> // PASSING FILTERED LIST
      )}

      {/* Modals */}
      <ExperimentModal 
        experiment={selectedExperiment}
        isOpen={isExperimentModalOpen}
        onClose={() => setIsExperimentModalOpen(false)}
        onSave={updateExperiment}
        onArchive={archiveExperiment}
        onComplete={completeExperiment}
        onDelete={deleteExperiment}
      />

      <BoardModal 
        isOpen={isBoardModalOpen}
        onClose={() => setIsBoardModalOpen(false)}
        onSave={handleSaveBoard}
        initialBoard={editingBoard}
      />
    </Layout>
  );
}
