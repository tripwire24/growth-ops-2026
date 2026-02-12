
// ==========================================
// AnalyticsView — Enhanced with real velocity, metric tracking, and win rate
// ==========================================
import React, { useMemo } from 'react';
import { Experiment, Board, STATUS_CONFIG, TYPES, MARKETS, ExperimentStatus, calculateCompositeScore } from '../types';
import { TrendingUp, TrendingDown, Target, Zap, Trophy, BarChart3, Activity } from 'lucide-react';

// --- SVG Pie Chart ---
const PieChart = ({ data }: { data: { label: string; value: number; color: string }[] }) => {
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
            ? 'M 50 50 m -50 0 a 50 50 0 1 0 100 0 a 50 50 0 1 0 -100 0'
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

// --- SVG Bar Chart ---
const BarChart = ({ data, color }: { data: { label: string; value: number }[]; color: string }) => {
  const max = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="flex items-end gap-2 h-40 pt-4 pb-6 w-full px-2">
      {data.map((bar, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
          <div className="relative w-full flex items-end justify-center h-full">
            <div
              className={`w-full max-w-[40px] rounded-t transition-all duration-500 ${color} opacity-80 group-hover:opacity-100`}
              style={{ height: `${(bar.value / max) * 100}%` }}
            ></div>
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

// --- Metric Progress Mini Card ---
const MetricProgressCard: React.FC<{
  name: string;
  unit: string;
  baseline: number;
  target: number;
  actual: number | null;
}> = ({ name, unit, baseline, target, actual }) => {
  const progress = actual !== null ? ((actual - baseline) / (target - baseline)) * 100 : 0;
  const isPositive = actual !== null && actual >= target;

  return (
    <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{name}</span>
        {actual !== null && (
          isPositive 
            ? <TrendingUp size={12} className="text-emerald-500" />
            : <TrendingDown size={12} className="text-rose-500" />
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-bold text-slate-900 dark:text-white">
          {actual !== null ? `${actual}${unit}` : '—'}
        </span>
        <span className="text-[10px] text-slate-400">
          target: {target}{unit}
        </span>
      </div>
      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            actual === null ? 'bg-slate-300' : isPositive ? 'bg-emerald-500' : progress > 50 ? 'bg-amber-500' : 'bg-rose-500'
          }`}
          style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
        ></div>
      </div>
    </div>
  );
};

// --- Main Analytics View ---
export const AnalyticsView: React.FC<{ experiments: Experiment[]; board?: Board }> = ({ experiments, board }) => {
  const analytics = useMemo(() => {
    const active = experiments.filter(e => !e.archived);
    const completed = experiments.filter(e => e.status === 'complete' || e.status === 'learnings');
    const withResult = completed.filter(e => e.result);
    const wins = withResult.filter(e => e.result === 'won').length;
    const winRate = withResult.length > 0 ? Math.round((wins / withResult.length) * 100) : 0;

    // Real velocity: experiments completed per 30-day period
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentCompleted = completed.filter(e => new Date(e.created_at) >= thirtyDaysAgo);
    const velocity = recentCompleted.length;

    // Average composite score
    const avgScore = active.length > 0
      ? (active.reduce((acc, exp) => acc + parseFloat(calculateCompositeScore(exp, board)), 0) / active.length).toFixed(1)
      : '0';

    // Metric tracking across experiments
    const boardMetrics = board?.config?.metrics || [];
    const metricSummaries = boardMetrics.map(def => {
      const values = experiments
        .filter(e => e.metricValues?.some(m => m.metricId === def.id))
        .map(e => e.metricValues!.find(m => m.metricId === def.id)!)
        .filter(Boolean);

      const withBaseline = values.filter(v => v.baseline !== null);
      const withTarget = values.filter(v => v.target !== null);
      const withActual = values.filter(v => v.actual !== null);

      return {
        ...def,
        experimentCount: values.length,
        avgBaseline: withBaseline.length > 0 ? withBaseline.reduce((a, v) => a + v.baseline!, 0) / withBaseline.length : null,
        avgTarget: withTarget.length > 0 ? withTarget.reduce((a, v) => a + v.target!, 0) / withTarget.length : null,
        avgActual: withActual.length > 0 ? withActual.reduce((a, v) => a + v.actual!, 0) / withActual.length : null,
      };
    });

    // Chart data
    const typeData = TYPES.map(t => ({
      label: t,
      value: active.filter(e => e.type === t).length,
      color: t === 'Acquisition' ? '#3B82F6' : t === 'Retention' ? '#10B981' : t === 'Monetization' ? '#F59E0B' : t === 'Referral' ? '#EC4899' : '#8B5CF6',
    }));

    const marketData = MARKETS.map(m => ({
      label: m,
      value: active.filter(e => e.market === m).length,
    }));

    const statusData = Object.keys(STATUS_CONFIG).map(s => ({
      label: STATUS_CONFIG[s as ExperimentStatus].label,
      value: active.filter(e => e.status === s).length,
    }));

    return {
      activeCount: active.length,
      completedCount: completed.length,
      winRate,
      velocity,
      avgScore,
      metricSummaries,
      typeData,
      marketData,
      statusData,
    };
  }, [experiments, board]);

  return (
    <div className="p-6 h-full overflow-y-auto bg-slate-50 dark:bg-slate-950">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Activity size={14} className="text-slate-400" />
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Active</h3>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{analytics.activeCount}</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Target size={14} className="text-slate-400" />
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Completed</h3>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{analytics.completedCount}</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Trophy size={14} className="text-amber-500" />
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Win Rate</h3>
            </div>
            <p className={`text-2xl font-bold ${analytics.winRate >= 50 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {analytics.winRate}%
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Zap size={14} className="text-green-500" />
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Velocity (30d)</h3>
            </div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{analytics.velocity}</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 size={14} className="text-indigo-500" />
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Avg Score</h3>
            </div>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{analytics.avgScore}</p>
          </div>
        </div>

        {/* Metric Progress Cards (if board has metrics) */}
        {analytics.metricSummaries.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
              <Target size={16} className="text-indigo-500" />
              Metric Tracking
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {analytics.metricSummaries.map(ms => (
                <MetricProgressCard
                  key={ms.id}
                  name={ms.name}
                  unit={ms.unit}
                  baseline={ms.avgBaseline ?? 0}
                  target={ms.avgTarget ?? 0}
                  actual={ms.avgActual}
                />
              ))}
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Distribution by Type</h3>
            <PieChart data={analytics.typeData} />
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Focus by Market</h3>
            <BarChart data={analytics.marketData} color="bg-indigo-500" />
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm md:col-span-2">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Pipeline Health</h3>
            <BarChart data={analytics.statusData} color="bg-slate-700 dark:bg-slate-600" />
          </div>
        </div>
      </div>
    </div>
  );
};
