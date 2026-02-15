
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { KanbanBoard } from './components/KanbanBoard';
import { VaultTable } from './components/VaultTable';
import { AnalyticsView } from './components/AnalyticsView';
import { AcademyView } from './components/AcademyView';
import { ExperimentModal } from './components/ExperimentModal';
import { BoardModal } from './components/BoardModal';
import { BoardSettingsModal } from './components/BoardSettingsModal';
import { InviteModal } from './components/InviteModal';
import { AuthPage } from './components/AuthPage';
import { useExperiments } from './hooks/useExperiments';
import { useAuth } from './hooks/useAuth';
import { isSupabaseConfigured, supabase } from './services/supabase';
import { Experiment, Board, UserProfile, BoardConfig } from './types';
import { CustomAlert } from './components/CustomAlert';
import { Database, Copy, Check } from 'lucide-react';

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
  
  // Invite State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const [viewingSetup, setViewingSetup] = useState(false);
  
  // Alert State
  const [alertConfig, setAlertConfig] = useState<{isOpen: boolean, title: string, message: string, type: 'error' | 'success' | 'info'}>({
    isOpen: false, title: '', message: '', type: 'info'
  });

  // Database Schema Check State
  const [dbError, setDbError] = useState(false);
  const [copied, setCopied] = useState(false);

  // Initialize Active Board
  useEffect(() => {
    if (boards.length > 0 && !activeBoardId) {
        setActiveBoardId(boards[0].id);
    }
  }, [boards, activeBoardId]);

  // Database Connection Check
  useEffect(() => {
    const checkDb = async () => {
      if (!isSupabaseConfigured || isGuestMode || !user) return;
      
      // Try to select from profiles to check if table exists
      const { error } = await supabase!.from('profiles').select('id').limit(1);
      
      if (error && (error.code === '42P01' || error.message.includes('relation "public.profiles" does not exist'))) {
        setDbError(true);
      }
    };
    
    checkDb();
  }, [user, isGuestMode]);

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

  // SCHEMA ERROR MODAL
  if (dbError) {
    const schemaSQL = `-- Run this in Supabase SQL Editor
create type experiment_status as enum ('idea', 'hypothesis', 'running', 'complete', 'learnings');
create type experiment_result as enum ('won', 'lost', 'inconclusive');

create table profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  avatar_url text,
  bio text,
  linkedin_url text,
  contact_email text,
  updated_at timestamp with time zone
);

create table experiments (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references auth.users default auth.uid(),
  title text not null,
  description text,
  status experiment_status default 'idea',
  result experiment_result,
  ice_impact integer default 5,
  ice_confidence integer default 5,
  ice_ease integer default 5,
  market text,
  type text,
  tags text[] default '{}',
  archived boolean default false,
  locked boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table comments (
  id uuid default gen_random_uuid() primary key,
  experiment_id uuid references experiments(id) on delete cascade not null,
  user_id uuid references auth.users not null,
  text text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table profiles enable row level security;
alter table experiments enable row level security;
alter table comments enable row level security;

create policy "Public profiles" on profiles for select using (true);
create policy "Users update own profile" on profiles for update using (auth.uid() = id);
create policy "Users insert own profile" on profiles for insert with check (auth.uid() = id);

create policy "Public experiments" on experiments for select using (true);
create policy "Auth users insert experiments" on experiments for insert with check (auth.role() = 'authenticated');
create policy "Auth users update experiments" on experiments for update using (auth.role() = 'authenticated');

create policy "Public comments" on comments for select using (true);
create policy "Auth users insert comments" on comments for insert with check (auth.role() = 'authenticated');

insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);
create policy "Public avatars" on storage.objects for select using ( bucket_id = 'avatars' );
create policy "Upload avatars" on storage.objects for insert with check ( bucket_id = 'avatars' );`;

    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900 text-white">
        <div className="max-w-2xl w-full bg-slate-800 rounded-xl border border-slate-700 p-8 shadow-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-red-500/20 rounded-full text-red-400">
              <Database size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Database Setup Required</h1>
              <p className="text-slate-400">Your Supabase project is connected, but the tables are missing.</p>
            </div>
          </div>

          <div className="bg-slate-950 rounded-lg p-4 mb-6 border border-slate-700 overflow-hidden relative group">
            <pre className="text-xs text-slate-300 font-mono overflow-auto max-h-60 p-2">
              {schemaSQL}
            </pre>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(schemaSQL);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="absolute top-2 right-2 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 transition-colors border border-slate-600"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy SQL'}
            </button>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-slate-300">
              1. Go to your <strong>Supabase Dashboard</strong> &rarr; <strong>SQL Editor</strong>.<br/>
              2. Paste the SQL code above and click <strong>Run</strong>.<br/>
              3. Once successful, click the button below to reload.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-colors"
            >
              I've Run the SQL (Reload App)
            </button>
          </div>
        </div>
      </div>
    );
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
      // Invite
      onInvite={() => setIsInviteModalOpen(true)}
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

      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
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
