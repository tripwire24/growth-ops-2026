
import React, { useState, useMemo } from 'react';
import { Experiment, MARKETS, TYPES, STATUS_CONFIG, ExperimentStatus, RESULT_CONFIG } from '../types';
import { ICEBadge } from './ICEBadge';
import { Search, Lock, Trash2 } from 'lucide-react';

interface VaultTableProps {
  experiments: Experiment[];
  onEdit: (experiment: Experiment) => void;
  onDelete: (id: string) => void;
}

export const VaultTable: React.FC<VaultTableProps> = ({ experiments, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [resultFilter, setResultFilter] = useState<string>('all');
  const [marketFilter, setMarketFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredExperiments = useMemo(() => {
    return experiments.filter(exp => {
      const matchesSearch = exp.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            exp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            exp.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || exp.status === statusFilter;
      const matchesResult = resultFilter === 'all' || (resultFilter === 'pending' ? !exp.result : exp.result === resultFilter);
      const matchesMarket = marketFilter === 'all' || exp.market === marketFilter;
      const matchesType = typeFilter === 'all' || exp.type === typeFilter;
      return matchesSearch && matchesStatus && matchesResult && matchesMarket && matchesType;
    });
  }, [experiments, searchTerm, statusFilter, resultFilter, marketFilter, typeFilter]);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to permanently delete this item?")) {
        onDelete(id);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50 dark:bg-slate-900">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search experiments or tags..." 
            className="w-full pl-10 pr-4 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <select 
            className="px-3 py-2 rounded border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            {Object.keys(STATUS_CONFIG).map(s => (
              <option key={s} value={s}>{STATUS_CONFIG[s as ExperimentStatus].label}</option>
            ))}
          </select>

          <select 
            className="px-3 py-2 rounded border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            value={resultFilter}
            onChange={(e) => setResultFilter(e.target.value)}
          >
            <option value="all">All Outcomes</option>
            <option value="pending">Pending</option>
            {Object.keys(RESULT_CONFIG).map(r => (
              <option key={r} value={r}>{RESULT_CONFIG[r].label}</option>
            ))}
          </select>

          <select 
            className="px-3 py-2 rounded border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            value={marketFilter}
            onChange={(e) => setMarketFilter(e.target.value)}
          >
            <option value="all">All Markets</option>
            {MARKETS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>

          <select 
            className="px-3 py-2 rounded border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto bg-white dark:bg-slate-900">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 z-10 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider shadow-sm">
            <tr>
              <th className="px-6 py-3 border-b border-slate-200 dark:border-slate-700">Title</th>
              <th className="px-6 py-3 border-b border-slate-200 dark:border-slate-700">Board</th>
              <th className="px-6 py-3 border-b border-slate-200 dark:border-slate-700">Status</th>
              <th className="px-6 py-3 border-b border-slate-200 dark:border-slate-700">Outcome</th>
              <th className="px-6 py-3 border-b border-slate-200 dark:border-slate-700">ICE Score</th>
              <th className="px-6 py-3 border-b border-slate-200 dark:border-slate-700">Market</th>
              <th className="px-6 py-3 border-b border-slate-200 dark:border-slate-700">Type</th>
              <th className="px-6 py-3 border-b border-slate-200 dark:border-slate-700">Created</th>
              <th className="px-6 py-3 border-b border-slate-200 dark:border-slate-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm text-slate-700 dark:text-slate-300">
            {filteredExperiments.map(exp => (
              <tr key={exp.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${exp.archived ? 'opacity-80 bg-slate-50/50 dark:bg-slate-900/50' : ''}`}>
                <td className="px-6 py-3 font-medium text-slate-900 dark:text-slate-100">
                  <div className="flex items-center gap-2">
                    {exp.title}
                    {exp.locked && <Lock size={12} className="text-slate-400" />}
                    {exp.archived && <span className="text-[10px] uppercase bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded">Archived</span>}
                  </div>
                </td>
                <td className="px-6 py-3">
                  <span className="text-xs text-slate-500">{exp.boardName || '-'}</span>
                </td>
                <td className="px-6 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${STATUS_CONFIG[exp.status].bg} ${STATUS_CONFIG[exp.status].color} ${STATUS_CONFIG[exp.status].border} dark:${STATUS_CONFIG[exp.status].darkBg} dark:${STATUS_CONFIG[exp.status].darkColor} dark:${STATUS_CONFIG[exp.status].darkBorder}`}>
                    {STATUS_CONFIG[exp.status].label}
                  </span>
                </td>
                <td className="px-6 py-3">
                  {exp.result ? (
                    <span className={`px-2 py-1 rounded-full text-xs font-bold border uppercase ${RESULT_CONFIG[exp.result].bg} ${RESULT_CONFIG[exp.result].color} ${RESULT_CONFIG[exp.result].border}`}>
                      {RESULT_CONFIG[exp.result].label}
                    </span>
                  ) : (
                    <span className="text-slate-400 text-xs">-</span>
                  )}
                </td>
                <td className="px-6 py-3">
                  <ICEBadge impact={exp.ice_impact} confidence={exp.ice_confidence} ease={exp.ice_ease} />
                </td>
                <td className="px-6 py-3">{exp.market}</td>
                <td className="px-6 py-3">{exp.type}</td>
                <td className="px-6 py-3 text-slate-500 dark:text-slate-400">
                  {new Date(exp.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-3 text-right flex justify-end gap-3 items-center">
                  <button 
                    onClick={() => onEdit(exp)}
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 font-medium text-xs"
                  >
                    {exp.locked ? 'View' : 'Edit'}
                  </button>
                   <button 
                    onClick={(e) => handleDelete(e, exp.id)}
                    className="text-slate-400 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredExperiments.length === 0 && (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                  No experiments found matching filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-500 dark:text-slate-400 flex justify-between">
        <span>Showing {filteredExperiments.length} results</span>
        <span>Page 1 of 1</span>
      </div>
    </div>
  );
};
