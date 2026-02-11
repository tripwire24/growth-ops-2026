import React from 'react';
import { Experiment, STATUS_CONFIG, TYPES, MARKETS } from '../types';

// Simple SVG Pie Chart Component
const PieChart = ({ data }: { data: { label: string, value: number, color: string }[] }) => {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  let currentAngle = 0;

  if (total === 0) return <div className="text-gray-400 text-xs text-center py-10">No data</div>;

  return (
    <div className="flex items-center justify-center gap-8">
      <svg viewBox="0 0 100 100" className="w-32 h-32 transform -rotate-90">
        {data.map((slice, i) => {
          if (slice.value === 0) return null;
          const angle = (slice.value / total) * 360;
          const x1 = 50 + 50 * Math.cos(Math.PI * currentAngle / 180);
          const y1 = 50 + 50 * Math.sin(Math.PI * currentAngle / 180);
          const x2 = 50 + 50 * Math.cos(Math.PI * (currentAngle + angle) / 180);
          const y2 = 50 + 50 * Math.sin(Math.PI * (currentAngle + angle) / 180);
          const pathData = total === slice.value 
             ? "M 50 50 m -50 0 a 50 50 0 1 0 100 0 a 50 50 0 1 0 -100 0" 
             : `M 50 50 L ${x1} ${y1} A 50 50 0 ${angle > 180 ? 1 : 0} 1 ${x2} ${y2} Z`;
          
          const el = <path key={i} d={pathData} fill={slice.color} stroke="white" strokeWidth="1" className="dark:stroke-slate-800" />;
          currentAngle += angle;
          return el;
        })}
      </svg>
      <div className="space-y-1">
        {data.map((slice, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: slice.color }}></span>
            <span className="text-slate-600 dark:text-slate-300">{slice.label}</span>
            <span className="font-bold text-slate-800 dark:text-slate-100">{Math.round((slice.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Simple SVG Bar Chart Component
const BarChart = ({ data, color }: { data: { label: string, value: number }[], color: string }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  
  return (
    <div className="flex items-end gap-2 h-40 pt-4 pb-6 w-full px-2">
      {data.map((bar, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
           <div className="relative w-full flex items-end justify-center h-full">
             <div 
                className={`w-full max-w-[40px] rounded-t transition-all duration-500 ${color} opacity-80 group-hover:opacity-100`}
                style={{ height: `${(bar.value / max) * 100}%` }}
             >
             </div>
             <span className="absolute -top-6 text-[10px] font-bold text-slate-500 dark:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
               {bar.value}
             </span>
           </div>
           <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate w-full text-center" title={bar.label}>
             {bar.label}
           </span>
        </div>
      ))}
    </div>
  );
};

export const AnalyticsView: React.FC<{ experiments: Experiment[] }> = ({ experiments }) => {
  const activeExperiments = experiments.filter(e => !e.archived);
  const completedCount = experiments.filter(e => e.status === 'complete' || e.status === 'learnings').length;
  
  // Calculate average of averages: ((I+C+E)/3 + (I+C+E)/3 ...) / N
  const avgIce = activeExperiments.length > 0 
    ? (activeExperiments.reduce((acc, curr) => acc + ((curr.ice_impact + curr.ice_confidence + curr.ice_ease) / 3), 0) / activeExperiments.length).toFixed(1)
    : '0';

  // Data for Charts
  const typeData = TYPES.map(t => ({
    label: t,
    value: activeExperiments.filter(e => e.type === t).length,
    color: t === 'Acquisition' ? '#3B82F6' : t === 'Retention' ? '#10B981' : t === 'Monetization' ? '#F59E0B' : '#8B5CF6'
  }));

  const marketData = MARKETS.map(m => ({
    label: m,
    value: activeExperiments.filter(e => e.market === m).length
  }));

  const statusData = Object.keys(STATUS_CONFIG).map(s => ({
    label: STATUS_CONFIG[s as any].label,
    value: activeExperiments.filter(e => e.status === s).length
  }));

  return (
    <div className="p-6 h-full overflow-y-auto bg-slate-50 dark:bg-slate-950">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Active Experiments</h3>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{activeExperiments.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Completed All-Time</h3>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{completedCount}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Avg ICE Score</h3>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">{avgIce}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Velocity (Mo)</h3>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">4.2</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Distribution by Type</h3>
            <PieChart data={typeData} />
          </div>

          {/* Market Bar Chart */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Focus by Market</h3>
            <BarChart data={marketData} color="bg-indigo-500" />
          </div>

          {/* Status Bar Chart */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm md:col-span-2">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Pipeline Health</h3>
            <BarChart data={statusData} color="bg-slate-700 dark:bg-slate-600" />
          </div>
        </div>
      </div>
    </div>
  );
};