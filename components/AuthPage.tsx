import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { isSupabaseConfigured } from '../services/supabase';
import { Lock, Mail, ArrowRight, AlertCircle, Database, Settings, Key } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await signIn(email);
      setMessage({ type: 'success', text: 'Magic link sent! Check your email to login.' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to send login link' });
    } finally {
      setLoading(false);
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-white font-sans">
        <div className="max-w-2xl w-full space-y-8">
           <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-6 shadow-2xl">
             <div className="w-16 h-16 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mx-auto ring-4 ring-indigo-500/10">
               <Database size={32} />
             </div>
             
             <div>
               <h1 className="text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">Setup Required</h1>
               <p className="text-slate-400 text-lg">
                 Connect your Supabase database to start collaborating.
               </p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
               <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                  <h3 className="font-semibold text-slate-200 flex items-center gap-2 mb-2">
                    <Settings size={16} className="text-indigo-400" />
                    1. Get Project URL
                  </h3>
                  <p className="text-xs text-slate-500 mb-3">Go to Settings &gt; API</p>
                  <div className="bg-slate-950 rounded px-2 py-1.5 text-xs text-slate-400 font-mono break-all border border-slate-800">
                    https://your-project.supabase.co
                  </div>
               </div>

               <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                  <h3 className="font-semibold text-slate-200 flex items-center gap-2 mb-2">
                    <Key size={16} className="text-indigo-400" />
                    2. Get Anon Key
                  </h3>
                  <p className="text-xs text-slate-500 mb-3">Go to Settings &gt; API</p>
                  <div className="bg-slate-950 rounded px-2 py-1.5 text-xs text-slate-400 font-mono break-all border border-slate-800">
                    eyJhbGciOiJIUzI1NiIsInR5...
                  </div>
               </div>
             </div>

             <div className="bg-yellow-900/10 border border-yellow-800/30 rounded-lg p-4 flex gap-3 text-left">
               <AlertCircle size={20} className="text-yellow-600 shrink-0" />
               <div className="text-sm">
                 <p className="text-yellow-500 font-medium">Running in Mock Mode</p>
                 <p className="text-yellow-500/60 mt-0.5">
                   Add <code className="text-yellow-500">VITE_SUPABASE_URL</code> and <code className="text-yellow-500">VITE_SUPABASE_ANON_KEY</code> to your environment variables to connect.
                 </p>
               </div>
             </div>

             <button onClick={() => window.location.reload()} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors border border-slate-700">
               Reload Page
             </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
              <span className="font-bold text-white text-xl">G</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Growth Ops</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Log in to collaborate with your team</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            {message && (
              <div className={`p-3 rounded-lg flex items-start gap-2 text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{message.text}</span>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending Magic Link...' : 'Sign In'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-950 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
          Secure passwordless login via Supabase
        </div>
      </div>
    </div>
  );
};