
import React, { useState } from 'react';
import { X, Copy, Mail, Check, UserPlus, Link as LinkIcon } from 'lucide-react';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InviteModal: React.FC<InviteModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const appUrl = window.location.origin;
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmail = () => {
    const subject = encodeURIComponent("Join me on Growth Ops");
    const body = encodeURIComponent(`Hey,\n\nI'm using Growth Ops to manage our experiments and I'd like you to join the team.\n\nYou can sign up here:\n${appUrl}\n\nSee you there!`);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <UserPlus size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Invite Team Member</h3>
              <p className="text-xs text-slate-500">Add collaborators to your board</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Method 1: Copy Link */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Share Invite Link
            </label>
            <div className="flex gap-2">
              <div className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-600 dark:text-slate-300 truncate font-mono flex items-center gap-2">
                <LinkIcon size={14} className="text-slate-400 shrink-0" />
                {appUrl}
              </div>
              <button
                onClick={handleCopyLink}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  copied 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-900 px-2 text-slate-500">Or send via email</span>
            </div>
          </div>

          {/* Method 2: Send Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              />
              <button
                onClick={handleSendEmail}
                disabled={!email.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm shadow-lg shadow-indigo-500/20"
              >
                <Mail size={16} />
                Send Invitation
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 text-center">
              This will open your default email client with a pre-filled message.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
