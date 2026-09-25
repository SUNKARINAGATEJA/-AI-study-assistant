import React, { useState } from 'react';
import { NoteSummary, SubjectCategory } from '../types/study';
import { SubjectBadge } from './SubjectBadge';
import { Sparkles, Play, Square, HelpCircle, Layers, BrainCircuit, Download, Search, CheckCircle2, BookOpen, Clock, Lightbulb } from 'lucide-react';
import { generateTTSApi } from '../services/api';

interface SummaryViewProps {
  noteTitle: string;
  subject: SubjectCategory;
  summary: NoteSummary;
  onStartQuiz: () => void;
  onStudyFlashcards: () => void;
  onOpenMindMap: () => void;
  onOpenChat: () => void;
  onOpenExport: () => void;
}

export const SummaryView: React.FC<SummaryViewProps> = ({
  noteTitle,
  subject,
  summary,
  onStartQuiz,
  onStudyFlashcards,
  onOpenMindMap,
  onOpenChat,
  onOpenExport
}) => {
  const [activeTab, setActiveTab] = useState<'takeaways' | 'concepts' | 'glossary' | 'questions'>('takeaways');
  const [glossarySearch, setGlossarySearch] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isSynthesizingAudio, setIsSynthesizingAudio] = useState(false);
  const [audioObj, setAudioObj] = useState<HTMLAudioElement | null>(null);

  const filteredGlossary = summary.glossary.filter(
    (item) =>
      item.term.toLowerCase().includes(glossarySearch.toLowerCase()) ||
      item.definition.toLowerCase().includes(glossarySearch.toLowerCase())
  );

  const handleToggleAudio = async () => {
    if (isPlayingAudio && audioObj) {
      audioObj.pause();
      setIsPlayingAudio(false);
      return;
    }

    if (audioObj) {
      audioObj.play();
      setIsPlayingAudio(true);
      return;
    }

    // Synthesize audio summary
    setIsSynthesizingAudio(true);
    const audioText = `${noteTitle}. ${summary.headline}. ${summary.overview}. Key takeaways: ${summary.keyTakeaways.join('. ')}`;
    
    // Check if browser SpeechSynthesis is available first for zero latency
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(audioText);
      utterance.rate = 1.0;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
      setIsSynthesizingAudio(false);
      return;
    }

    // Fallback to Gemini TTS API endpoint
    const base64Audio = await generateTTSApi(audioText);
    setIsSynthesizingAudio(false);

    if (base64Audio) {
      const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
      setAudioObj(audio);
      audio.onended = () => setIsPlayingAudio(false);
      audio.play();
      setIsPlayingAudio(true);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Top Banner Card */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
        
        {/* Title, Subject, & Audio player */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <SubjectBadge subject={subject} />
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                {summary.readingTimeMinutes} min summary
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-display tracking-tight">
              {noteTitle}
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleToggleAudio}
              disabled={isSynthesizingAudio}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 border ${
                isPlayingAudio
                  ? 'bg-rose-950/80 border-rose-800 text-rose-300'
                  : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
              }`}
            >
              {isSynthesizingAudio ? (
                <span className="animate-pulse">Loading Voice...</span>
              ) : isPlayingAudio ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current text-rose-400" />
                  <span>Pause Audio</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current text-indigo-400" />
                  <span>Listen Summary</span>
                </>
              )}
            </button>

            <button
              onClick={onOpenExport}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Headline Callout */}
        <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-indigo-200 text-sm leading-relaxed font-medium">
          <span className="font-bold text-indigo-400 mr-2 font-display">TL;DR:</span>
          {summary.headline}
        </div>

        {/* Executive Overview */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Executive Overview
          </h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            {summary.overview}
          </p>
        </div>

        {/* Action Hub Bar */}
        <div className="pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3">
          
          <button
            onClick={onStartQuiz}
            className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 hover:bg-amber-900/40 transition-all text-left group"
          >
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-1">
              <HelpCircle className="w-4 h-4" />
              <span>Take Quiz</span>
            </div>
            <p className="text-[11px] text-slate-400 group-hover:text-slate-300">
              Interactive practice test with instant answers
            </p>
          </button>

          <button
            onClick={onStudyFlashcards}
            className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 hover:bg-emerald-900/40 transition-all text-left group"
          >
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-1">
              <Layers className="w-4 h-4" />
              <span>Flashcards</span>
            </div>
            <p className="text-[11px] text-slate-400 group-hover:text-slate-300">
              Spaced repetition card study deck
            </p>
          </button>

          <button
            onClick={onOpenMindMap}
            className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/40 hover:bg-cyan-900/40 transition-all text-left group"
          >
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold mb-1">
              <BookOpen className="w-4 h-4" />
              <span>Mind Map</span>
            </div>
            <p className="text-[11px] text-slate-400 group-hover:text-slate-300">
              Visual node breakdown tree
            </p>
          </button>

          <button
            onClick={onOpenChat}
            className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/40 hover:bg-purple-900/40 transition-all text-left group"
          >
            <div className="flex items-center gap-2 text-purple-400 text-xs font-bold mb-1">
              <BrainCircuit className="w-4 h-4" />
              <span>AI Tutor</span>
            </div>
            <p className="text-[11px] text-slate-400 group-hover:text-slate-300">
              Ask questions on note context
            </p>
          </button>

        </div>

      </div>

      {/* Main Tabbed Content Deck */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
        
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('takeaways')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'takeaways'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Key Takeaways ({summary.keyTakeaways.length})
          </button>

          <button
            onClick={() => setActiveTab('concepts')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'concepts'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Key Concepts ({summary.keyConcepts.length})
          </button>

          <button
            onClick={() => setActiveTab('glossary')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'glossary'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Glossary & Terms ({summary.glossary.length})
          </button>

          <button
            onClick={() => setActiveTab('questions')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'questions'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Review Questions ({summary.reviewQuestions.length})
          </button>
        </div>

        {/* Tab 1: Key Takeaways */}
        {activeTab === 'takeaways' && (
          <div className="space-y-3">
            {summary.keyTakeaways.map((point, index) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-3 hover:border-slate-700 transition-colors"
              >
                <div className="w-6 h-6 rounded-lg bg-indigo-950 text-indigo-400 font-bold font-mono text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {point}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Key Concepts */}
        {activeTab === 'concepts' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {summary.keyConcepts.map((concept, index) => (
              <div
                key={index}
                className="p-5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-white font-display">
                    {concept.title}
                  </h4>
                  <span
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                      concept.importance === 'high'
                        ? 'border-rose-800/60 bg-rose-950/40 text-rose-300'
                        : concept.importance === 'medium'
                        ? 'border-amber-800/60 bg-amber-950/40 text-amber-300'
                        : 'border-slate-800 bg-slate-900 text-slate-400'
                    }`}
                  >
                    {concept.importance} priority
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {concept.explanation}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Glossary & Terms */}
        {activeTab === 'glossary' && (
          <div className="space-y-4">
            <div className="relative max-w-sm">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={glossarySearch}
                onChange={(e) => setGlossarySearch(e.target.value)}
                placeholder="Search terms or definitions..."
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredGlossary.map((item, index) => (
                <div key={index} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <span className="text-sm font-bold text-indigo-300 font-display block">
                    {item.term}
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.definition}
                  </p>
                  {item.example && (
                    <p className="text-[11px] text-slate-400 italic font-mono pt-1">
                      e.g. {item.example}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Review Questions */}
        {activeTab === 'questions' && (
          <div className="space-y-3">
            {summary.reviewQuestions.map((q, index) => (
              <div key={index} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                    Question {index + 1}
                  </span>
                  <p className="text-sm font-medium text-slate-200">
                    {q}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
};
