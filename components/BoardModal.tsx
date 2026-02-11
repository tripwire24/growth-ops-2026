
import React, { useState, useEffect } from 'react';
import { Board } from '../types';
import { X } from 'lucide-react';

interface BoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description: string) => void;
  initialBoard?: Board;
}

export const BoardModal: React.FC<BoardModalProps> = ({ isOpen, onClose, onSave, initialBoard }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (initialBoard) {
        setName(initialBoard.name);
        setDescription(initialBoard.description);
    } else {
        setName('');
        setDescription('');
    }
  }, [initialBoard, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
           <h3 className="font-bold text-slate-800 dark:text-white">{initialBoard ? 'Edit Board' : 'New Board'}</h3>
           <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
             <X size={20} />
           </button>
        </div>
        <div className="p-4 space-y-4">
           <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Board Name</label>
              <input 
                 type="text" 
                 className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                 placeholder="e.g. Growth Team"
                 value={name}
                 onChange={(e) => setName(e.target.value)}
                 autoFocus
              />
           </div>
           <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
              <textarea 
                 className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                 rows={3}
                 placeholder="What is this board for?"
                 value={description}
                 onChange={(e) => setDescription(e.target.value)}
              />
           </div>
        </div>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 bg-slate-50 dark:bg-slate-900 rounded-b-xl">
           <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">Cancel</button>
           <button 
             onClick={() => {
                 if (name.trim()) {
                     onSave(name, description);
                     onClose();
                 }
             }}
             disabled={!name.trim()}
             className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-md disabled:opacity-50"
           >
             Save Board
           </button>
        </div>
      </div>
    </div>
  );
};
