import React, { useState } from 'react';
import { StudySet, SubjectCategory } from '../types/study';
import { SubjectBadge } from './SubjectBadge';
import { Search, Sparkles, HelpCircle, Layers, BookOpen, Plus, Clock, FileText, ArrowRight, BrainCircuit } from 'lucide-react';

interface StudySetsListProps {
  studySets: StudySet[];
  onSelectSet: (set: StudySet) => void;
  onOpenQuiz: (set: StudySet) => void;
  onOpenFlashcards: (set: StudySet) => void;
  onNewNote: () => void;
}

export const StudySetsList: React.FC<StudySetsListProps> = ({
  studySets,
  onSelectSet,
  onOpenQuiz,
  onOpenFlashcards,
  onNewNote
}) => {
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');

  const filteredSets = studySets.filter((set) => {
    const matchesSearch =
      set.title.toLowerCase().includes(search.toLowerCase()) ||
      set.content.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = selectedSubject === 'All' || set.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const subjects = ['All', 'Biology', 'Computer Science', 'History', 'Economics', 'Physics & Math', 'Languages', 'General Notes'];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-950 rounded-2xl border border-indigo-500/20 p-8 sm:p-10 shadow-2xl space-y-4">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/40 border border-indigo-700/40 text-xs font-semibold text-indigo-300">
            <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Automated Study Companion</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight leading-tight">
            Transform Any Notes into Mastered Knowledge
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Summarize lecture notes, generate practice quizzes with explanations, study interactive flashcards, and chat with an AI tutor.
          </p>
        </div>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            onClick={onNewNote}
            className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Summarize New Notes</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search study sets..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Subject Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                selectedSubject === sub
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

      </div>

      {/* Study Sets Grid */}
      {filteredSets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSets.map((set) => {
            const cardCount = set.flashcards?.length || 0;
            const quizCount = set.quiz?.questions.length || 0;

            return (
              <div
                key={set.id}
                onClick={() => onSelectSet(set)}
                className="bg-slate-900 rounded-2xl border border-slate-800/80 hover:border-indigo-500/50 p-6 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <SubjectBadge subject={set.subject} />
                    <span className="font-mono text-[11px]">
                      {set.wordCount} words
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white font-display group-hover:text-indigo-300 transition-colors line-clamp-2">
                    {set.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {set.summary?.overview || set.content}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/80 space-y-3">
                  {/* Status indicators */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                      {quizCount > 0 ? `${quizCount} Questions` : 'No Quiz'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-emerald-400" />
                      {cardCount > 0 ? `${cardCount} Cards` : 'No Cards'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectSet(set);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-indigo-950 border border-indigo-800/60 text-indigo-300 hover:bg-indigo-900/60 text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      <span>Study Guide</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    {quizCount > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenQuiz(set);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-950/40 border border-amber-800/40 text-amber-300 hover:bg-amber-900/60 text-xs font-semibold transition-colors"
                      >
                        Quiz
                      </button>
                    )}

                    {cardCount > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenFlashcards(set);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 hover:bg-emerald-900/60 text-xs font-semibold transition-colors"
                      >
                        Cards
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-slate-900 rounded-2xl border border-slate-800 space-y-4">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white font-display">
            No Study Sets Found
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            No study sets matched your filter. Paste or upload notes to create a new study set!
          </p>
          <button
            onClick={onNewNote}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Study Set</span>
          </button>
        </div>
      )}

    </div>
  );
};
