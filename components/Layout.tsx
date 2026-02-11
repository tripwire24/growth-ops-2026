import React, { useEffect, useState } from 'react';
import { Layers, Database, Plus, Menu, User, BarChart2, Moon, Sun } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'kanban' | 'vault' | 'analytics';
  setActiveTab: (tab: 'kanban' | 'vault' | 'analytics') => void;
  onNewExperiment: () => void;
}

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check local storage or system preference
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <button onClick={toggleTheme} className="p-2 text-slate-400 hover:text-white transition-colors">
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, onNewExperiment }) => {
  return (
    <div className="flex h-screen w-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white border-r border-slate-800">
        <div className="p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="font-bold text-white">G</span>
            </div>
            <h1 className="font-bold text-lg tracking-tight">Growth Ops</h1>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('kanban')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${activeTab === 'kanban' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}`}
          >
            <Layers size={20} />
            <span className="font-medium">Board</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('vault')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${activeTab === 'vault' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}`}
          >
            <Database size={20} />
            <span className="font-medium">Vault</span>
          </button>

          <button 
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${activeTab === 'analytics' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}`}
          >
            <BarChart2 size={20} />
            <span className="font-medium">Analytics</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800 flex items-center gap-2">
           <button className="flex-1 flex items-center gap-3 text-slate-400 hover:text-white transition-colors text-left">
             <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
               <User size={16} />
             </div>
             <div className="text-sm overflow-hidden">
               <p className="font-medium truncate">Demo User</p>
               <p className="text-xs text-slate-500 truncate">Growth Lead</p>
             </div>
          </button>
          <ThemeToggle />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded flex items-center justify-center">
              <span className="font-bold text-xs">G</span>
            </div>
            <span className="font-bold">Growth Ops</span>
          </div>
          <div className="flex gap-2">
            <ThemeToggle />
            <button className="text-slate-300">
              <Menu size={24} />
            </button>
          </div>
        </header>
        
        {/* Tab Switcher for Mobile */}
        <div className="md:hidden flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <button 
            onClick={() => setActiveTab('kanban')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 ${activeTab === 'kanban' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 dark:text-slate-400'}`}
          >
            Board
          </button>
          <button 
            onClick={() => setActiveTab('vault')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 ${activeTab === 'vault' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 dark:text-slate-400'}`}
          >
            Vault
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 ${activeTab === 'analytics' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 dark:text-slate-400'}`}
          >
            Analytics
          </button>
        </div>

        {/* Toolbar Area */}
        <div className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 flex items-center justify-between shrink-0">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white hidden md:block">
            {activeTab === 'kanban' ? 'Experiment Board' : activeTab === 'vault' ? 'Knowledge Vault' : 'Analytics Dashboard'}
          </h2>
          <div className="flex gap-3 ml-auto">
             <button 
              onClick={onNewExperiment}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 shadow-sm transition-colors"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">New Experiment</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </div>

        {/* Content View */}
        <div className="flex-1 overflow-hidden relative bg-slate-100 dark:bg-slate-950">
          {children}
        </div>
      </main>
    </div>
  );
};