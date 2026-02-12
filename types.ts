
export type ExperimentStatus = 'idea' | 'hypothesis' | 'running' | 'complete' | 'learnings';
export type ExperimentResult = 'won' | 'lost' | 'inconclusive' | null;

// --- V2 Configuration Types ---
export interface MetricDefinition {
  id: string;
  name: string;
  unit: string;
  description?: string;
}

export interface DimensionDefinition {
  id: string;
  name: string;
  description?: string;
  min: number;
  max: number;
}

export interface BoardConfig {
  metrics: MetricDefinition[];
  dimensions: DimensionDefinition[];
  useCustomDimensions: boolean;
}

export interface MetricValue {
  metricId: string;
  baseline: number | null;
  target: number | null;
  actual: number | null;
}

export interface DimensionScore {
  dimensionId: string;
  value: number;
}

// --- Main Types ---

export interface Board {
  id: string;
  name: string;
  description: string;
  created_at: string;
  config?: BoardConfig; // New in V2
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  linkedin_url?: string;
  contact_email?: string;
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
  board_id: string; 
  title: string;
  description: string;
  status: ExperimentStatus;
  
  // Legacy ICE (Keep for backward compat)
  ice_impact: number;
  ice_confidence: number;
  ice_ease: number;
  
  // V2 Scoring & Metrics
  dimensionScores?: DimensionScore[];
  metricValues?: MetricValue[];

  market: string;
  type: string;
  tags: string[];
  created_at: string;
  archived: boolean;
  locked: boolean;
  result: ExperimentResult;
  owner: string; 
  comments: Comment[];
  boardName?: string;
}

// --- Constants & Helpers ---

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
export const TYPES = ['Acquisition', 'Retention', 'Monetization', 'Product', 'Referral'];

export const DEFAULT_DIMENSIONS: DimensionDefinition[] = [
  { id: 'ice_impact', name: 'Impact', description: 'How much will this move the needle?', min: 1, max: 10 },
  { id: 'ice_confidence', name: 'Confidence', description: 'How sure are we?', min: 1, max: 10 },
  { id: 'ice_ease', name: 'Ease', description: 'How easy is it?', min: 1, max: 10 },
];

export const DEFAULT_BOARD_CONFIG: BoardConfig = {
  metrics: [],
  dimensions: DEFAULT_DIMENSIONS,
  useCustomDimensions: false,
};

export const calculateCompositeScore = (exp: Experiment, board?: Board): string => {
   const scores = exp.dimensionScores || [];
   
   // If board uses custom dimensions, use them
   if (board?.config?.useCustomDimensions) {
       if (scores.length === 0) {
           // Fallback to legacy ICE if custom dimensions enabled but no scores yet
           // or return 0 if strictly enforcing custom
           return ((exp.ice_impact + exp.ice_confidence + exp.ice_ease) / 3).toFixed(1);
       }
       return (scores.reduce((acc, s) => acc + s.value, 0) / scores.length).toFixed(1);
   }
   
   // Default ICE
   return ((exp.ice_impact + exp.ice_confidence + exp.ice_ease) / 3).toFixed(1);
}
