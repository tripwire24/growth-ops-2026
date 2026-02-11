
import React, { useEffect, useState } from 'react';
import { Layers, Database, Plus, Menu, User, BarChart2, Moon, Sun, AlertTriangle, Layout as LayoutIcon, Settings, ChevronRight, LogOut } from 'lucide-react';
import { Board, UserProfile } from '../types';
import { ProfileModal } from './ProfileModal';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'kanban' | 'vault' | 'analytics';
  setActiveTab: (tab: 'kanban' | 'vault' | 'analytics') => void;
  onNewExperiment: () => void;
  isMockMode?: boolean;
  onConnect?: () => void;
  // Board Props
  boards: Board[];
  activeBoardId: string;
  onSwitchBoard: (id: string) => void;
  onCreateBoard: () => void;
  onEditBoard: (board: Board) => void;
  // Profile Props
  userProfile: UserProfile | null;
  onUpdateProfile: (name: string, avatar: string) => Promise<void>;
  onLogout: () => void;
}

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
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

export const Layout: React.FC<LayoutProps> = ({ 
  children, activeTab, setActiveTab, onNewExperiment, isMockMode, onConnect,
  boards, activeBoardId, onSwitchBoard, onCreateBoard, onEditBoard,
  userProfile, onUpdateProfile, onLogout
}) => {
  
  const currentBoard = boards.find(b => b.id === activeBoardId);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const displayName = userProfile?.full_name || (isMockMode ? 'Guest User' : 'Set your name');
  const displayStatus = isMockMode ? 'Demo Mode' : (userProfile?.full_name ? 'Online' : 'Incomplete Profile');

  return (
    <div className="flex h-screen w-screen bg-slate-50 dark:bg-slate-950 overflow-hidden flex-col md:flex-row">
      
      {/* Mock Mode Banner */}
      {isMockMode && (
        <div className="bg-indigo-600 text-white text-xs font-medium px-4 py-2 flex justify-between items-center md:hidden shrink-0">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-indigo-200" />
            <span>Demo Mode</span>
          </div>
          <button onClick={onConnect} className="bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-[10px] uppercase tracking-wide border border-white/20">
            Connect DB
          </button>
        </div>
      )}

      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white border-r border-slate-800 shrink-0">
        <div className="p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="font-bold text-white">G</span>
            </div>
            <h1 className="font-bold text-lg tracking-tight">Growth Ops</h1>
          </div>
        </div>
        
        {/* Board Switcher Section */}
        <div className="px-4 pt-6 pb-2">
           <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
             <span>Boards</span>
             <button onClick={onCreateBoard} className="text-indigo-400 hover:text-indigo-300">
               <Plus size={14} />
             </button>
           </div>
           <div className="space-y-1">
             {boards.map(board => (
               <div key={board.id} className="group flex items-center gap-2">
                 <button 
                  onClick={() => onSwitchBoard(board.id)}
                  className={`flex-1 text-left px-2 py-1.5 rounded text-sm transition-colors truncate flex items-center gap-2 ${activeBoardId === board.id ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-300'}`}
                 >
                   <span className={`w-1.5 h-1.5 rounded-full ${activeBoardId === board.id ? 'bg-indigo-500' : 'bg-slate-600'}`}></span>
                   {board.name}
                 </button>
                 <button 
                   onClick={() => onEditBoard(board)}
                   className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-white transition-opacity"
                 >
                   <Settings size={12} />
                 </button>
               </div>
             ))}
           </div>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-4 px-2">Views</div>
          <button 
            onClick={() => setActiveTab('kanban')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${activeTab === 'kanban' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}`}
          >
            <Layers size={18} />
            <span className="font-medium text-sm">Board</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('vault')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${activeTab === 'vault' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}`}
          >
            <Database size={18} />
            <span className="font-medium text-sm">Vault</span>
          </button>

          <button 
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${activeTab === 'analytics' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}`}
          >
            <BarChart2 size={18} />
            <span className="font-medium text-sm">Analytics</span>
          </button>
        </nav>

        {isMockMode && (
          <div className="mx-4 mb-4 p-3 bg-indigo-900/30 border border-indigo-500/30 rounded-lg">
             <div className="flex items-start gap-2 mb-2">
               <AlertTriangle size={16} className="text-indigo-400 mt-0.5" />
               <div className="text-xs text-indigo-200">
                 <p className="font-bold">Demo Mode</p>
                 <p className="opacity-80 leading-relaxed">Data is local. Connect Supabase to save & sync.</p>
               </div>
             </div>
             <button 
               onClick={onConnect}
               className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded shadow-sm transition-colors"
             >
               Connect Database
             </button>
          </div>
        )}

        <div className="p-4 border-t border-slate-800 flex items-center gap-2">
           <button 
             onClick={() => setIsProfileOpen(true)}
             className="flex-1 flex items-center gap-3 text-slate-400 hover:text-white transition-colors text-left group"
           >
             <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0 overflow-hidden border border-slate-600 group-hover:border-indigo-500 transition-colors">
               {userProfile?.avatar_url ? (
                 <img src={userProfile.avatar_url} alt="Av" className="w-full h-full object-cover" />
               ) : (
                 <User size={16} />
               )}
             </div>
             <div className="text-sm overflow-hidden flex-1">
               <p className="font-medium truncate">{displayName}</p>
               <p className="text-xs text-slate-500 truncate">{displayStatus}</p>
             </div>
             <Settings size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          
          <div className="h-6 w-px bg-slate-800 mx-1"></div>
          
          <ThemeToggle />
          
          <button 
             onClick={onLogout}
             className="p-2 text-slate-400 hover:text-red-400 transition-colors"
             title="Log Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-full">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2">
             <span className="font-bold text-sm bg-slate-800 px-2 py-1 rounded truncate max-w-[120px]">
               {currentBoard?.name}
             </span>
             <ChevronRight size={14} className="text-slate-500" />
             <span className="text-xs text-slate-400 uppercase tracking-wide">
               {activeTab}
             </span>
          </div>
          <div className="flex gap-2">
            <ThemeToggle />
            <button 
              onClick={() => setIsProfileOpen(true)}
              className="text-slate-300"
            >
              <Menu size={24} />
            </button>
          </div>
        </header>
        
        {/* Tab Switcher for Mobile */}
        <div className="md:hidden flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
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
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white hidden md:block">
              {activeTab === 'kanban' ? currentBoard?.name : activeTab === 'vault' ? 'Knowledge Vault' : 'Analytics Dashboard'}
            </h2>
            {activeTab === 'kanban' && currentBoard?.description && (
              <p className="text-xs text-slate-500 hidden md:block mt-0.5">{currentBoard.description}</p>
            )}
             {(activeTab === 'vault' || activeTab === 'analytics') && currentBoard && (
               <p className="text-xs text-slate-500 hidden md:block mt-0.5">Filtered by: <span className="font-semibold">{currentBoard.name}</span></p>
            )}
          </div>
          
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
      
      {/* Profile Modal */}
      <ProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)}
        profile={userProfile}
        onSave={onUpdateProfile}
        onLogout={onLogout}
      />
    </div>
  );
};
