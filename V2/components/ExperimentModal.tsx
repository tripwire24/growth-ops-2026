// ==========================================
// ExperimentModal — Enhanced with Custom Metrics & Dimensions
// ==========================================
import React, { useState, useEffect } from 'react';
import { 
  Experiment, ExperimentStatus, MARKETS, TYPES, STATUS_CONFIG, Comment, 
  Board, MetricValue, DimensionScore, calculateCompositeScore, DEFAULT_DIMENSIONS 
} from '../types';
import { 
  X, Save, Archive, MessageSquare, Send, User, CheckCircle, Lock, Plus, 
  Tag, AlertTriangle, Trash2, Target, TrendingUp, BarChart3 
} from 'lucide-react';

interface ExperimentModalProps {
  experiment: Experiment | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (experiment: Experiment) => void;
  onArchive: (id: string) => void;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  board?: Board;  // NEW: Pass the active board for config
}

export const ExperimentModal: React.FC<ExperimentModalProps> = ({ 
  experiment, isOpen, onClose, onSave, onArchive, onComplete, onDelete, board 
}) => {
  const [formData, setFormData] = useState<Experiment | null>(null);
  const [newComment, setNewComment] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    if (experiment) {
      // Initialize metricValues from board config if missing
      const boardMetrics = board?.config?.metrics || [];
      const existingMetrics = experiment.metricValues || [];
      
      const mergedMetrics: MetricValue[] = boardMetrics.map(def => {
        const existing = existingMetrics.find(m => m.metricId === def.id);
        return existing || { metricId: def.id, baseline: null, target: null, actual: null };
      });

      // Initialize dimension scores if using custom dimensions
      const boardDimensions = board?.config?.useCustomDimensions 
        ? board.config.dimensions 
        : DEFAULT_DIMENSIONS;
      
      const existingDimScores = experiment.dimensionScores || [];
      const mergedDimScores: DimensionScore[] = boardDimensions.map(def => {
        const existing = existingDimScores.find(d => d.dimensionId === def.id);
        if (existing) return existing;
        // Map legacy ICE values
        if (def.id === 'ice_impact') return { dimensionId: def.id, value: experiment.ice_impact };
        if (def.id === 'ice_confidence') return { dimensionId: def.id, value: experiment.ice_confidence };
        if (def.id === 'ice_ease') return { dimensionId: def.id, value: experiment.ice_ease };
        return { dimensionId: def.id, value: Math.round((def.min + def.max) / 2) };
      });

      setFormData({ 
        ...experiment, 
        metricValues: mergedMetrics,
        dimensionScores: mergedDimScores 
      });
      setNewComment('');
      setTagInput('');
      setDeleteConfirm(false);
    }
  }, [experiment, board]);

  if (!isOpen || !formData) return null;

  const isNew = formData.id === 'new';
  const isLocked = formData.locked;
  const isLearnings = formData.status === 'learnings';
  const showResultSelector = formData.status === 'complete' || isLearnings;
  const canArchive = isLearnings && !formData.archived && !formData.locked;

  const boardDimensions = board?.config?.useCustomDimensions 
    ? board.config.dimensions 
    : DEFAULT_DIMENSIONS;

  const handleChange = (field: keyof Experiment, value: any) => {
    if (formData.locked) return;
    setFormData(prev => prev ? { ...prev, [field]: value } : null);
  };

  // Calculate composite score from dimension scores
  const compositeScore = (() => {
    const scores = formData.dimensionScores || [];
    if (scores.length === 0) return ((formData.ice_impact + formData.ice_confidence + formData.ice_ease) / 3).toFixed(1);
    return (scores.reduce((acc, s) => acc + s.value, 0) / scores.length).toFixed(1);
  })();

  const handleDimensionChange = (dimensionId: string, value: number) => {
    if (isLocked) return;
    setFormData(prev => {
      if (!prev) return null;
      const scores = [...(prev.dimensionScores || [])];
      const idx = scores.findIndex(s => s.dimensionId === dimensionId);
      if (idx >= 0) {
        scores[idx] = { ...scores[idx], value };
      } else {
        scores.push({ dimensionId, value });
      }
      // Also sync legacy ICE fields for backward compat
      const updates: Partial<Experiment> = { dimensionScores: scores };
      if (dimensionId === 'ice_impact') updates.ice_impact = value;
      if (dimensionId === 'ice_confidence') updates.ice_confidence = value;
      if (dimensionId === 'ice_ease') updates.ice_ease = value;
      return { ...prev, ...updates };
    });
  };

  const handleMetricChange = (metricId: string, field: 'baseline' | 'target' | 'actual', value: string) => {
    if (isLocked) return;
    setFormData(prev => {
      if (!prev) return null;
      const metrics = [...(prev.metricValues || [])];
      const idx = metrics.findIndex(m => m.metricId === metricId);
      const numValue = value === '' ? null : parseFloat(value);
      if (idx >= 0) {
        metrics[idx] = { ...metrics[idx], [field]: numValue };
      } else {
        metrics.push({ metricId, baseline: null, target: null, actual: null, [field]: numValue });
      }
      return { ...prev, metricValues: metrics };
    });
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const comment: Comment = {
      id: Date.now().toString(),
      userId: 'currentUser',
      userName: 'Demo User',
      text: newComment,
      timestamp: new Date().toISOString()
    };
    setFormData(prev => prev ? { ...prev, comments: [...prev.comments, comment] } : null);
    setNewComment('');
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => prev ? { ...prev, tags: [...prev.tags, tagInput.trim()] } : null);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (isLocked) return;
    setFormData(prev => prev ? { ...prev, tags: prev.tags.filter(t => t !== tagToRemove) } : null);
  };

  const handleDelete = () => {
    if (deleteConfirm) {
      onDelete(formData.id);
      onClose();
    } else {
      setDeleteConfirm(true);
    }
  };

  const boardMetrics = board?.config?.metrics || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-5xl border border-slate-200 dark:border-slate-800 max-h-[92vh] flex animate-in fade-in zoom-in-95 duration-200">
        
        {/* LEFT PANEL — Form */}
        <div className="flex-1 flex flex-col overflow-hidden border-r border-slate-200 dark:border-slate-800">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${STATUS_CONFIG[formData.status].bg} ${STATUS_CONFIG[formData.status].color} ${STATUS_CONFIG[formData.status].border}`}>
                {STATUS_CONFIG[formData.status].label}
              </span>
              {isLocked && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 text-xs font-medium">
                  <Lock size={10} /> Locked
                </span>
              )}
              {formData.boardName && (
                <span className="text-[10px] uppercase bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded font-bold border border-indigo-100 dark:border-indigo-800">
                  {formData.boardName}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-500">Owner:</span>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                <User size={10} className="text-slate-500" />
                <span className="text-xs text-slate-600 dark:text-slate-300">{formData.owner}</span>
              </div>
            </div>
          </div>
          
          {/* Scrollable Form */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Title */}
            <div>
              <input
                type="text"
                value={formData.title}
                onChange={e => handleChange('title', e.target.value)}
                disabled={isLocked}
                placeholder="Experiment title..."
                className="w-full text-xl font-bold text-slate-900 dark:text-white bg-transparent border-none outline-none placeholder-slate-300 disabled:opacity-60"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Hypothesis / Description</label>
              <textarea
                value={formData.description}
                onChange={e => handleChange('description', e.target.value)}
                disabled={isLocked}
                rows={3}
                placeholder="If we [do this], then [this will happen] because [of this reason]..."
                className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm disabled:opacity-60"
              />
            </div>

            {/* Status, Market, Type Row */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={e => handleChange('status', e.target.value)}
                  disabled={isLocked}
                  className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm disabled:opacity-60"
                >
                  {Object.entries(STATUS_CONFIG).map(([key, val]: [string, any]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Market</label>
                <select
                  value={formData.market}
                  onChange={e => handleChange('market', e.target.value)}
                  disabled={isLocked}
                  className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm disabled:opacity-60"
                >
                  {MARKETS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={e => handleChange('type', e.target.value)}
                  disabled={isLocked}
                  className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm disabled:opacity-60"
                >
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            {/* Result Selector (when complete/learnings) */}
            {showResultSelector && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-lg">
                <label className="block text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-2">Experiment Outcome</label>
                <div className="flex gap-2">
                  {(['won', 'lost', 'inconclusive'] as const).map(result => (
                    <button
                      key={result}
                      onClick={() => !isLocked && handleChange('result', result)}
                      disabled={isLocked}
                      className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
                        formData.result === result 
                          ? result === 'won' 
                            ? 'bg-emerald-600 text-white shadow-lg' 
                            : result === 'lost' 
                              ? 'bg-rose-600 text-white shadow-lg' 
                              : 'bg-slate-600 text-white shadow-lg'
                          : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 hover:border-slate-400'
                      } disabled:opacity-60 disabled:cursor-not-allowed`}
                    >
                      {result.charAt(0).toUpperCase() + result.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* SCORING DIMENSIONS */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                  {board?.config?.useCustomDimensions ? 'Scoring Dimensions' : 'ICE Score'}
                </h3>
                <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{compositeScore}</span>
              </div>
              <div className="space-y-4">
                {boardDimensions.map(dim => {
                  const score = formData.dimensionScores?.find(s => s.dimensionId === dim.id);
                  const value = score?.value ?? Math.round((dim.min + dim.max) / 2);
                  return (
                    <div key={dim.id} className="flex items-center gap-4">
                      <label className="w-28 text-sm font-medium text-slate-600 dark:text-slate-400 truncate" title={dim.description}>
                        {dim.name}
                      </label>
                      <input
                        type="range"
                        min={dim.min}
                        max={dim.max}
                        disabled={isLocked}
                        value={value}
                        onChange={e => handleDimensionChange(dim.id, parseInt(e.target.value))}
                        className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 disabled:opacity-60"
                      />
                      <span className="w-8 text-center text-sm font-bold text-slate-700 dark:text-slate-300">{value}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CUSTOM METRICS (Baseline / Target / Actual) */}
            {boardMetrics.length > 0 && (
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800">
                <div className="flex items-center gap-2 mb-4">
                  <Target size={16} className="text-indigo-600 dark:text-indigo-400" />
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Tracking Metrics</h3>
                </div>
                
                {/* Column Headers */}
                <div className="grid grid-cols-4 gap-3 mb-2 px-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Metric</span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-center">Baseline</span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-center">Target</span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-center">Actual</span>
                </div>
                
                <div className="space-y-2">
                  {boardMetrics.map(metricDef => {
                    const mv = formData.metricValues?.find(m => m.metricId === metricDef.id);
                    const hit = mv?.actual !== null && mv?.actual !== undefined && mv?.target !== null && mv?.target !== undefined;
                    const isPositive = hit && (mv!.actual! >= mv!.target!);
                    
                    return (
                      <div key={metricDef.id} className="grid grid-cols-4 gap-3 items-center">
                        <div className="truncate" title={metricDef.description}>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{metricDef.name}</span>
                          <span className="text-[10px] text-slate-400 ml-1">{metricDef.unit}</span>
                        </div>
                        <input
                          type="number"
                          step="any"
                          value={mv?.baseline ?? ''}
                          onChange={e => handleMetricChange(metricDef.id, 'baseline', e.target.value)}
                          disabled={isLocked}
                          placeholder="—"
                          className="px-2 py-1.5 text-sm text-center rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-60"
                        />
                        <input
                          type="number"
                          step="any"
                          value={mv?.target ?? ''}
                          onChange={e => handleMetricChange(metricDef.id, 'target', e.target.value)}
                          disabled={isLocked}
                          placeholder="—"
                          className="px-2 py-1.5 text-sm text-center rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-60"
                        />
                        <div className="relative">
                          <input
                            type="number"
                            step="any"
                            value={mv?.actual ?? ''}
                            onChange={e => handleMetricChange(metricDef.id, 'actual', e.target.value)}
                            disabled={isLocked}
                            placeholder="—"
                            className={`w-full px-2 py-1.5 text-sm text-center rounded border ${
                              hit 
                                ? isPositive 
                                  ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 font-bold' 
                                  : 'border-rose-300 bg-rose-50 dark:bg-rose-900/20 dark:border-rose-700 text-rose-700 dark:text-rose-400 font-bold'
                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white'
                            } focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-60`}
                          />
                          {hit && (
                            <TrendingUp size={10} className={`absolute right-1 top-1 ${isPositive ? 'text-emerald-500' : 'text-rose-500 rotate-180'}`} />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tags */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Tags</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {formData.tags.map(tag => (
                  <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs text-slate-600 dark:text-slate-300">
                    <Tag size={10} />
                    {tag}
                    {!isLocked && (
                      <button onClick={() => handleRemoveTag(tag)} className="text-slate-400 hover:text-red-500 ml-0.5">
                        <X size={10} />
                      </button>
                    )}
                  </span>
                ))}
              </div>
              {!isLocked && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="Add tag..."
                    className="flex-1 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <button
                    onClick={handleAddTag}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0 bg-slate-50 dark:bg-slate-900/50">
            {!isNew && !isLocked && (
              <>
                {canArchive && (
                  <button
                    onClick={() => { onArchive(formData.id); onClose(); }}
                    className="flex items-center gap-1 px-3 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-md text-xs font-bold hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
                  >
                    <Archive size={14} /> Archive
                  </button>
                )}
                {(formData.status === 'complete' || isLearnings) && !isLocked && (
                  <button
                    onClick={() => {
                      if (!formData.result) {
                        alert("Please select an Outcome before completing.");
                        return;
                      }
                      onSave(formData);
                      onComplete(formData.id);
                      onClose();
                    }}
                    className="flex items-center gap-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-bold shadow-sm transition-colors"
                    title="Finalize results and lock card"
                  >
                    <CheckCircle size={14} /> Complete & Lock
                  </button>
                )}
              </>
            )}

            {isLocked && (
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Lock size={12} /> Read Only
              </span>
            )}

            <div className="flex gap-2 ml-auto">
              {!isLocked && !isNew && (
                <button
                  onClick={handleDelete}
                  className={`flex items-center gap-1 px-3 py-2 rounded-md text-xs font-bold transition-colors ${
                    deleteConfirm 
                      ? 'bg-red-600 text-white hover:bg-red-700' 
                      : 'text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                  }`}
                >
                  <Trash2 size={14} />
                  {deleteConfirm ? 'Confirm Delete' : 'Delete'}
                </button>
              )}
              <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                Cancel
              </button>
              {!isLocked && (
                <button
                  onClick={() => { onSave(formData); }}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-bold shadow-sm transition-colors"
                >
                  <Save size={14} />
                  {isNew ? 'Create' : 'Save'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL — Comments */}
        <div className="w-80 flex flex-col bg-slate-50 dark:bg-slate-950/50 rounded-r-xl hidden md:flex">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center shrink-0">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-sm">
              <MessageSquare size={16} /> Updates
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isNew ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4 text-slate-400">
                <Save size={20} className="mb-3 opacity-40" />
                <h4 className="font-medium text-slate-500 mb-1 text-sm">Unsaved</h4>
                <p className="text-xs">Save to start adding comments.</p>
              </div>
            ) : formData.comments.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">
                No updates yet. Start the conversation!
              </div>
            ) : (
              formData.comments.map(comment => (
                <div key={comment.id} className="flex gap-2.5 text-sm">
                  <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0 font-bold text-slate-500 text-[10px]">
                    {comment.userName.charAt(0)}
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex justify-between items-baseline">
                      <span className="font-semibold text-slate-700 dark:text-slate-200 text-xs">{comment.userName}</span>
                      <span className="text-[10px] text-slate-400">{new Date(comment.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">{comment.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Comment Input */}
          {!isNew && (
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                  placeholder="Add a comment..."
                  className="flex-1 px-3 py-2 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors disabled:opacity-40"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}