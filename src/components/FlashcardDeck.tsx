import React, { useState } from 'react';
import { Flashcard, SubjectCategory } from '../types/study';
import { SubjectBadge } from './SubjectBadge';
import { RotateCw, Shuffle, CheckCircle2, AlertCircle, HelpCircle, ArrowLeft, ArrowRight, Layers, ListFilter } from 'lucide-react';

interface FlashcardDeckProps {
  deckTitle: string;
  subject: SubjectCategory;
  cards: Flashcard[];
  onUpdateMastery: (cardId: string, status: 'new' | 'learning' | 'mastered') => void;
  onBackToNotes: () => void;
}

export const FlashcardDeck: React.FC<FlashcardDeckProps> = ({
  deckTitle,
  subject,
  cards,
  onUpdateMastery,
  onBackToNotes
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [viewMode, setViewMode] = useState<'flip' | 'list'>('flip');
  const [shuffledCards, setShuffledCards] = useState<Flashcard[]>(cards);

  const currentCard = shuffledCards[currentIndex] || cards[0];

  const masteredCount = cards.filter((c) => c.mastery === 'mastered').length;
  const learningCount = cards.filter((c) => c.mastery === 'learning').length;
  const newCount = cards.filter((c) => c.mastery === 'new').length;

  const handleShuffle = () => {
    const shuffled = [...shuffledCards].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % shuffledCards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + shuffledCards.length) % shuffledCards.length);
  };

  const handleSetMastery = (status: 'new' | 'learning' | 'mastered') => {
    onUpdateMastery(currentCard.id, status);
    // Auto advance
    setTimeout(() => {
      handleNext();
    }, 200);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Deck Header */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <SubjectBadge subject={subject} />
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs text-slate-400 font-mono">
                {cards.length} Flashcards
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white font-display">
              {deckTitle}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setViewMode(viewMode === 'flip' ? 'list' : 'flip')}
              className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <ListFilter className="w-4 h-4 text-cyan-400" />
              <span>{viewMode === 'flip' ? 'List View' : 'Flip Cards'}</span>
            </button>

            <button
              onClick={handleShuffle}
              className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Shuffle className="w-4 h-4 text-indigo-400" />
              <span>Shuffle</span>
            </button>
          </div>
        </div>

        {/* Mastery Tracker Bar */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-800 text-center text-xs">
          <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40">
            <span className="text-emerald-400 font-bold font-mono text-base block">{masteredCount}</span>
            <span className="text-slate-400">Mastered</span>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/40">
            <span className="text-amber-400 font-bold font-mono text-base block">{learningCount}</span>
            <span className="text-slate-400">Learning</span>
          </div>

          <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/40">
            <span className="text-rose-400 font-bold font-mono text-base block">{newCount}</span>
            <span className="text-slate-400">Need Practice</span>
          </div>
        </div>
      </div>

      {/* Mode 1: Flip Card Stage */}
      {viewMode === 'flip' && (
        <div className="space-y-6">
          
          {/* Card Counter */}
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono px-2">
            <span>Card {currentIndex + 1} of {shuffledCards.length}</span>
            <span>Click card or press flip to reveal definition</span>
          </div>

          {/* 3D Flip Card Container */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full h-80 cursor-pointer perspective-1000 group"
          >
            <div
              className={`relative w-full h-full rounded-2xl border transition-all duration-500 transform-style-3d shadow-2xl ${
                isFlipped ? 'rotate-y-180 border-indigo-500 bg-slate-900' : 'border-slate-800 bg-slate-900/90 hover:border-slate-700'
              }`}
            >
              {/* Front of Card */}
              <div className="absolute inset-0 w-full h-full p-8 flex flex-col justify-between backface-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-bold">
                    Front / Term
                  </span>
                  <RotateCw className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                </div>

                <div className="my-auto text-center space-y-3">
                  <h3 className="text-2xl sm:text-3xl font-bold text-white font-display leading-tight">
                    {currentCard.front}
                  </h3>
                  {currentCard.hint && (
                    <p className="text-xs text-slate-400 italic">
                      Hint: {currentCard.hint}
                    </p>
                  )}
                </div>

                <div className="text-center text-xs text-slate-500 font-mono">
                  Click card to flip ↺
                </div>
              </div>

              {/* Back of Card */}
              <div className="absolute inset-0 w-full h-full p-8 flex flex-col justify-between backface-hidden rotate-y-180 bg-slate-900 rounded-2xl border border-indigo-500/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
                    Back / Explanation
                  </span>
                  <RotateCw className="w-4 h-4 text-indigo-400" />
                </div>

                <div className="my-auto text-center space-y-2">
                  <p className="text-lg text-slate-100 leading-relaxed font-medium">
                    {currentCard.back}
                  </p>
                </div>

                <div className="text-center text-xs text-slate-500 font-mono">
                  Rate your recall below
                </div>
              </div>

            </div>
          </div>

          {/* Navigation & Spaced Repetition Grading */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-lg">
            
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                title="Previous Card"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsFlipped(!isFlipped)}
                className="px-4 py-2 rounded-xl bg-indigo-950 border border-indigo-800/60 text-indigo-300 hover:bg-indigo-900/60 text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Flip Card</span>
              </button>

              <button
                onClick={handleNext}
                className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                title="Next Card"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Grading Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => handleSetMastery('new')}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 hover:bg-rose-900/80 text-xs font-semibold transition-colors"
              >
                Need Practice
              </button>

              <button
                onClick={() => handleSetMastery('learning')}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-amber-950/60 border border-amber-800 text-amber-300 hover:bg-amber-900/80 text-xs font-semibold transition-colors"
              >
                Getting There
              </button>

              <button
                onClick={() => handleSetMastery('mastered')}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 hover:bg-emerald-900/80 text-xs font-semibold transition-colors"
              >
                Mastered
              </button>
            </div>

          </div>

        </div>
      )}

      {/* Mode 2: List View Mode */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {cards.map((card, idx) => (
            <div key={card.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-indigo-400 font-bold">
                  Card #{idx + 1}
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase border ${
                    card.mastery === 'mastered'
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                      : card.mastery === 'learning'
                      ? 'bg-amber-950 text-amber-400 border-amber-800'
                      : 'bg-rose-950 text-rose-400 border-rose-800'
                  }`}
                >
                  {card.mastery}
                </span>
              </div>
              <h4 className="text-base font-bold text-white font-display">
                {card.front}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 pt-2">
                {card.back}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Back Button */}
      <div className="pt-2 text-center">
        <button
          onClick={onBackToNotes}
          className="text-xs text-slate-400 hover:text-white transition-colors"
        >
          ← Return to Study Notes
        </button>
      </div>

    </div>
  );
};
