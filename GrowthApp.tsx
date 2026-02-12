
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { KanbanBoard } from './components/KanbanBoard';
import { VaultTable } from './components/VaultTable';
import { AnalyticsView } from './components/AnalyticsView';
import { AcademyView } from './components/AcademyView';
import { ExperimentModal } from './components/ExperimentModal';
import { BoardModal } from './components/BoardModal';
import { BoardSettingsModal } from './components/BoardSettingsModal';
import { AuthPage } from './components/AuthPage';
import { useExperiments } from './hooks/useExperiments';
import { useAuth } from './hooks/useAuth';
import { isSupabaseConfigured } from './services/supabase';
import { Experiment, Board, UserProfile, BoardConfig } from './types';
import { CustomAlert } from './components/CustomAlert';

export default function GrowthApp() {
  const { user, profile: authProfile, loading: authLoading, updateProfile: updateAuthProfile, signOut } = useAuth();
  
  // State for Guest/Demo Mode
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [guestProfile, setGuestProfile] = useState<UserProfile>({
    id: 'guest',
    email: 'guest@demo.com',
    full_name: 'Guest User',
    avatar_url: '',
    bio: 'Just passing through...',
    contact_email: '',
    linkedin_url: ''
  });

  // Determine active profile (Auth or Guest)
  const activeProfile = isGuestMode ? guestProfile : authProfile;

  // Data Hook
  const { experiments, boards, updateStatus, updateExperiment, addExperiment, archiveExperiment, deleteExperiment, completeExperiment, addBoard, updateBoard } = useExperiments(isGuestMode, activeProfile);
  
  // UI State
  const [activeTab, setActiveTab] = useState<'kanban' | 'vault' | 'analytics' | 'academy'>('kanban');
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
  const [isExperimentModalOpen, setIsExperimentModalOpen] = useState(false);
  
  // Board State
  const [activeBoardId, setActiveBoardId] = useState<string>('');
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const [isBoardSettingsOpen, setIsBoardSettingsOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | undefined>(undefined);

  const [viewingSetup, setViewingSetup] = useState(false);
  
  // Alert State
  const [alertConfig, setAlertConfig] = useState<{isOpen: boolean, title: string, message: string, type: 'error' | 'success' | 'info'}>({
    isOpen: false, title: '', message: '', type: 'info'
  });

  // Initialize Active Board
  useEffect(() => {
    if (boards.length > 0 && !activeBoardId) {
        setActiveBoardId(boards[0].id);
    }
  }, [boards, activeBoardId]);

  // Debug log
  useEffect(() => {
    console.log("Growth Ops PWA Loaded Successfully (V2)");
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

  // 2. Auth Enforced
  if (isSupabaseConfigured && !user && !isGuestMode) {
    return <AuthPage onContinueAsGuest={() => setIsGuestMode(true)} />;
  }

  // 3. Setup/Connect Screen
  if (!isSupabaseConfigured && viewingSetup) {
    return <AuthPage onBackToDemo={() => setViewingSetup(false)} />;
  }

  // --- Handlers ---

  const handleUpdateProfile = async (updates: Partial<UserProfile>, avatarFile?: File) => {
    if (isGuestMode) {
      let newAvatarUrl = updates.avatar_url || guestProfile.avatar_url;
      if (avatarFile) {
        const reader = new FileReader();
        newAvatarUrl = await new Promise((resolve) => {
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(avatarFile);
        });
      }
      setGuestProfile(prev => ({ ...prev, ...updates, avatar_url: newAvatarUrl }));
    } else {
      await updateAuthProfile(updates, avatarFile);
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
    if (!activeBoardId) {
        setAlertConfig({
            isOpen: true, 
            title: "No Board Selected", 
            message: "Please create or select a board first.", 
            type: 'error'
        });
        return;
    }

    const draftExperiment: Experiment = {
        id: 'new',
        board_id: activeBoardId,
        title: '',
        description: '',
        status: 'idea',
        ice_impact: 5,
        ice_confidence: 5,
        ice_ease: 5,
        market: 'US',
        type: 'Acquisition',
        tags: [],
        created_at: new Date().toISOString(),
        archived: false,
        locked: false,
        result: null,
        owner: activeProfile?.full_name || user?.email || 'Me',
        comments: [],
        boardName: boards.find(b => b.id === activeBoardId)?.name
    };

    setSelectedExperiment(draftExperiment);
    setIsExperimentModalOpen(true);
  };

  const handleSaveExperiment = async (exp: Experiment) => {
      if (exp.id === 'new') {
          if (!exp.title.trim()) {
              setAlertConfig({
                  isOpen: true,
                  title: "Title Required",
                  message: "Please enter a title for your experiment.",
                  type: 'error'
              });
              return;
          }

          await addExperiment({
              board_id: exp.board_id,
              title: exp.title,
              description: exp.description || '',
              status: exp.status,
              ice_impact: exp.ice_impact,
              ice_confidence: exp.ice_confidence,
              ice_ease: exp.ice_ease,
              market: exp.market,
              type: exp.type,
              tags: exp.tags,
              // Pass new fields
              metricValues: exp.metricValues,
              dimensionScores: exp.dimensionScores
          });
      } else {
          await updateExperiment(exp);
      }
      setIsExperimentModalOpen(false);
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
          updateBoard(editingBoard.id, { name, description });
      } else {
          const newId = addBoard(name, description);
          setActiveBoardId(newId);
      }
  };

  const handleSaveBoardConfig = (boardId: string, config: BoardConfig) => {
     updateBoard(boardId, { config });
  };

  // Filter experiments for ALL views based on Board
  const boardExperiments = experiments.filter(e => e.board_id === activeBoardId);
  const activeBoard = boards.find(b => b.id === activeBoardId);

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
      onOpenBoardSettings={() => setIsBoardSettingsOpen(true)}
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
            experiments={boardExperiments}
            onEdit={openExperiment}
            onDelete={deleteExperiment}
          />
        </div>
      )}

      {activeTab === 'analytics' && (
        <AnalyticsView 
          experiments={boardExperiments} 
          board={activeBoard}
        />
      )}

      {activeTab === 'academy' && (
        <AcademyView />
      )}

      {/* Modals */}
      <ExperimentModal 
        experiment={selectedExperiment}
        isOpen={isExperimentModalOpen}
        onClose={() => setIsExperimentModalOpen(false)}
        onSave={handleSaveExperiment}
        onArchive={archiveExperiment}
        onComplete={completeExperiment}
        onDelete={deleteExperiment}
        board={activeBoard} // Pass board to access config
      />

      <BoardModal 
        isOpen={isBoardModalOpen}
        onClose={() => setIsBoardModalOpen(false)}
        onSave={handleSaveBoard}
        initialBoard={editingBoard}
      />
      
      <BoardSettingsModal 
        isOpen={isBoardSettingsOpen}
        onClose={() => setIsBoardSettingsOpen(false)}
        board={activeBoard || null}
        onSave={handleSaveBoardConfig}
      />

      <CustomAlert 
        isOpen={alertConfig.isOpen}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </Layout>
  );
}
