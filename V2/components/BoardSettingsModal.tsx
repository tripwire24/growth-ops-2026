// ==========================================
// BoardSettingsModal — Configure metrics & dimensions per board
// ==========================================
import React, { useState, useEffect } from 'react';
import { Board, BoardConfig, MetricDefinition, DimensionDefinition, DEFAULT_DIMENSIONS, DEFAULT_BOARD_CONFIG } from '../types';
import { X, Plus, Trash2, Settings, Ruler, BarChart3, GripVertical, Info, ToggleLeft, ToggleRight } from 'lucide-react';

interface BoardSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  board: Board | null;
  onSave: (boardId: string, config: BoardConfig) => void;
}

// --- Metric Row Editor ---
const MetricRow: React.FC<{
  metric: MetricDefinition;
  onChange: (updated: MetricDefinition) => void;
  onDelete: () => void;
}> = ({ metric, onChange, onDelete }) => (
  <div className="flex items-center gap-2 group">
    <GripVertical size={14} className="text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 cursor-grab" />
    <input
      type="text"
      value={metric.name}
      onChange={e => onChange({ ...metric, name: e.target.value })}
      placeholder="Metric name"
      className="flex-1 px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
    />
    <input
      type="text"
      value={metric.unit}
      onChange={e => onChange({ ...metric, unit: e.target.value })}
      placeholder="Unit"
      className="w-16 px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-center"
    />
    <input
      type="text"
      value={metric.description || ''}
      onChange={e => onChange({ ...metric, description: e.target.value })}
      placeholder="Description (optional)"
      className="flex-1 px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
    />
    <button
      onClick={onDelete}
      className="p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded"
      title="Remove metric"
    >
      <Trash2 size={14} />
    </button>
  </div>
);

// --- Dimension Row Editor ---
const DimensionRow: React.FC<{
  dimension: DimensionDefinition;
  onChange: (updated: DimensionDefinition) => void;
  onDelete: () => void;
  canDelete: boolean;
}> = ({ dimension, onChange, onDelete, canDelete }) => (
  <div className="flex items-center gap-2 group">
    <GripVertical size={14} className="text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 cursor-grab" />
    <input
      type="text"
      value={dimension.name}
      onChange={e => onChange({ ...dimension, name: e.target.value })}
      placeholder="Dimension name"
      className="flex-1 px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
    />
    <div className="flex items-center gap-1">
      <input
        type="number"
        value={dimension.min}
        onChange={e => onChange({ ...dimension, min: parseInt(e.target.value) || 0 })}
        className="w-14 px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-center"
      />
      <span className="text-xs text-slate-400">to</span>
      <input
        type="number"
        value={dimension.max}
        onChange={e => onChange({ ...dimension, max: parseInt(e.target.value) || 10 })}
        className="w-14 px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-center"
      />
    </div>
    {canDelete ? (
      <button
        onClick={onDelete}
        className="p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded"
        title="Remove dimension"
      >
        <Trash2 size={14} />
      </button>
    ) : (
      <div className="w-8" />
    )}
  </div>
);

