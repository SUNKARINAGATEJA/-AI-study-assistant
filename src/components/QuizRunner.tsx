import React, { useState, useEffect } from 'react';
import { Quiz, QuizQuestion, QuizResult } from '../types/study';
import { CheckCircle2, XCircle, Clock, Trophy, RotateCcw, ArrowRight, HelpCircle, Check, AlertCircle } from 'lucide-react';

interface QuizRunnerProps {
  quiz: Quiz;
  onCompleteQuiz: (result: QuizResult) => void;
  onBackToNotes: () => void;
}

export const QuizRunner: React.FC<QuizRunnerProps> = ({ quiz, onCompleteQuiz, onBackToNotes }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [shortAnswerText, setShortAnswerText] = useState('');
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [score, setScore] = useState(0);
  const [secondsSpent, setSecondsSpent] = useState(0);
  const [isQuizFinished, setIsQuizFinished] = useState(false);

  const currentQuestion: QuizQuestion = quiz.questions[currentIndex];

  // Timer effect
  useEffect(() => {
    if (isQuizFinished) return;
    const interval = setInterval(() => {
      setSecondsSpent((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isQuizFinished]);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSelectOption = (option: string) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswer(option);
  };

  const handleConfirmAnswer = () => {
    if (!selectedAnswer && currentQuestion.type !== 'short-answer') return;
    const finalAns = currentQuestion.type === 'short-answer' ? shortAnswerText : selectedAnswer || '';

    setIsAnswerSubmitted(true);
    setUserAnswers((prev) => ({ ...prev, [currentQuestion.id]: finalAns }));

    // Check correctness
    const isCorrect =
      currentQuestion.type === 'short-answer'
        ? finalAns.trim().length > 3
        : finalAns.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase();

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShortAnswerText('');
      setIsAnswerSubmitted(false);
    } else {
      // Finished quiz
      setIsQuizFinished(true);
      const result: QuizResult = {
        id: `result-${Date.now()}`,
        quizId: quiz.id,
        quizTitle: quiz.title,
        score,
        totalQuestions: quiz.questions.length,
        timeSpentSeconds: secondsSpent,
        userAnswers,
        completedAt: new Date().toISOString()
      };
      onCompleteQuiz(result);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShortAnswerText('');
    setIsAnswerSubmitted(false);
    setUserAnswers({});
    setScore(0);
    setSecondsSpent(0);
    setIsQuizFinished(false);
  };

  // Finished view
  if (isQuizFinished) {
    const percentage = Math.round((score / quiz.questions.length) * 100);

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 text-center shadow-xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-950 border border-indigo-800/80 flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/10">
            <Trophy className="w-8 h-8 text-indigo-400" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">
              Quiz Completed!
            </h2>
            <p className="text-sm text-slate-400">
              {quiz.title}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800 max-w-md mx-auto">
            <div>
              <span className="text-xs text-slate-400 block">Score</span>
              <span className="text-2xl font-bold text-indigo-400 font-mono">
                {score}/{quiz.questions.length}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Accuracy</span>
              <span className="text-2xl font-bold text-emerald-400 font-mono">
                {percentage}%
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Time</span>
              <span className="text-2xl font-bold text-cyan-400 font-mono">
                {formatTime(secondsSpent)}
              </span>
            </div>
          </div>

          {/* Missed Questions Review */}
          <div className="text-left space-y-4 pt-4 border-t border-slate-800">
            <h3 className="text-sm font-bold text-slate-200">
              Question Breakdown
            </h3>
            <div className="space-y-3">
              {quiz.questions.map((q, idx) => {
                const uAns = userAnswers[q.id] || 'No Answer';
                const isCorrect = uAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();

                return (
                  <div key={q.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-300">
                        Q{idx + 1}. {q.question}
                      </span>
                      {isCorrect ? (
                        <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-rose-400 flex items-center gap-1 shrink-0">
                          <XCircle className="w-3.5 h-3.5" /> Incorrect
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 space-y-1 font-mono">
                      <div>Your Answer: <span className={isCorrect ? 'text-emerald-300' : 'text-rose-300'}>{uAns}</span></div>
                      {!isCorrect && <div>Correct Answer: <span className="text-indigo-300">{q.correctAnswer}</span></div>}
                    </div>
                    <p className="text-xs text-slate-400 italic pt-1 border-t border-slate-900">
                      {q.explanation}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-4 pt-4 border-t border-slate-800">
            <button
              onClick={handleRestartQuiz}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-semibold transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4 text-indigo-400" />
              <span>Retake Quiz</span>
            </button>
            <button
              onClick={onBackToNotes}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
            >
              Back to Study Notes
            </button>
          </div>

        </div>
      </div>
    );
  }

  // Active question view
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Top Quiz Header */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono text-indigo-400 font-semibold uppercase tracking-wider block">
              {quiz.subject} Practice Quiz
            </span>
            <h2 className="text-lg font-bold text-white font-display">
              {quiz.title}
            </h2>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-cyan-300">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{formatTime(secondsSpent)}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-400 font-mono">
            <span>Question {currentIndex + 1} of {quiz.questions.length}</span>
            <span>{Math.round(((currentIndex + 1) / quiz.questions.length) * 100)}%</span>
          </div>
          <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / quiz.questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Active Question Card */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
        
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
            {currentQuestion.type.replace('-', ' ')}
          </span>
          <h3 className="text-lg sm:text-xl font-semibold text-white leading-snug">
            {currentQuestion.question}
          </h3>
        </div>

        {/* Options for Multiple Choice & True/False */}
        {(currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'true-false') && (
          <div className="space-y-3">
            {(currentQuestion.options || ['True', 'False']).map((opt, idx) => {
              const isSelected = selectedAnswer === opt;
              const isCorrectAnswer = opt.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase();

              let optStyle = 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700';

              if (isAnswerSubmitted) {
                if (isCorrectAnswer) {
                  optStyle = 'bg-emerald-950/70 border-emerald-500 text-emerald-200 shadow-sm';
                } else if (isSelected && !isCorrectAnswer) {
                  optStyle = 'bg-rose-950/70 border-rose-500 text-rose-200';
                } else {
                  optStyle = 'bg-slate-950/50 border-slate-900 text-slate-500 opacity-60';
                }
              } else if (isSelected) {
                optStyle = 'bg-indigo-950/80 border-indigo-500 text-white shadow-md';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(opt)}
                  disabled={isAnswerSubmitted}
                  className={`w-full p-4 rounded-xl border text-left text-sm font-medium transition-all flex items-center justify-between gap-3 ${optStyle}`}
                >
                  <span className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono flex items-center justify-center shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                  </span>

                  {isAnswerSubmitted && isCorrectAnswer && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  )}
                  {isAnswerSubmitted && isSelected && !isCorrectAnswer && (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Short Answer Input */}
        {currentQuestion.type === 'short-answer' && (
          <div className="space-y-3">
            <textarea
              value={shortAnswerText}
              onChange={(e) => setShortAnswerText(e.target.value)}
              disabled={isAnswerSubmitted}
              placeholder="Type your explanation or short answer here..."
              rows={4}
              className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
        )}

        {/* Explanation Callout after Submit */}
        {isAnswerSubmitted && (
          <div className="p-4 rounded-xl bg-indigo-950/50 border border-indigo-800/60 text-indigo-200 text-xs leading-relaxed space-y-1">
            <span className="font-bold text-indigo-400 block font-display">
              Explanation:
            </span>
            <p>{currentQuestion.explanation}</p>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
          <button
            onClick={onBackToNotes}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            Exit Quiz
          </button>

          {!isAnswerSubmitted ? (
            <button
              onClick={handleConfirmAnswer}
              disabled={!selectedAnswer && currentQuestion.type !== 'short-answer'}
              className="px-6 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors shadow-md shadow-indigo-600/20"
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="px-6 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors flex items-center gap-2 shadow-md shadow-indigo-600/20"
            >
              <span>{currentIndex < quiz.questions.length - 1 ? 'Next Question' : 'View Results'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
