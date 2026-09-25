import React from 'react';
import { QuizResult, StudyStats } from '../types/study';
import { Trophy, Flame, BookOpen, Layers, Target, Trash2 } from 'lucide-react';

interface AnalyticsViewProps {
  stats: StudyStats;
  quizResults: QuizResult[];
  onClearData?: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ stats, quizResults, onClearData }) => {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Title */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl flex items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-rose-400 uppercase tracking-wider font-semibold block">
            Performance Dashboard
          </span>
          <h2 className="text-2xl font-bold text-white font-display">
            Study Progress & Mastery Metrics
          </h2>
        </div>

        {onClearData && (
          <button
            onClick={onClearData}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/80 border border-slate-700 hover:border-rose-800/80 text-slate-300 hover:text-rose-300 text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Clear All Data</span>
          </button>
        )}
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-amber-400">
            <Flame className="w-5 h-5" />
            <span className="text-xs font-mono text-slate-500">Streak</span>
          </div>
          <span className="text-3xl font-extrabold text-white font-mono block">
            {stats.studyStreakDays} <span className="text-xs font-sans text-slate-400 font-normal">days</span>
          </span>
          <span className="text-xs text-slate-400 block">Active learning streak</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-indigo-400">
            <BookOpen className="w-5 h-5" />
            <span className="text-xs font-mono text-slate-500">Notes</span>
          </div>
          <span className="text-3xl font-extrabold text-white font-mono block">
            {stats.notesCreated}
          </span>
          <span className="text-xs text-slate-400 block">Summaries generated</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-emerald-400">
            <Target className="w-5 h-5" />
            <span className="text-xs font-mono text-slate-500">Accuracy</span>
          </div>
          <span className="text-3xl font-extrabold text-white font-mono block">
            {stats.averageQuizScore}%
          </span>
          <span className="text-xs text-slate-400 block">Avg practice quiz score</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-cyan-400">
            <Layers className="w-5 h-5" />
            <span className="text-xs font-mono text-slate-500">Mastered</span>
          </div>
          <span className="text-3xl font-extrabold text-white font-mono block">
            {stats.flashcardsMastered}
          </span>
          <span className="text-xs text-slate-400 block">Flashcards mastered</span>
        </div>

      </div>

      {/* Quiz History Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Practice Quiz History</span>
        </h3>

        {quizResults.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono border-b border-slate-800">
                <tr>
                  <th className="p-3">Quiz Title</th>
                  <th className="p-3">Score</th>
                  <th className="p-3">Accuracy</th>
                  <th className="p-3">Time Spent</th>
                  <th className="p-3">Completed At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {quizResults.map((res) => {
                  const pct = Math.round((res.score / res.totalQuestions) * 100);
                  const mins = Math.floor(res.timeSpentSeconds / 60);
                  const secs = res.timeSpentSeconds % 60;

                  return (
                    <tr key={res.id} className="hover:bg-slate-950/60 transition-colors">
                      <td className="p-3 font-medium text-white">{res.quizTitle}</td>
                      <td className="p-3 font-mono">{res.score}/{res.totalQuestions}</td>
                      <td className="p-3 font-mono font-bold">
                        <span className={pct >= 80 ? 'text-emerald-400' : pct >= 60 ? 'text-amber-400' : 'text-rose-400'}>
                          {pct}%
                        </span>
                      </td>
                      <td className="p-3 font-mono">{mins}m {secs}s</td>
                      <td className="p-3 text-slate-400">{new Date(res.completedAt).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">
            No practice quizzes completed yet. Take a practice quiz from any study note to start tracking score metrics!
          </p>
        )}
      </div>

    </div>
  );
};