// --- Main Component ---
export const BoardSettingsModal: React.FC<BoardSettingsModalProps> = ({ isOpen, onClose, board, onSave }) => {
  const [config, setConfig] = useState<BoardConfig>(DEFAULT_BOARD_CONFIG);

  useEffect(() => {
    if (board) {
      setConfig(board.config || DEFAULT_BOARD_CONFIG);
    }
  }, [board, isOpen]);

  if (!isOpen || !board) return null;

  const generateId = () => Math.random().toString(36).substr(2, 9);

  // --- Metric Handlers ---
  const addMetric = () => {
    setConfig(prev => ({
      ...prev,
      metrics: [...prev.metrics, { id: generateId(), name: '', unit: '', description: '' }],
    }));
  };

  const updateMetric = (index: number, updated: MetricDefinition) => {
    setConfig(prev => ({
      ...prev,
      metrics: prev.metrics.map((m, i) => (i === index ? updated : m)),
    }));
  };

  const deleteMetric = (index: number) => {
    setConfig(prev => ({
      ...prev,
      metrics: prev.metrics.filter((_, i) => i !== index),
    }));
  };

  // --- Dimension Handlers ---
  const addDimension = () => {
    setConfig(prev => ({
      ...prev,
      dimensions: [...prev.dimensions, { id: generateId(), name: '', description: '', min: 1, max: 10 }],
    }));
  };

  const updateDimension = (index: number, updated: DimensionDefinition) => {
    setConfig(prev => ({
      ...prev,
      dimensions: prev.dimensions.map((d, i) => (i === index ? updated : d)),
    }));
  };

  const deleteDimension = (index: number) => {
    setConfig(prev => ({
      ...prev,
      dimensions: prev.dimensions.filter((_, i) => i !== index),
    }));
  };

  const toggleCustomDimensions = () => {
    setConfig(prev => ({
      ...prev,
      useCustomDimensions: !prev.useCustomDimensions,
      dimensions: !prev.useCustomDimensions ? prev.dimensions : DEFAULT_DIMENSIONS,
    }));
  };

  const handleSave = () => {
    // Filter out empty metrics/dimensions
    const cleanConfig: BoardConfig = {
      ...config,
      metrics: config.metrics.filter(m => m.name.trim()),
      dimensions: config.dimensions.filter(d => d.name.trim()),
    };
    onSave(board.id, cleanConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <Settings size={16} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white">Board Settings</h3>
              <p className="text-xs text-slate-500">{board.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* METRICS SECTION */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 size={18} className="text-indigo-600 dark:text-indigo-400" />
                <h4 className="font-semibold text-slate-800 dark:text-white">Tracking Metrics</h4>
              </div>
              <button
                onClick={addMetric}
                className="flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
              >
                <Plus size={14} /> Add Metric
              </button>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 p-3">
              <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3 px-7">
                <span className="flex-1">Name</span>
                <span className="w-16 text-center">Unit</span>
                <span className="flex-1">Description</span>
                <span className="w-8"></span>
              </div>
              
              {config.metrics.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-sm">
                  <BarChart3 size={24} className="mx-auto mb-2 opacity-40" />
                  <p>No metrics configured yet.</p>
                  <p className="text-xs mt-1">Add metrics like "Conversion Rate", "MRR", or "Churn %" to track baselines and targets per experiment.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {config.metrics.map((metric, i) => (
                    <MetricRow
                      key={metric.id}
                      metric={metric}
                      onChange={updated => updateMetric(i, updated)}
                      onDelete={() => deleteMetric(i)}
                    />
                  ))}
                </div>
              )}
            </div>
            
            {/* Quick-add presets */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider mr-1 self-center">Quick add:</span>
              {[
                { name: 'Conversion Rate', unit: '%' },
                { name: 'MRR', unit: '$' },
                { name: 'CAC', unit: '$' },
                { name: 'LTV', unit: '$' },
                { name: 'Churn Rate', unit: '%' },
                { name: 'NPS', unit: 'pts' },
                { name: 'DAU', unit: 'users' },
                { name: 'ARPU', unit: '$' },
              ]
                .filter(preset => !config.metrics.some(m => m.name === preset.name))
                .map(preset => (
                  <button
                    key={preset.name}
                    onClick={() => {
                      setConfig(prev => ({
                        ...prev,
                        metrics: [...prev.metrics, { id: generateId(), ...preset, description: '' }],
                      }));
                    }}
                    className="px-2 py-1 text-[11px] font-medium rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-indigo-300 hover:text-indigo-600 dark:hover:border-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    + {preset.name}
                  </button>
                ))}
            </div>
          </section>

          {/* DIMENSIONS SECTION */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Ruler size={18} className="text-indigo-600 dark:text-indigo-400" />
                <h4 className="font-semibold text-slate-800 dark:text-white">Scoring Dimensions</h4>
              </div>
              <button
                onClick={toggleCustomDimensions}
                className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-colors"
              >
                {config.useCustomDimensions ? (
                  <><ToggleRight size={18} className="text-indigo-600" /> Custom</>
                ) : (
                  <><ToggleLeft size={18} /> Default ICE</>
                )}
              </button>
            </div>

            {!config.useCustomDimensions ? (
              <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info size={16} className="text-indigo-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Using default ICE scoring</p>
                    <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70 mt-1">
                      Impact, Confidence, and Ease — each scored 1-10. Toggle to "Custom" to define your own scoring dimensions like Revenue Potential, Strategic Alignment, etc.
                    </p>
                    <div className="flex gap-3 mt-3">
                      {DEFAULT_DIMENSIONS.map(d => (
                        <span key={d.id} className="px-2 py-1 bg-indigo-100 dark:bg-indigo-800/30 rounded text-xs font-medium text-indigo-700 dark:text-indigo-300">
                          {d.name} ({d.min}-{d.max})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3 px-7">
                  <span className="flex-1">Name</span>
                  <span className="w-32 text-center">Scale</span>
                  <span className="w-8"></span>
                </div>
                
                <div className="space-y-2">
                  {config.dimensions.map((dim, i) => (
                    <DimensionRow
                      key={dim.id}
                      dimension={dim}
                      onChange={updated => updateDimension(i, updated)}
                      onDelete={() => deleteDimension(i)}
                      canDelete={config.dimensions.length > 1}
                    />
                  ))}
                </div>

                <button
                  onClick={addDimension}
                  className="flex items-center gap-1 mt-3 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                >
                  <Plus size={14} /> Add Dimension
                </button>
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900 rounded-b-xl shrink-0">
          <p className="text-xs text-slate-400">
            {config.metrics.filter(m => m.name.trim()).length} metrics · {config.dimensions.filter(d => d.name.trim()).length} dimensions
          </p>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-md transition-colors"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
