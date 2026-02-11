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
import { Experiment } from './types';

export default function GrowthApp() {
  const { user, loading: authLoading } = useAuth();
  
  // State for Guest/Demo Mode
  const [isGuestMode, setIsGuestMode] = useState(false);

  // Pass Guest Mode flag to hooks to force mock data usage
  const { experiments, updateStatus, updateExperiment, addExperiment, archiveExperiment, completeExperiment } = useExperiments(isGuestMode);
  
  const [activeTab, setActiveTab] = useState<'kanban' | 'vault' | 'analytics'>('kanban');
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingSetup, setViewingSetup] = useState(false);

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

  const handleNewExperiment = () => {
    // In a real app, this would open a modal with empty fields
    // For now, we'll auto-populate a template to speed up testing
    const title = prompt("Enter experiment title:");
    if (!title) return;
    
    addExperiment({
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
    setIsModalOpen(true);
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      onNewExperiment={handleNewExperiment}
      isMockMode={!isSupabaseConfigured || isGuestMode}
      onConnect={() => setViewingSetup(true)}
    >
      {activeTab === 'kanban' && (
        <KanbanBoard 
          experiments={experiments} 
          onStatusUpdate={updateStatus}
          onCardClick={openExperiment}
          onArchive={archiveExperiment}
        />
      )}
      
      {activeTab === 'vault' && (
        <div className="p-6 h-full overflow-hidden">
          <VaultTable 
            experiments={experiments} 
            onEdit={openExperiment}
          />
        </div>
      )}

      {activeTab === 'analytics' && (
        <AnalyticsView experiments={experiments} />
      )}

      <ExperimentModal 
        experiment={selectedExperiment}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={updateExperiment}
        onArchive={archiveExperiment}
        onComplete={completeExperiment}
      />
    </Layout>
  );
}