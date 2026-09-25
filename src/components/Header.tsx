import React from 'react';
import { Sparkles, Plus, BookOpen, BrainCircuit, HelpCircle, Layers, BarChart3, BookmarkCheck } from 'lucide-react';

interface HeaderProps {
  activeTab: 'sets' | 'editor' | 'summary' | 'quiz' | 'flashcards' | 'tutor' | 'analytics' | 'mindmap';
  setActiveTab: (tab: 'sets' | 'editor' | 'summary' | 'quiz' | 'flashcards' | 'tutor' | 'analytics' | 'mindmap') => void;
  onNewNote: () => void;
  activeNoteTitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onNewNote, activeNoteTitle }) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Zone 1: Single text wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => setActiveTab('sets')}
            className="text-left group flex items-center gap-2.5"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <BrainCircuit className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white font-display group-hover:text-indigo-300 transition-colors">
                StudyMind AI
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: 4-6 nav links */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-medium text-slate-300">
          <button
            onClick={() => setActiveTab('sets')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'sets'
                ? 'bg-slate-800/80 text-indigo-300 font-semibold shadow-sm'
                : 'hover:text-white hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>Study Sets</span>
          </button>

          <button
            onClick={() => setActiveTab('summary')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'summary'
                ? 'bg-slate-800/80 text-indigo-300 font-semibold shadow-sm'
                : 'hover:text-white hover:bg-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Summarizer</span>
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'quiz'
                ? 'bg-slate-800/80 text-indigo-300 font-semibold shadow-sm'
                : 'hover:text-white hover:bg-slate-900'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>Practice Quiz</span>
          </button>

          <button
            onClick={() => setActiveTab('flashcards')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'flashcards'
                ? 'bg-slate-800/80 text-indigo-300 font-semibold shadow-sm'
                : 'hover:text-white hover:bg-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Flashcards</span>
          </button>

          <button
            onClick={() => setActiveTab('tutor')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'tutor'
                ? 'bg-slate-800/80 text-indigo-300 font-semibold shadow-sm'
                : 'hover:text-white hover:bg-slate-900'
            }`}
          >
            <BrainCircuit className="w-4 h-4 text-purple-400" />
            <span>AI Tutor</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'analytics'
                ? 'bg-slate-800/80 text-indigo-300 font-semibold shadow-sm'
                : 'hover:text-white hover:bg-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-rose-400" />
            <span>Analytics</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-2">
          {activeNoteTitle && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-400 truncate max-w-[200px]">
              <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">{activeNoteTitle}</span>
            </div>
          )}

          <button
            onClick={onNewNote}
            className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-indigo-600/20 whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Note</span>
          </button>
        </div>

      </div>

      {/* Secondary Mobile Navigation Row */}
      <div className="lg:hidden flex items-center gap-1 px-4 py-2 bg-slate-900/90 border-t border-slate-800/60 overflow-x-auto text-xs no-scrollbar">
        <button
          onClick={() => setActiveTab('sets')}
          className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'sets' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'
          }`}
        >
          Study Sets
        </button>
        <button
          onClick={() => setActiveTab('summary')}
          className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'summary' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'
          }`}
        >
          Summarizer
        </button>
        <button
          onClick={() => setActiveTab('quiz')}
          className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'quiz' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'
          }`}
        >
          Practice Quiz
        </button>
        <button
          onClick={() => setActiveTab('flashcards')}
          className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'flashcards' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'
          }`}
        >
          Flashcards
        </button>
        <button
          onClick={() => setActiveTab('tutor')}
          className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'tutor' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'
          }`}
        >
          AI Tutor
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'analytics' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'
          }`}
        >
          Analytics
        </button>
      </div>
    </header>
  );
};
