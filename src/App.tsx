import React, { useState, useEffect } from 'react';
import { StudySet, SubjectCategory, SummaryStyle, QuizResult, StudyStats } from './types/study';
import { SAMPLE_STUDY_SETS } from './data/sampleData';
import { Header } from './components/Header';
import { StudySetsList } from './components/StudySetsList';
import { NoteEditor } from './components/NoteEditor';
import { SummaryView } from './components/SummaryView';
import { QuizRunner } from './components/QuizRunner';
import { FlashcardDeck } from './components/FlashcardDeck';
import { AITutorChat } from './components/AITutorChat';
import { MindMapView } from './components/MindMapView';
import { AnalyticsView } from './components/AnalyticsView';
import { ExportModal } from './components/ExportModal';
import { generateSummaryApi, generateQuizApi, generateFlashcardsApi, generateMindMapApi } from './services/api';
import { BookOpen, Plus } from 'lucide-react';

export default function App() {
  const [studySets, setStudySets] = useState<StudySet[]>(() => {
    const saved = localStorage.getItem('studymind_sets');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // If user specifically requested removing test data, clean up sample items if any
        return parsed.filter((s: StudySet) => !s.isSample);
      } catch (e) {
        console.error(e);
      }
    }
    return SAMPLE_STUDY_SETS;
  });

  const [activeSetId, setActiveSetId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'sets' | 'editor' | 'summary' | 'quiz' | 'flashcards' | 'tutor' | 'analytics' | 'mindmap'>('sets');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const [quizResults, setQuizResults] = useState<QuizResult[]>(() => {
    const saved = localStorage.getItem('studymind_quiz_results');
    return saved ? JSON.parse(saved) : [];
  });

  // Save sets to local storage
  useEffect(() => {
    localStorage.setItem('studymind_sets', JSON.stringify(studySets));
  }, [studySets]);

  // Save quiz results to local storage
  useEffect(() => {
    localStorage.setItem('studymind_quiz_results', JSON.stringify(quizResults));
  }, [quizResults]);

  const activeSet = studySets.find((s) => s.id === activeSetId) || studySets[0] || null;

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear all notes and quiz history?')) {
      setStudySets([]);
      setQuizResults([]);
      localStorage.removeItem('studymind_sets');
      localStorage.removeItem('studymind_quiz_results');
      setActiveTab('sets');
    }
  };

  // Calculate stats
  const totalMasteredFlashcards = studySets.reduce((acc, set) => {
    const masteredInSet = set.flashcards?.filter((c) => c.mastery === 'mastered').length || 0;
    return acc + masteredInSet;
  }, 0);

  const avgQuizScore = quizResults.length
    ? Math.round(
        quizResults.reduce((acc, r) => acc + (r.score / r.totalQuestions) * 100, 0) / quizResults.length
      )
    : 0;

  const stats: StudyStats = {
    notesCreated: studySets.length,
    quizzesCompleted: quizResults.length,
    averageQuizScore: avgQuizScore,
    flashcardsMastered: totalMasteredFlashcards,
    totalCardsStudied: studySets.reduce((acc, s) => acc + (s.flashcards?.length || 0), 0),
    studyStreakDays: studySets.length > 0 ? 1 : 0
  };

  const handleCreateAndSummarize = async (data: {
    title: string;
    subject: SubjectCategory;
    content: string;
    style: SummaryStyle;
  }) => {
    setIsGenerating(true);
    try {
      // 1. Generate Summary
      const summary = await generateSummaryApi(data.content, data.style, data.subject);

      // 2. Generate Quiz
      let quiz = undefined;
      try {
        quiz = await generateQuizApi(data.content, 5, 'Medium', data.subject);
      } catch (err) {
        console.warn('Quiz generation skipped or offline fallback', err);
      }

      // 3. Generate Flashcards
      let flashcards = undefined;
      try {
        flashcards = await generateFlashcardsApi(data.content, data.subject);
      } catch (err) {
        console.warn('Flashcard generation skipped or offline fallback', err);
      }

      // 4. Generate Mind Map
      let mindMap = undefined;
      try {
        mindMap = await generateMindMapApi(data.content, data.title);
      } catch (err) {
        console.warn('MindMap generation skipped or offline fallback', err);
      }

      const newSet: StudySet = {
        id: `set-${Date.now()}`,
        title: data.title,
        subject: data.subject,
        content: data.content,
        summary,
        quiz: quiz ? { ...quiz, id: `quiz-${Date.now()}`, noteId: `set-${Date.now()}` } : undefined,
        flashcards,
        mindMap,
        updatedAt: new Date().toISOString(),
        wordCount: data.content.trim().split(/\s+/).length
      };

      setStudySets((prev) => [newSet, ...prev]);
      setActiveSetId(newSet.id);
      setActiveTab('summary');
    } catch (error: any) {
      alert(`Error generating study guide: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateFlashcardMastery = (cardId: string, status: 'new' | 'learning' | 'mastered') => {
    if (!activeSet) return;
    setStudySets((prev) =>
      prev.map((set) => {
        if (set.id !== activeSet.id || !set.flashcards) return set;
        const updatedCards = set.flashcards.map((c) => (c.id === cardId ? { ...c, mastery: status } : c));
        return { ...set, flashcards: updatedCards };
      })
    );
  };

  const handleCompleteQuiz = (result: QuizResult) => {
    setQuizResults((prev) => [result, ...prev]);
  };

  const renderNoActiveNoteState = () => (
    <div className="max-w-md mx-auto my-12 p-8 text-center bg-slate-900 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
      <BookOpen className="w-12 h-12 text-indigo-400 mx-auto" />
      <h3 className="text-xl font-bold text-white font-display">
        No Study Notes Created Yet
      </h3>
      <p className="text-xs text-slate-400 leading-relaxed">
        Paste your lecture notes or upload a file to automatically generate summaries, practice quizzes, and interactive flashcards.
      </p>
      <button
        onClick={() => setActiveTab('editor')}
        className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors inline-flex items-center gap-2 shadow-lg shadow-indigo-600/20"
      >
        <Plus className="w-4 h-4" />
        <span>Create First Note</span>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white print-container">
      
      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewNote={() => setActiveTab('editor')}
        activeNoteTitle={activeSet?.title}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {activeTab === 'sets' && (
          <StudySetsList
            studySets={studySets}
            onSelectSet={(set) => {
              setActiveSetId(set.id);
              setActiveTab('summary');
            }}
            onOpenQuiz={(set) => {
              setActiveSetId(set.id);
              setActiveTab('quiz');
            }}
            onOpenFlashcards={(set) => {
              setActiveSetId(set.id);
              setActiveTab('flashcards');
            }}
            onNewNote={() => setActiveTab('editor')}
          />
        )}

        {activeTab === 'editor' && (
          <NoteEditor
            onGenerate={handleCreateAndSummarize}
            isLoading={isGenerating}
          />
        )}

        {activeTab === 'summary' && (
          activeSet && activeSet.summary ? (
            <SummaryView
              noteTitle={activeSet.title}
              subject={activeSet.subject}
              summary={activeSet.summary}
              onStartQuiz={() => setActiveTab('quiz')}
              onStudyFlashcards={() => setActiveTab('flashcards')}
              onOpenMindMap={() => setActiveTab('mindmap')}
              onOpenChat={() => setActiveTab('tutor')}
              onOpenExport={() => setShowExportModal(true)}
            />
          ) : renderNoActiveNoteState()
        )}

        {activeTab === 'quiz' && (
          activeSet && activeSet.quiz ? (
            <QuizRunner
              quiz={activeSet.quiz}
              onCompleteQuiz={handleCompleteQuiz}
              onBackToNotes={() => setActiveTab('summary')}
            />
          ) : renderNoActiveNoteState()
        )}

        {activeTab === 'flashcards' && (
          activeSet && activeSet.flashcards ? (
            <FlashcardDeck
              deckTitle={activeSet.title}
              subject={activeSet.subject}
              cards={activeSet.flashcards}
              onUpdateMastery={handleUpdateFlashcardMastery}
              onBackToNotes={() => setActiveTab('summary')}
            />
          ) : renderNoActiveNoteState()
        )}

        {activeTab === 'tutor' && (
          activeSet ? (
            <AITutorChat
              noteTitle={activeSet.title}
              noteContent={activeSet.content}
              subject={activeSet.subject}
            />
          ) : renderNoActiveNoteState()
        )}

        {activeTab === 'mindmap' && (
          activeSet && activeSet.mindMap ? (
            <MindMapView
              mindMap={activeSet.mindMap}
              noteTitle={activeSet.title}
            />
          ) : renderNoActiveNoteState()
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            stats={stats}
            quizResults={quizResults}
            onClearData={handleClearAllData}
          />
        )}

      </main>

      {/* Export Modal */}
      {showExportModal && activeSet && (
        <ExportModal
          studySet={activeSet}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-600 no-print">
        <p>StudyMind AI — Smart Notes Summarizer, Practice Quiz & Flashcard Engine</p>
      </footer>

    </div>
  );
}
