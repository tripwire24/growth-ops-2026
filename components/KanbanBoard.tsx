import React from 'react';
import { Experiment, ExperimentStatus } from '../types';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  experiments: Experiment[];
  onStatusUpdate: (id: string, newStatus: ExperimentStatus) => void;
  onCardClick: (experiment: Experiment) => void;
  onArchive: (id: string) => void;
}

const COLUMNS: ExperimentStatus[] = ['idea', 'hypothesis', 'running', 'complete', 'learnings'];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ experiments, onStatusUpdate, onCardClick, onArchive }) => {
  
  const handleDrop = (e: React.DragEvent, status: ExperimentStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("experimentId");
    if (id) {
      onStatusUpdate(id, status);
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("experimentId", id);
  };

  return (
    <div className="h-full w-full overflow-x-auto overflow-y-hidden">
      <div className="flex h-full min-w-max md:min-w-0 md:grid md:grid-cols-5 divide-x divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
        {COLUMNS.map(status => (
          <KanbanColumn
            key={status}
            status={status}
            experiments={experiments.filter(e => e.status === status && !e.archived)}
            onDrop={handleDrop}
            onDragStart={handleDragStart}
            onCardClick={onCardClick}
            onArchive={onArchive}
          />
        ))}
      </div>
    </div>
  );
};