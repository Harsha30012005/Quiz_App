'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, HelpCircle, Zap, RefreshCw } from 'lucide-react';
import { checkQuestion, submitQuizAttempt } from '@/app/actions/quizzes';

interface Question {
  id: string;
  text: string;
  type: 'SINGLE' | 'MULTIPLE';
  xpReward: number;
  options: string[];
}

interface Quiz {
  id: string;
  title: string;
  xpReward: number;
  questions: Question[];
}

interface QuizEngineClientProps {
  quiz: Quiz;
}

export default function QuizEngineClient({ quiz }: QuizEngineClientProps) {
  const router = useRouter();
  
  // Quiz Engine State
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpts, setSelectedOpts] = useState<string[]>([]);
  
  // Status check states
  const [checking, setChecking] = useState(false);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState<string[]>([]);
  
  // Aggregated attempt history for final submission
  const [attemptHistory, setAttemptHistory] = useState<{ questionId: string; selected: string[] }[]>([]);
  const [startTime] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);

  const currentQuestion = quiz.questions[currentIdx];
  const progressPercent = quiz.questions.length > 0 ? (currentIdx / quiz.questions.length) * 100 : 0;

  // Keypress bindings: 1-4 to select options, Enter to check/continue
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (checked) {
        if (e.key === 'Enter') {
          handleContinue();
        }
        return;
      }

      // Handle selections (numbers 1-4)
      if (['1', '2', '3', '4'].includes(e.key)) {
        const optIdx = parseInt(e.key) - 1;
        if (currentQuestion && currentQuestion.options[optIdx]) {
          handleSelectOption(currentQuestion.options[optIdx]);
        }
      }

      if (e.key === 'Enter' && selectedOpts.length > 0 && !checking) {
        handleCheckAnswer();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedOpts, checked, checking, currentIdx]);

  const handleSelectOption = (option: string) => {
    if (checked) return;

    if (currentQuestion.type === 'SINGLE') {
      setSelectedOpts([option]);
    } else {
      setSelectedOpts(prev =>
        prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]
      );
    }
  };

  const handleCheckAnswer = async () => {
    if (selectedOpts.length === 0 || checking || checked) return;

    setChecking(true);
    try {
      const res = await checkQuestion(currentQuestion.id, selectedOpts);
      setIsCorrect(res.isCorrect);
      setCorrectAnswers(res.correct);
      setChecked(true);
      
      // Save in history
      setAttemptHistory(prev => [
        ...prev,
        { questionId: currentQuestion.id, selected: selectedOpts }
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setChecking(false);
    }
  };

  const handleContinue = async () => {
    if (!checked) return;

    // Reset states
    setChecked(false);
    setSelectedOpts([]);
    setCorrectAnswers([]);

    if (currentIdx < quiz.questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      // Last question finished! Submit final attempt.
      setSubmitting(true);
      const durationSeconds = Math.round((Date.now() - startTime) / 1000);
      
      try {
        const res = await submitQuizAttempt(quiz.id, attemptHistory, durationSeconds);
        if (res.success && res.results) {
          // Redirect to results page
          router.push(`/quiz/${quiz.id}/results?attemptId=${res.results.attemptId}`);
        } else {
          alert(res.error || 'Failed to submit quiz attempt.');
          router.push('/path');
        }
      } catch (err) {
        alert('An error occurred during submission.');
        router.push('/path');
      }
    }
  };

  const handleExit = () => {
    if (window.confirm('Are you sure you want to exit? Your progress in this attempt will be lost.')) {
      router.push('/path');
    }
  };

  if (submitting) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white space-y-4">
        <RefreshCw className="h-10 w-10 text-duo-blue animate-spin" />
        <p className="text-sm font-extrabold text-gray-400 uppercase tracking-widest">
          Evaluating answers & updating streak...
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-between max-w-2xl mx-auto w-full px-6 py-6 min-h-screen">
      
      {/* 1. Header (Exit & Progress) */}
      <header className="flex items-center gap-4 py-4 w-full">
        <button
          onClick={handleExit}
          className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all cursor-pointer"
        >
          <X className="h-6 w-6 stroke-[2.5px]" />
        </button>

        {/* Progress bar */}
        <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-200 p-0.5">
          <div 
            className="h-full bg-duo-green rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="text-xs font-black text-gray-400 uppercase tracking-wider whitespace-nowrap">
          {currentIdx + 1} of {quiz.questions.length}
        </div>
      </header>

      {/* 2. Center Card (Question and Options) */}
      <section className="flex-1 flex flex-col justify-center py-8">
        <div className="space-y-8">
          {/* Question Text */}
          <div className="space-y-2">
            <span className="text-xs font-black text-duo-blue uppercase tracking-wider">
              {currentQuestion.type === 'SINGLE' ? 'Single Choice' : 'Select all that apply'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-800 leading-tight">
              {currentQuestion.text}
            </h2>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 gap-4">
            {currentQuestion.options.map((option, optIdx) => {
              const isSelected = selectedOpts.includes(option);
              
              let cardStyle = 'card-3d border-gray-200 bg-white hover:bg-gray-50';
              if (isSelected && !checked) {
                cardStyle = 'card-3d border-duo-blue bg-blue-50/10 text-duo-blue-dark';
              } else if (checked) {
                const wasCorrectOption = correctAnswers.includes(option);
                const wasSelectedOption = selectedOpts.includes(option);

                if (wasCorrectOption) {
                  cardStyle = 'card-3d border-duo-green bg-green-50/20 text-duo-green-dark';
                } else if (wasSelectedOption) {
                  cardStyle = 'card-3d border-duo-red bg-red-50/20 text-duo-red-dark';
                } else {
                  cardStyle = 'card-3d border-gray-200 bg-white opacity-50';
                }
              }

              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelectOption(option)}
                  disabled={checked}
                  className={`w-full text-left px-5 py-4 font-bold flex items-center justify-between text-base select-none transition-all cursor-pointer ${cardStyle}`}
                  style={{
                    borderBottomWidth: '5px',
                  }}
                >
                  <div className="flex items-center gap-4">
                    {/* Index identifier circle */}
                    <span className={`h-7 w-7 rounded-lg border-2 flex items-center justify-center font-extrabold text-xs transition-all ${
                      isSelected && !checked
                        ? 'border-duo-blue bg-duo-blue text-white'
                        : checked && correctAnswers.includes(option)
                        ? 'border-duo-green bg-duo-green text-white'
                        : 'border-gray-200 text-gray-400 bg-white'
                    }`}>
                      {optIdx + 1}
                    </span>
                    <span className="text-gray-800">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Sticky Bottom Verification Drawer */}
      <footer className="border-t-2 border-gray-100 pt-6 w-full">
        <AnimatePresence>
          {checked ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={`p-5 rounded-2xl border-2 flex flex-col md:flex-row items-center justify-between gap-4 -mx-6 px-12 ${
                isCorrect 
                  ? 'bg-green-50 border-green-200 text-duo-green-dark' 
                  : 'bg-red-50 border-red-200 text-duo-red-dark'
              }`}
            >
              <div className="flex items-center gap-3">
                {isCorrect ? (
                  <CheckCircle2 className="h-10 w-10 shrink-0 text-duo-green fill-current text-white animate-bounce" />
                ) : (
                  <AlertCircle className="h-10 w-10 shrink-0 text-duo-red fill-current text-white animate-shake" />
                )}
                <div>
                  <h3 className="text-lg font-black">{isCorrect ? 'Correct!' : 'Incorrect Answer'}</h3>
                  {!isCorrect && (
                    <p className="text-xs font-semibold text-red-500 mt-0.5">
                      Correct: <span className="font-extrabold">{correctAnswers.join(', ')}</span>
                    </p>
                  )}
                  {isCorrect && (
                    <p className="text-xs font-semibold text-green-600 mt-0.5 flex items-center gap-0.5">
                      <Zap className="h-3.5 w-3.5 fill-current" /> +{currentQuestion.xpReward} XP earned!
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={handleContinue}
                className="w-full md:w-auto btn-3d-green px-8 py-3 text-sm"
              >
                Continue
              </button>
            </motion.div>
          ) : (
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-xs font-extrabold text-gray-400 flex items-center gap-1.5 py-2">
                <HelpCircle className="h-4.5 w-4.5" />
                <span>Select option and hit Check, or press [1-4] then [Enter]</span>
              </div>
              
              <button
                onClick={handleCheckAnswer}
                disabled={selectedOpts.length === 0 || checking}
                className={`w-full md:w-auto px-10 py-3.5 text-sm transition-all ${
                  selectedOpts.length > 0 
                    ? 'btn-3d-green' 
                    : 'btn-3d-white bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {checking ? 'Checking...' : 'Check Answer'}
              </button>
            </div>
          )}
        </AnimatePresence>
      </footer>
    </div>
  );
}
