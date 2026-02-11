import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { isSupabaseConfigured } from '../services/supabase';
import { Mail, ArrowRight, AlertCircle, Database, Settings, Key, ArrowLeft, ExternalLink, CheckCircle, RefreshCw, Globe } from 'lucide-react';

interface AuthPageProps {
  onBackToDemo?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onBackToDemo }) => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signIn(email);
      setIsSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send login link');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setIsSent(false);
    setError(null);
  };

  // 1. SETUP INSTRUCTIONS (If no keys)
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-white font-sans">
        <div className="max-w-4xl w-full space-y-8 animate-in fade-in zoom-in-95 duration-300">
           <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
             
             {/* Back Button */}
             {onBackToDemo && (
                <button 
                  onClick={onBackToDemo}
                  className="absolute top-4 left-4 text-slate-400 hover:text-white flex items-center gap-1 text-sm font-medium transition-colors"
                >
                  <ArrowLeft size={16} />
                  Back to Demo
                </button>
             )}

             <div className="w-16 h-16 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mx-auto ring-4 ring-indigo-500/10">
               <Database size={32} />
             </div>
             
             <div>
               <h1 className="text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">Setup Required</h1>
               <p className="text-slate-400 text-lg">
                 Connect your Supabase database to start collaborating.
               </p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
               <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex flex-col">
                  <h3 className="font-semibold text-slate-200 flex items-center gap-2 mb-2">
                    <Settings size={16} className="text-indigo-400" />
                    1. Project URL
                  </h3>
                  <p className="text-[10px] text-slate-500 mb-2 uppercase tracking-wide">Connect &gt; Project URL</p>
                  <div className="bg-slate-950 rounded px-2 py-2 text-xs text-slate-400 font-mono break-all border border-slate-800 select-all mt-auto">
                    https://your-project.supabase.co
                  </div>
               </div>

               <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex flex-col">
                  <h3 className="font-semibold text-slate-200 flex items-center gap-2 mb-2">
                    <Key size={16} className="text-indigo-400" />
                    2. Publishable Key
                  </h3>
                  <p className="text-[10px] text-slate-500 mb-2 uppercase tracking-wide">Connect &gt; Publishable Key</p>
                  <div className="bg-slate-950 rounded px-2 py-2 text-xs text-slate-400 font-mono break-all border border-slate-800 select-all mt-auto">
                    sb_publishable_...
                  </div>
               </div>

               <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex flex-col ring-1 ring-yellow-500/30">
                  <h3 className="font-semibold text-slate-200 flex items-center gap-2 mb-2">
                    <Globe size={16} className="text-yellow-400" />
                    3. Auth URL
                  </h3>
                  <p className="text-[10px] text-slate-500 mb-2 uppercase tracking-wide">Auth &gt; URL Configuration</p>
                  <div className="text-xs text-slate-300 leading-relaxed mt-auto">
                    Add your Vercel URL to <strong>Site URL</strong> and <strong>Redirect URLs</strong> to prevent localhost errors.
                  </div>
               </div>
             </div>

             <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-lg p-4 flex gap-3 text-left">
               <ExternalLink size={20} className="text-indigo-400 shrink-0 mt-0.5" />
               <div className="text-sm">
                 <p className="text-indigo-300 font-medium">Add to Vercel Environment Variables</p>
                 <div className="mt-2 space-y-2 font-mono text-xs">
                    <div className="flex gap-2">
                        <span className="text-slate-500 select-none">Key:</span>
                        <span className="text-yellow-400">VITE_SUPABASE_URL</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="text-slate-500 select-none">Key:</span>
                        <span className="text-yellow-400">VITE_SUPABASE_ANON_KEY</span>
                    </div>
                 </div>
               </div>
             </div>

             <button onClick={() => window.location.reload()} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors border border-slate-700 w-full sm:w-auto">
               I've Updated My Keys (Reload)
             </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. EMAIL SENT STATE
  if (isSent) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden p-8 text-center animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Check your email</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            We've sent a magic link to <span className="font-semibold text-slate-900 dark:text-slate-200">{email}</span>
          </p>
          
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 text-left text-sm space-y-3 mb-6 border border-slate-100 dark:border-slate-700">
             <div className="flex gap-2">
               <AlertCircle size={16} className="text-indigo-500 shrink-0 mt-0.5" />
               <p className="text-slate-600 dark:text-slate-300">
                 <strong>Not receiving it?</strong> Check your Spam folder.
               </p>
             </div>
             <div className="flex gap-2">
               <AlertCircle size={16} className="text-indigo-500 shrink-0 mt-0.5" />
               <p className="text-slate-600 dark:text-slate-300">
                 <strong>Using Free Tier?</strong> Supabase limits emails to 3 per hour. Check your Logs if it fails.
               </p>
             </div>
          </div>

          <button 
            onClick={handleRetry}
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium text-sm flex items-center justify-center gap-2 mx-auto"
          >
            <RefreshCw size={14} />
            Try another email
          </button>
        </div>
      </div>
    );
  }

  // 3. LOGIN FORM
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

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg flex items-start gap-2 text-sm">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
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