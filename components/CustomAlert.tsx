
import React from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface CustomAlertProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'error' | 'success' | 'info';
}

export const CustomAlert: React.FC<CustomAlertProps> = ({ isOpen, onClose, title, message, type = 'info' }) => {
  if (!isOpen) return null;

  const bgColors = {
    error: 'bg-red-50 dark:bg-red-900/20',
    success: 'bg-emerald-50 dark:bg-emerald-900/20',
    info: 'bg-slate-50 dark:bg-slate-900/50'
  };

  const textColors = {
    error: 'text-red-800 dark:text-red-200',
    success: 'text-emerald-800 dark:text-emerald-200',
    info: 'text-slate-800 dark:text-slate-200'
  };

  const Icon = type === 'error' ? AlertTriangle : type === 'success' ? CheckCircle : Info;
  const iconColor = type === 'error' ? 'text-red-500' : type === 'success' ? 'text-emerald-500' : 'text-indigo-500';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200 dark:border-slate-800 scale-100 animate-in zoom-in-95 duration-200 ring-1 ring-slate-900/5">
        <div className={`p-6 flex flex-col items-center text-center gap-4`}>
          <div className={`w-16 h-16 rounded-full ${bgColors[type]} flex items-center justify-center mb-2`}>
            <Icon size={32} className={iconColor} />
          </div>
          <div>
            <h3 className={`text-xl font-bold ${textColors[type]} mb-2`}>{title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed px-2">
              {message}
            </p>
          </div>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
          <button 
            onClick={onClose}
            className={`w-full py-3 ${type === 'error' ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98]`}
          >
            Okay
          </button>
        </div>
      </div>
    </div>
  );
};
