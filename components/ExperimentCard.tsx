import React from 'react';
import { Experiment, STATUS_CONFIG, RESULT_CONFIG } from '../types';
import { ICEBadge } from './ICEBadge';
import { Archive, Lock } from 'lucide-react';

// --- Sub-components ---

const CardHeader: React.FC<{ title: string; result: Experiment['result']; locked: boolean }> = ({ title, result, locked }) => {
  return (
    <div className="flex justify-between items-start mb-2 group cursor-grab active:cursor-grabbing">
      <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm leading-snug line-clamp-2 pr-1">{title}</h3>
      <div className="flex items-start gap-1">
        {locked && <Lock size={12} className="text-slate-400 mt-0.5" />}
        {result && (
          <span className={`shrink-0 ml-1 px-1.5 py-0.5 text-[10px] font-bold uppercase rounded border ${RESULT_CONFIG[result].bg} ${RESULT_CONFIG[result].color} ${RESULT_CONFIG[result].border}`}>
            {RESULT_CONFIG[result].label}
          </span>
        )}
      </div>
    </div>
  );
};

const CardContent: React.FC<{ description: string; market: string; type: string; tags: string[] }> = ({ description, market, type, tags }) => (
  <div className="mb-3">
    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-2 min-h-[2.5em]">{description}</p>
    <div className="flex flex-wrap gap-1 mb-2">
      <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] rounded border border-slate-200 dark:border-slate-700">
        {market}
      </span>
      <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] rounded border border-slate-200 dark:border-slate-700">
        {type}
      </span>
    </div>
    {tags.length > 0 && (
       <div className="flex flex-wrap gap-1">
         {tags.slice(0, 3).map(tag => (
           <span key={tag} className="text-[9px] text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-1 rounded">
             #{tag}
           </span>
         ))}
         {tags.length > 3 && (
            <span className="text-[9px] text-slate-400 px-1">+{tags.length - 3}</span>
         )}
       </div>
    )}
  </div>
);

const CardMetrics: React.FC<{ impact: number; confidence: number; ease: number; owner: string }> = ({ impact, confidence, ease, owner }) => {
  // Get initials
  const initials = owner.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-700 pt-2 mt-auto">
      <ICEBadge impact={impact} confidence={confidence} ease={ease} />
      
      <div className="flex items-center gap-1.5" title={`Owner: ${owner}`}>
        <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-[9px] font-bold border border-indigo-200 dark:border-indigo-800">
          {initials}
        </div>
      </div>
    </div>
  );
}

// --- Main Component ---

interface ExperimentCardProps {
  experiment: Experiment;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onClick: (experiment: Experiment) => void;
  onArchive: (id: string) => void;
}

export const ExperimentCard: React.FC<ExperimentCardProps> = ({ experiment, onDragStart, onClick, onArchive }) => {
  // Determine border color based on result if complete/learnings
  let borderClass = 'border-slate-200 dark:border-slate-700';
  if ((experiment.status === 'complete' || experiment.status === 'learnings') && experiment.result) {
    if (experiment.result === 'won') borderClass = 'border-emerald-400 dark:border-emerald-600 ring-1 ring-emerald-400 dark:ring-emerald-600';
    else if (experiment.result === 'lost') borderClass = 'border-rose-400 dark:border-rose-600';
  }

  return (
    <div 
      draggable
      onDragStart={(e) => onDragStart(e, experiment.id)}
      onClick={() => onClick(experiment)}
      className={`relative group bg-white dark:bg-slate-800 p-3 rounded-lg border ${borderClass} shadow-sm hover:shadow-md transition-all duration-200 flex flex-col active:scale-[0.98] select-none`}
    >
      <CardHeader title={experiment.title} result={experiment.result} locked={experiment.locked} />
      <CardContent 
        description={experiment.description} 
        market={experiment.market} 
        type={experiment.type} 
        tags={experiment.tags}
      />
      <CardMetrics 
        impact={experiment.ice_impact} 
        confidence={experiment.ice_confidence} 
        ease={experiment.ice_ease} 
        owner={experiment.owner}
      />
      
      {/* Archive Action for Learnings Column - Only show if not already locked/archived */}
      {experiment.status === 'learnings' && !experiment.locked && !experiment.archived && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onArchive(experiment.id);
          }}
          className="absolute -top-2 -right-2 bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-200 p-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
          title="Archive to Vault"
        >
          <Archive size={14} />
        </button>
      )}
    </div>
  );
};