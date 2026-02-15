
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { isSupabaseConfigured } from '../services/supabase';
import { Mail, Lock, ArrowRight, AlertCircle, Database, Settings, Key, ArrowLeft, ExternalLink, CheckCircle, RefreshCw, Globe, Wand2, UserPlus, LogIn, LayoutTemplate, User } from 'lucide-react';

interface AuthPageProps {
  onBackToDemo?: () => void;
  onContinueAsGuest?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onBackToDemo, onContinueAsGuest }) => {
  const { signInWithPassword, signUp, signInWithMagicLink } = useAuth();
  
  // UI State
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'magic'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  // Status State
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (authMode === 'signin') {
        await signInWithPassword(email, password);
        // Auth state change will trigger redirect automatically via App.tsx
      } else if (authMode === 'signup') {
        await signUp(email, password, fullName);
        setSuccessMessage('Account created! Please check your email to confirm your account before logging in.');
        setAuthMode('signin'); // Switch to sign in view
      } else if (authMode === 'magic') {
        await signInWithMagicLink(email);
        setSuccessMessage(`Magic link sent to ${email}. Check your inbox!`);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // 1. SETUP INSTRUCTIONS (If no keys)
  if (!isSupabaseConfigured) {
    const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'https://your-app.vercel.app';

    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-white font-sans">
        <div className="max-w-5xl w-full space-y-8 animate-in fade-in zoom-in-95 duration-300">
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
                  <div className="bg-slate-950 rounded px-2 py-2 text-xs text-slate-400 font-mono break-all border border-slate-800 select-all mt-auto group relative">
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

               <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex flex-col ring-1 ring-yellow-500/30 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-1.5 bg-yellow-500/10 rounded-bl-lg border-b border-l border-yellow-500/20">
                    <AlertCircle size={12} className="text-yellow-500" />
                  </div>
                  <h3 className="font-semibold text-slate-200 flex items-center gap-2 mb-2">
                    <Globe size={16} className="text-yellow-400" />
                    3. Auth URL
                  </h3>
                  <p className="text-[10px] text-slate-500 mb-2 uppercase tracking-wide">Auth &gt; URL Configuration</p>
                  <div className="text-xs text-slate-400 mb-2">
                    Paste this into <strong>Site URL</strong> and <strong>Redirect URLs</strong>:
                  </div>
                  <div className="bg-slate-950 rounded px-2 py-2 text-xs text-slate-300 font-mono break-all border border-slate-800 select-all mt-auto flex justify-between items-center gap-2">
                    <span>{currentUrl}</span>
                  </div>
               </div>
             </div>

             <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800/50 rounded-lg text-sm text-blue-200 max-w-2xl mx-auto">
                <p className="flex items-center justify-center gap-2">
                  <AlertCircle size={16} />
                  <strong>Deployed to Vercel?</strong> Don't forget to add these keys in your Vercel Project Settings &gt; Environment Variables.
                </p>
             </div>

             <button onClick={() => window.location.reload()} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors border border-slate-700 w-full sm:w-auto">
               I've Updated My Keys (Reload)
             </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. SUCCESS STATE (Magic Link Sent or Account Created)
  if (successMessage && !loading && authMode !== 'signin') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden p-8 text-center animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Success!</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {successMessage}
          </p>
          
          <button 
            onClick={() => {
              setSuccessMessage(null);
              setAuthMode('signin');
            }}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-indigo-500/30 transition-all"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  // 3. MAIN AUTH FORM
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
              <span className="font-bold text-white text-xl">G</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Growth Ops</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Experiment Management System</p>
          </div>

          {/* Tab Switcher */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg mb-6">
            <button 
              onClick={() => { setAuthMode('signin'); setError(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${authMode === 'signin' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              <LogIn size={14} /> Sign In
            </button>
            <button 
              onClick={() => { setAuthMode('signup'); setError(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${authMode === 'signup' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              <UserPlus size={14} /> Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {successMessage && authMode === 'signin' && (
               <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg flex items-start gap-2 text-sm mb-4">
                <CheckCircle size={16} className="mt-0.5 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* FULL NAME FIELD (SIGNUP ONLY) */}
            {authMode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
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

            {authMode !== 'magic' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

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
              {loading ? 'Processing...' : authMode === 'signin' ? 'Sign In' : authMode === 'signup' ? 'Create Account' : 'Send Magic Link'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          {/* Switch to Magic Link */}
          {authMode !== 'magic' && authMode === 'signin' && (
            <div className="mt-6 text-center">
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white dark:bg-slate-900 text-slate-500">Or continue with</span>
                </div>
              </div>
              <button 
                onClick={() => { setAuthMode('magic'); setError(null); }}
                className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm font-medium flex items-center justify-center gap-2 mx-auto transition-colors"
              >
                <Wand2 size={14} />
                Send a Magic Link instead
              </button>
            </div>
          )}
           {authMode === 'magic' && (
             <button 
                onClick={() => { setAuthMode('signin'); setError(null); }}
                className="mt-6 w-full text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
              >
                Use Password
              </button>
           )}
           
           {/* GUEST MODE BUTTON */}
           {onContinueAsGuest && authMode !== 'magic' && (
             <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
               <button 
                 onClick={onContinueAsGuest}
                 className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 group"
               >
                 <LayoutTemplate size={16} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                 Skip Login (Try Demo Mode)
               </button>
             </div>
           )}

        </div>
      </div>
    </div>
  );
};
