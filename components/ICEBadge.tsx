import React from 'react';

interface ICEBadgeProps {
  impact: number;
  confidence: number;
  ease: number;
}

export const ICEBadge: React.FC<ICEBadgeProps> = ({ impact, confidence, ease }) => {
  // Using Average (I+C+E)/3 for a 1-10 scale score
  const score = (impact + confidence + ease) / 3;
  const formattedScore = score.toFixed(1);
  
  // Color coding based on average score (Max 10)
  let bgClass = 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
  
  if (score >= 8) bgClass = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-bold';
  else if (score >= 6) bgClass = 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
  else if (score >= 4) bgClass = 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';

  return (
    <div className={`flex items-center gap-2 px-2 py-1 rounded text-xs border border-transparent ${bgClass}`} title={`Impact: ${impact}, Confidence: ${confidence}, Ease: ${ease}`}>
      <span className="uppercase tracking-tighter text-[10px] opacity-70">ICE</span>
      <span>{formattedScore}</span>
    </div>
  );
};