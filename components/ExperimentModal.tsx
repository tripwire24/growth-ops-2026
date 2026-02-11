
import React, { useState, useEffect } from 'react';
import { Experiment, ExperimentStatus, MARKETS, TYPES, STATUS_CONFIG, Comment } from '../types';
import { X, Save, Archive, MessageSquare, Paperclip, Send, User, CheckCircle, Lock, Plus, Tag, AlertTriangle, Trash2 } from 'lucide-react';

interface ExperimentModalProps {
  experiment: Experiment | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (experiment: Experiment) => void;
  onArchive: (id: string) => void;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

export const ExperimentModal: React.FC<ExperimentModalProps> = ({ experiment, isOpen, onClose, onSave, onArchive, onComplete, onDelete }) => {
  const [formData, setFormData] = useState<Experiment | null>(null);
  const [newComment, setNewComment] = useState('');
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (experiment) {
      setFormData({ ...experiment });
      setNewComment('');
      setTagInput('');
    }
  }, [experiment]);

  if (!isOpen || !formData) return null;

  const handleChange = (field: keyof Experiment, value: any) => {
    if (formData.locked) return; // Prevent edits if locked
    setFormData(prev => prev ? { ...prev, [field]: value } : null);
  };

  const calculateICE = () => {
    // Average score formatted to 1 decimal
    return ((formData.ice_impact + formData.ice_confidence + formData.ice_ease) / 3).toFixed(1);
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
    if (formData.locked) return;
    setFormData(prev => prev ? { ...prev, tags: prev.tags.filter(t => t !== tagToRemove) } : null);
  };

  const isLearnings = formData.status === 'learnings';
  const showResultSelector = formData.status === 'complete' || isLearnings;
  const isLocked = formData.locked;

  // Archive is ONLY for Learnings
  const canArchive = isLearnings && !formData.archived && !formData.locked;

  const handleDelete = () => {
    if (confirm("Are you sure you want to permanently delete this card? This cannot be undone.")) {
      onDelete(formData.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Left Column: Details (Scrollable) */}
        <div className="flex-1 flex flex-col min-h-0 md:border-r border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
             <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {isLocked ? 'Experiment Archived' : 'Edit Experiment'}
                  </h2>
                  {isLocked && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 text-xs font-medium">
                      <Lock size={10} /> Locked
                    </span>
                  )}
                  {/* Board Badge */}
                  {formData.boardName && (
                      <span className="text-[10px] uppercase bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded font-bold border border-indigo-100 dark:border-indigo-800">
                        {formData.boardName}
                      </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Owner:</span>
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                     <User size={10} className="text-slate-500" />
                     <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{formData.owner}</span>
                  </div>
                </div>
             </div>
             {/* Mobile Close Button */}
            <button onClick={onClose} className="md:hidden text-slate-400 hover:text-slate-600">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={e => handleChange('title', e.target.value)}
                  disabled={isLocked}
                  className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea 
                  value={formData.description} 
                  onChange={e => handleChange('description', e.target.value)}
                  disabled={isLocked}
                  rows={3}
                  className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              {/* Tags Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded text-xs">
                      #{tag}
                      {!isLocked && (
                        <button onClick={() => handleRemoveTag(tag)} className="hover:text-indigo-900 dark:hover:text-indigo-100">
                          <X size={12} />
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
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                      placeholder="Add a tag..."
                      className="flex-1 px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <button onClick={handleAddTag} className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700">
                      <Plus size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                 <select 
                   value={formData.status} 
                   onChange={e => handleChange('status', e.target.value)}
                   disabled={isLocked}
                   className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                 >
                   {Object.keys(STATUS_CONFIG).map(s => (
                     <option key={s} value={s}>{STATUS_CONFIG[s as ExperimentStatus].label}</option>
                   ))}
                 </select>
               </div>
               
               {showResultSelector && (
                 <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Outcome</label>
                    <select 
                      value={formData.result || ''} 
                      onChange={e => handleChange('result', e.target.value || null)}
                      disabled={isLocked}
                      className={`w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-80 disabled:cursor-not-allowed ${
                        formData.result === 'won' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700' :
                        formData.result === 'lost' ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-700' : 
                        'bg-white dark:bg-slate-800'
                      }`}
                    >
                      <option value="">Select Outcome...</option>
                      <option value="won">Won (Validated)</option>
                      <option value="lost">Lost (Invalidated)</option>
                      <option value="inconclusive">Inconclusive</option>
                    </select>
                 </div>
               )}
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Market</label>
                  <select 
                    value={formData.market} 
                    onChange={e => handleChange('market', e.target.value)}
                    disabled={isLocked}
                    className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {MARKETS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
                  <select 
                    value={formData.type} 
                    onChange={e => handleChange('type', e.target.value)}
                    disabled={isLocked}
                    className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
               </div>
             </div>

            {/* ICE Scores */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">ICE Score (Average)</h3>
                <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{calculateICE()}</span>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Impact', key: 'ice_impact' }, 
                  { label: 'Confidence', key: 'ice_confidence' }, 
                  { label: 'Ease', key: 'ice_ease' }
                ].map(metric => (
                  <div key={metric.key} className="flex items-center gap-4">
                    <label className="w-24 text-sm font-medium text-slate-600 dark:text-slate-400">{metric.label}</label>
                    <input 
                      type="range" 
                      min="1" 
                      max="10" 
                      disabled={isLocked}
                      value={formData[metric.key as keyof Experiment] as number}
                      onChange={e => handleChange(metric.key as keyof Experiment, parseInt(e.target.value))}
                      className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 disabled:opacity-50"
                    />
                    <span className="w-8 text-center font-bold text-slate-700 dark:text-slate-300">{formData[metric.key as keyof Experiment]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
           {/* Mobile Footer (in left column flow) */}
          <div className="md:hidden p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-between">
              <button onClick={onClose} className="px-4 py-2 text-slate-600">Close</button>
          </div>
        </div>

        {/* Right Column: Comments & Updates */}
        <div className="hidden md:flex flex-col w-96 bg-slate-50 dark:bg-slate-950">
           <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
             <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
               <MessageSquare size={18} />
               Updates
             </h3>
             <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={24} />
             </button>
           </div>
           
           <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {formData.comments.length === 0 && (
                <div className="text-center py-10 text-slate-400 dark:text-slate-600 text-sm">
                  No updates yet. <br/>Start the conversation!
                </div>
              )}
              {formData.comments.map(comment => (
                <div key={comment.id} className="flex gap-3 text-sm">
                   <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0 font-bold text-slate-500 text-xs">
                     {comment.userName.charAt(0)}
                   </div>
                   <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-baseline">
                         <span className="font-semibold text-slate-800 dark:text-slate-200">{comment.userName}</span>
                         <span className="text-xs text-slate-400">{new Date(comment.timestamp).toLocaleDateString()}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{comment.text}</p>
                   </div>
                </div>
              ))}
           </div>

           <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="flex items-end gap-2 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                <textarea 
                  className="flex-1 bg-transparent border-none focus:ring-0 resize-none text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 max-h-24 p-1"
                  rows={2}
                  placeholder="Type an update..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if(e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                />
                <div className="flex gap-1">
                   <button 
                      onClick={handleAddComment}
                      className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      disabled={!newComment.trim()}
                    >
                      <Send size={16} />
                   </button>
                </div>
              </div>
              
              <div className="mt-4 flex flex-wrap justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800 gap-2">
                {/* Workflow Actions */}
                {!isLocked && (
                  <>
                    {/* Delete Button - Always available but guarded */}
                    <button 
                       onClick={handleDelete}
                       className="flex items-center gap-1 text-red-500 hover:text-red-700 text-xs font-medium px-2 py-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                       title="Delete Permanently"
                    >
                       <Trash2 size={14} />
                       Delete
                    </button>
                    
                    {/* Archive - ONLY FOR LEARNINGS */}
                    {canArchive && (
                        <button 
                          onClick={() => {
                            if(confirm("Archive this experiment to the vault?")) {
                                onArchive(formData.id);
                                onClose();
                            }
                          }}
                          className="flex items-center gap-2 text-orange-600 hover:text-orange-700 text-xs font-medium px-2 py-1 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded transition-colors"
                          title="Archive"
                        >
                          <Archive size={14} />
                          Archive
                        </button>
                    )}
                    
                    {/* Complete & Archive Action for Learnings */}
                    {isLearnings && !formData.locked && !formData.archived && (
                       <button 
                          onClick={() => {
                             if(!formData.result) {
                               alert("Please select an Outcome before completing.");
                               return;
                             }
                             onSave(formData); // Save first
                             onComplete(formData.id); // Then lock
                             onClose();
                          }}
                          className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-bold shadow-sm transition-colors"
                          title="Finalize results and lock card"
                        >
                          <CheckCircle size={14} />
                          Complete
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
                    {!isLocked && (
                      <button 
                        onClick={() => {
                          onSave(formData);
                          onClose();
                        }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium shadow-sm transition-colors"
                      >
                        Save
                      </button>
                    )}
                    {isLocked && (
                       <button 
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md text-sm font-medium transition-colors"
                      >
                        Close
                      </button>
                    )}
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
