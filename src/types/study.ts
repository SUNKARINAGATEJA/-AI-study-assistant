export type SubjectCategory = 'Biology' | 'Computer Science' | 'History' | 'Economics' | 'Physics & Math' | 'Languages' | 'General Notes';

export type SummaryStyle = 'executive' | 'outline' | 'examprep' | 'eli5';

export interface KeyConcept {
  title: string;
  explanation: string;
  importance: 'high' | 'medium' | 'low';
}

export interface GlossaryTerm {
  term: string;
  definition: string;
  example?: string;
}

export interface NoteSummary {
  headline: string;
  overview: string;
  keyTakeaways: string[];
  keyConcepts: KeyConcept[];
  glossary: GlossaryTerm[];
  reviewQuestions: string[];
  readingTimeMinutes: number;
}

export interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  question: string;
  options?: string[]; // For multiple choice
  correctAnswer: string; // Text or index
  explanation: string;
}

export interface Quiz {
  id: string;
  noteId: string;
  title: string;
  subject: SubjectCategory;
  questions: QuizQuestion[];
  createdAt: string;
}

export interface QuizResult {
  id: string;
  quizId: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  timeSpentSeconds: number;
  userAnswers: Record<string, string>;
  completedAt: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  hint?: string;
  mastery: 'new' | 'learning' | 'mastered';
}

export interface FlashcardDeck {
  id: string;
  noteId: string;
  title: string;
  subject: SubjectCategory;
  cards: Flashcard[];
  createdAt: string;
}

export interface MindMapNode {
  id: string;
  label: string;
  description?: string;
  children?: MindMapNode[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface StudySet {
  id: string;
  title: string;
  subject: SubjectCategory;
  content: string;
  summary?: NoteSummary;
  quiz?: Quiz;
  flashcards?: Flashcard[];
  mindMap?: MindMapNode;
  updatedAt: string;
  wordCount: number;
  isSample?: boolean;
}

export interface StudyStats {
  notesCreated: number;
  quizzesCompleted: number;
  averageQuizScore: number;
  flashcardsMastered: number;
  totalCardsStudied: number;
  studyStreakDays: number;
}
