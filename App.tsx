
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { KanbanBoard } from './components/KanbanBoard';
import { VaultTable } from './components/VaultTable';
import { AnalyticsView } from './components/AnalyticsView';
import { ExperimentModal } from './components/ExperimentModal';
import { AuthPage } from './components/AuthPage';
import { useExperiments } from './hooks/useExperiments';
import { useAuth } from './hooks/useAuth';
import { isSupabaseConfigured } from './services/supabase';
import { Experiment, Board } from './types';

export default function App() {
  const { user, profile, loading: authLoading, updateProfile, signOut } = useAuth();
  const { experiments, boards, updateStatus, updateExperiment, addExperiment, archiveExperiment, completeExperiment, deleteExperiment, addBoard, updateBoard } = useExperiments();
  
  const [activeTab, setActiveTab] = useState<'kanban' | 'vault' | 'analytics'>('kanban');
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingSetup, setViewingSetup] = useState(false);

  // Board State
  const [activeBoardId, setActiveBoardId] = useState<string>('');

  useEffect(() => {
    if (boards.length > 0 && !activeBoardId) {
        setActiveBoardId(boards[0].id);
    }
  }, [boards, activeBoardId]);

  // 1. Loading State
  if (isSupabaseConfigured && authLoading) {
      return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white gap-4">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="animate-pulse">Loading Growth Ops...</p>
        </div>
      );
  }

  // 2. Auth Enforced (Only if configured and not loading)
  if (isSupabaseConfigured && !user) {
    return <AuthPage />;
  }

  // 3. Setup/Connect Screen (Triggered manually from Mock Mode)
  if (!isSupabaseConfigured && viewingSetup) {
    return <AuthPage onBackToDemo={() => setViewingSetup(false)} />;
  }

  const handleNewExperiment = () => {
    // In a real app, this would open a modal with empty fields
    // For now, we'll auto-populate a template to speed up testing
    const title = prompt("Enter experiment title:");
    if (!title) return;
    
    if (!activeBoardId) {
        alert("Please create or select a board first.");
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
      tags: []
    });
  };

  const openExperiment = (exp: Experiment) => {
    setSelectedExperiment(exp);
    setIsModalOpen(true);
  };

  // Simple handlers for Layout requirements in this simplified App.tsx
  const handleCreateBoard = () => {
    const name = prompt("Enter Board Name:");
    if (name) addBoard(name, "New Board");
  };

  const handleEditBoard = (board: Board) => {
    const name = prompt("Update Board Name:", board.name);
    if (name) updateBoard(board.id, name, board.description);
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      onNewExperiment={handleNewExperiment}
      isMockMode={!isSupabaseConfigured}
      onConnect={() => setViewingSetup(true)}
      // Board Props
      boards={boards}
      activeBoardId={activeBoardId}
      onSwitchBoard={setActiveBoardId}
      onCreateBoard={handleCreateBoard}
      onEditBoard={handleEditBoard}
      // Profile Props
      userProfile={profile}
      onUpdateProfile={updateProfile}
      onLogout={signOut}
    >
      {activeTab === 'kanban' && (
        <KanbanBoard 
          experiments={experiments.filter(e => e.board_id === activeBoardId)} 
          onStatusUpdate={updateStatus}
          onCardClick={openExperiment}
          onArchive={archiveExperiment}
        />
      )}
      
      {activeTab === 'vault' && (
        <div className="p-6 h-full overflow-hidden">
          <VaultTable 
            experiments={experiments.filter(e => e.board_id === activeBoardId)} 
            onEdit={openExperiment}
            onDelete={deleteExperiment}
          />
        </div>
      )}

      {activeTab === 'analytics' && (
        <AnalyticsView experiments={experiments.filter(e => e.board_id === activeBoardId)} />
      )}

      <ExperimentModal 
        experiment={selectedExperiment}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={updateExperiment}
        onArchive={archiveExperiment}
        onComplete={completeExperiment}
        onDelete={deleteExperiment}
      />
    </Layout>
  );
}
