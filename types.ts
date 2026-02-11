
export type ExperimentStatus = 'idea' | 'hypothesis' | 'running' | 'complete' | 'learnings';
export type ExperimentResult = 'won' | 'lost' | 'inconclusive' | null;

export interface Board {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
  hasAttachment?: boolean;
}

export interface Experiment {
  id: string;
  board_id: string; // Link to Board
  title: string;
  description: string;
  status: ExperimentStatus;
  ice_impact: number;
  ice_confidence: number;
  ice_ease: number;
  market: string;
  type: string;
  tags: string[];
  created_at: string;
  archived: boolean;
  locked: boolean;
  result: ExperimentResult;
  owner: string; 
  comments: Comment[];
  // UI Helper
  boardName?: string;
}

export const STATUS_CONFIG: Record<ExperimentStatus, { label: string; color: string; bg: string; border: string; darkColor: string; darkBg: string; darkBorder: string }> = {
  idea: { 
    label: 'Idea/Backlog', 
    color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200',
    darkColor: 'text-yellow-400', darkBg: 'bg-yellow-900/30', darkBorder: 'border-yellow-700/50'
  },
  hypothesis: { 
    label: 'Prioritized', 
    color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200',
    darkColor: 'text-indigo-400', darkBg: 'bg-indigo-900/30', darkBorder: 'border-indigo-700/50'
  },
  running: { 
    label: 'In Progress', 
    color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200',
    darkColor: 'text-green-400', darkBg: 'bg-green-900/30', darkBorder: 'border-green-700/50'
  },
  complete: { 
    label: 'Complete', 
    color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200',
    darkColor: 'text-blue-400', darkBg: 'bg-blue-900/30', darkBorder: 'border-blue-700/50'
  },
  learnings: { 
    label: 'Learnings', 
    color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200',
    darkColor: 'text-orange-400', darkBg: 'bg-orange-900/30', darkBorder: 'border-orange-700/50'
  },
};

export const RESULT_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  won: { label: 'Won', color: 'text-emerald-700', bg: 'bg-emerald-100', border: 'border-emerald-200' },
  lost: { label: 'Lost', color: 'text-rose-700', bg: 'bg-rose-100', border: 'border-rose-200' },
  inconclusive: { label: 'Inconclusive', color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200' },
};

export const MARKETS = ['US', 'UK', 'CA', 'AU', 'NZ', 'SG'];
export const TYPES = ['Acquisition', 'Retention', 'Monetization', 'Product'];
