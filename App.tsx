import React, { useState } from 'react';
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

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const { experiments, updateStatus, updateExperiment, addExperiment, archiveExperiment, completeExperiment } = useExperiments();
  const [activeTab, setActiveTab] = useState<'kanban' | 'vault' | 'analytics'>('kanban');
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // If Supabase is configured, enforce login
  if (isSupabaseConfigured && !authLoading && !user) {
    return <AuthPage />;
  }

  // Loading state
  if (isSupabaseConfigured && authLoading) {
      return <div className="h-screen w-screen flex items-center justify-center bg-slate-900 text-white">Loading Growth Ops...</div>;
  }

  const handleNewExperiment = () => {
    const title = prompt("Enter experiment title:");
    if (!title) return;
    
    addExperiment({
      title,
      description: 'New experiment description placeholder.',
      status: 'idea',
      ice_impact: 5,
      ice_confidence: 5,
      ice_ease: 5,
      market: 'US',
      type: 'Growth',
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