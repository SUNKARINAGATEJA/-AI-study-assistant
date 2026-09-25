import React, { useState, useRef } from 'react';
import { SubjectCategory, SummaryStyle } from '../types/study';
import { Sparkles, Upload, FileText, CheckCircle2, AlertCircle, Loader2, BookOpen, Layers, HelpCircle, Lightbulb } from 'lucide-react';

interface NoteEditorProps {
  initialTitle?: string;
  initialSubject?: SubjectCategory;
  initialContent?: string;
  onGenerate: (data: {
    title: string;
    subject: SubjectCategory;
    content: string;
    style: SummaryStyle;
  }) => Promise<void>;
  isLoading: boolean;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  initialTitle = '',
  initialSubject = 'General Notes',
  initialContent = '',
  onGenerate,
  isLoading
}) => {
  const [title, setTitle] = useState(initialTitle || 'Untitled Study Note');
  const [subject, setSubject] = useState<SubjectCategory>(initialSubject);
  const [content, setContent] = useState(initialContent);
  const [style, setStyle] = useState<SummaryStyle>('executive');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const estimatedReadTime = Math.ceil(wordCount / 200);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!title || title === 'Untitled Study Note') {
      const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setTitle(fileNameWithoutExt);
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setContent(text);
        setError(null);
      }
    };
    reader.onerror = () => {
      setError('Failed to read uploaded file.');
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Please enter or upload note content before generating.');
      return;
    }
    setError(null);
    await onGenerate({
      title: title.trim() || 'Untitled Study Note',
      subject,
      content,
      style
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 rounded-2xl border border-indigo-500/20 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-display tracking-tight flex items-center gap-2.5">
              <Sparkles className="w-7 h-7 text-indigo-400" />
              <span>AI Study Note Synthesizer</span>
            </h1>
            <p className="mt-1 text-sm text-slate-400 max-w-xl">
              Paste your raw lecture notes, textbook excerpts, or upload files to automatically generate summaries, practice quizzes, interactive flashcards, and concept maps.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors flex items-center gap-2"
            >
              <Upload className="w-4 h-4 text-indigo-400" />
              <span>Upload Notes File</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".txt,.md,.markdown,.json,.csv"
              className="hidden"
            />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-lg space-y-6">
        
        {/* Title and Subject Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Note Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Cellular Respiration & ATP Synthesis"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Subject Category
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value as SubjectCategory)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            >
              <option value="Biology">Biology</option>
              <option value="Computer Science">Computer Science</option>
              <option value="History">History</option>
              <option value="Economics">Economics</option>
              <option value="Physics & Math">Physics & Math</option>
              <option value="Languages">Languages</option>
              <option value="General Notes">General Notes</option>
            </select>
          </div>
        </div>

        {/* Note Textarea */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Lecture Notes / Textbook Content
            </label>
            <span className="text-xs text-slate-400 font-mono">
              {wordCount.toLocaleString()} words · ~{estimatedReadTime} min read
            </span>
          </div>

          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Paste your notes, lecture transcript, textbook chapters, or key concepts here..."
            rows={12}
            className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm font-sans placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors resize-y leading-relaxed"
          />
        </div>

        {/* Summary Style Selection */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Choose Output Style
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            <button
              type="button"
              onClick={() => setStyle('executive')}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                style === 'executive'
                  ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-md shadow-indigo-950/40'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-indigo-400">Executive Summary</span>
                {style === 'executive' && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
              </div>
              <p className="text-xs text-slate-400 leading-snug">
                Crisp takeaways, key concepts, & core terminology.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setStyle('outline')}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                style === 'outline'
                  ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-md shadow-indigo-950/40'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-cyan-400">Detailed Outline</span>
                {style === 'outline' && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
              </div>
              <p className="text-xs text-slate-400 leading-snug">
                Hierarchical study guide structured by subtopics.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setStyle('examprep')}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                style === 'examprep'
                  ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-md shadow-indigo-950/40'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-amber-400">Exam Prep Guide</span>
                {style === 'examprep' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
              </div>
              <p className="text-xs text-slate-400 leading-snug">
                High-yield exam traps, core formulas, & key dates.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setStyle('eli5')}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                style === 'eli5'
                  ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-md shadow-indigo-950/40'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-emerald-400">ELI5 Simple Mode</span>
                {style === 'eli5' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-xs text-slate-400 leading-snug">
                Simple real-world analogies & intuitive breakdowns.
              </p>
            </button>

          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> Summary
            </span>
            <span className="flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" /> Quiz
            </span>
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-emerald-400" /> Flashcards
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading || !content.trim()}
            className="px-6 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Processing AI Study Guide...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-indigo-200" />
                <span>Generate Study Guide</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};
