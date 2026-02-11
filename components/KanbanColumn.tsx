import React from 'react';
import { Experiment, ExperimentStatus, STATUS_CONFIG } from '../types';
import { ExperimentCard } from './ExperimentCard';
import { Lightbulb, Search, Hammer, Flag, BookOpen } from 'lucide-react';

interface KanbanColumnProps {
  status: ExperimentStatus;
  experiments: Experiment[];
  onDrop: (e: React.DragEvent, status: ExperimentStatus) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onCardClick: (experiment: Experiment) => void;
  onArchive: (id: string) => void;
}

const ICONS = {
  idea: Lightbulb,
  hypothesis: Search,
  running: Hammer,
  complete: Flag,
  learnings: BookOpen,
};

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ status, experiments, onDrop, onDragStart, onCardClick, onArchive }) => {
  const config = STATUS_CONFIG[status];
  const Icon = ICONS[status];
  const [isOver, setIsOver] = React.useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    setIsOver(false);
    onDrop(e, status);
  };

  return (
    <div 
      className={`flex-1 flex flex-col h-full min-w-[280px] md:min-w-0 border-r border-slate-200 dark:border-slate-800 last:border-r-0 transition-colors ${isOver ? 'bg-slate-50 dark:bg-slate-800/50' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className={`p-3 flex flex-col items-center justify-center border-b border-slate-200 dark:border-slate-800 ${config.bg} dark:${config.darkBg} bg-opacity-30`}>
        <div className={`p-2 rounded-full mb-2 ${config.bg} ${config.color} dark:${config.darkBg} dark:${config.darkColor}`}>
          <Icon size={20} />
        </div>
        <h2 className={`font-bold text-sm uppercase tracking-wider ${config.color} dark:${config.darkColor}`}>
          {config.label}
        </h2>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">{experiments.length}</span>
      </div>

      {/* Droppable Area */}
      <div className="flex-1 overflow-y-auto p-2 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
        {experiments.map(exp => (
          <ExperimentCard 
            key={exp.id} 
            experiment={exp} 
            onDragStart={onDragStart}
            onClick={onCardClick}
            onArchive={onArchive}
          />
        ))}
        {experiments.length === 0 && (
          <div className="h-32 flex flex-col items-center justify-center text-slate-300 dark:text-slate-700 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg m-2">
            <span className="text-sm">No items</span>
          </div>
        )}
      </div>
    </div>
  );
};