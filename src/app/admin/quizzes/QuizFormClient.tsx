'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Check, 
  HelpCircle, 
  Save, 
  AlertCircle,
  Folder,
  Sliders,
  Zap,
  Info
} from 'lucide-react';
import { saveQuiz } from '@/app/actions/admin';
import Link from 'next/link';

interface QuestionInput {
  id?: string;
  text: string;
  type: 'SINGLE' | 'MULTIPLE';
  xpReward: number;
  options: string[];
  correct: string[];
}

interface QuizItem {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  xpReward: number;
  published: boolean;
  sequenceOrder: number;
  questions?: QuestionInput[];
}

interface QuizFormClientProps {
  quiz: QuizItem | null; // Null means create mode
}

export default function QuizFormClient({ quiz }: QuizFormClientProps) {
  const router = useRouter();
  
  // Quiz Fields
  const [title, setTitle] = useState(quiz?.title || '');
  const [description, setDescription] = useState(quiz?.description || '');
  const [category, setCategory] = useState(quiz?.category || 'General');
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>(quiz?.difficulty || 'EASY');
  const [xpReward, setXpReward] = useState(quiz?.xpReward || 50);
  const [published, setPublished] = useState(quiz?.published || false);
  const [sequenceOrder, setSequenceOrder] = useState<number | undefined>(quiz?.sequenceOrder);

  // Questions Array
  const [questions, setQuestions] = useState<QuestionInput[]>(
    quiz?.questions || [
      {
        text: '',
        type: 'SINGLE',
        xpReward: 10,
        options: ['', '', '', ''],
        correct: [],
      },
    ]
  );

  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add Question
  const handleAddQuestion = () => {
    setQuestions(prev => [
      ...prev,
      {
        text: '',
        type: 'SINGLE',
        xpReward: 10,
        options: ['', '', '', ''],
        correct: [],
      },
    ]);
  };

  // Remove Question
  const handleRemoveQuestion = (qIndex: number) => {
    if (questions.length === 1) {
      alert('A quiz must have at least one question.');
      return;
    }
    setQuestions(prev => prev.filter((_, idx) => idx !== qIndex));
  };

  // Modify Question text / type / xp
  const handleQuestionChange = (qIndex: number, field: keyof QuestionInput, value: any) => {
    setQuestions(prev =>
      prev.map((q, idx) => {
        if (idx !== qIndex) return q;
        
        // If type changes, reset correct answers to prevent mismatch
        if (field === 'type') {
          return { ...q, [field]: value, correct: [] };
        }
        
        return { ...q, [field]: value };
      })
    );
  };

  // Modify Option text
  const handleOptionChange = (qIndex: number, optIndex: number, val: string) => {
    setQuestions(prev =>
      prev.map((q, idx) => {
        if (idx !== qIndex) return q;
        const newOptions = [...q.options];
        const oldVal = newOptions[optIndex];
        newOptions[optIndex] = val;
        
        // If the old option value was marked correct, update it in correct answers array
        let newCorrect = [...q.correct];
        if (oldVal && newCorrect.includes(oldVal)) {
          newCorrect = newCorrect.map(c => (c === oldVal ? val : c));
        }
        
        return { ...q, options: newOptions, correct: newCorrect };
      })
    );
  };

  // Add/Remove correct choice
  const handleToggleCorrect = (qIndex: number, optText: string) => {
    if (!optText.trim()) {
      alert('Please fill in the option text before marking it correct.');
      return;
    }

    setQuestions(prev =>
      prev.map((q, idx) => {
        if (idx !== qIndex) return q;

        let newCorrect = [...q.correct];
        if (q.type === 'SINGLE') {
          newCorrect = [optText];
        } else {
          if (newCorrect.includes(optText)) {
            newCorrect = newCorrect.filter(c => c !== optText);
          } else {
            newCorrect.push(optText);
          }
        }

        return { ...q, correct: newCorrect };
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic Validation
    if (!title.trim() || !description.trim() || !category.trim()) {
      setError('Please fill in all quiz details.');
      return;
    }

    // Validate Questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        setError(`Question #${i + 1} text is empty.`);
        return;
      }

      // Filter out empty options
      const nonEmpties = q.options.filter(o => o.trim());
      if (nonEmpties.length < 2) {
        setError(`Question #${i + 1} must have at least 2 non-empty options.`);
        return;
      }

      // Validate Correct answers
      if (q.correct.length === 0) {
        setError(`Question #${i + 1} does not have any correct answers marked.`);
        return;
      }

      // Make sure all marked correct answers are actually in the options
      const invalidCorrect = q.correct.some(c => !q.options.includes(c));
      if (invalidCorrect) {
        setError(`Question #${i + 1} has a correct answer marked that does not exist in options.`);
        return;
      }
    }

    setLoading(true);

    try {
      const quizInput = {
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        difficulty,
        xpReward: Number(xpReward),
        published,
        ...(sequenceOrder !== undefined ? { sequenceOrder: Number(sequenceOrder) } : {}),
      };

      // Strip empty options and empty ids if any
      const cleanedQuestions = questions.map(q => ({
        id: q.id,
        text: q.text.trim(),
        type: q.type,
        xpReward: Number(q.xpReward),
        options: q.options.filter(o => o.trim()),
        correct: q.correct.filter(c => c.trim()),
      }));

      const res = await saveQuiz(quiz ? quiz.id : null, quizInput, cleanedQuestions);
      
      if (res.success) {
        router.push('/admin/quizzes');
        router.refresh();
      } else {
        setError(res.error || 'Failed to save quiz.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Top action header */}
      <div className="flex items-center justify-between">
        <Link 
          href="/admin/quizzes" 
          className="btn-3d-white px-4 py-2 text-sm flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Cancel
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="btn-3d-green px-6 py-3 text-base flex items-center gap-2"
        >
          <Save className="h-5 w-5" />
          {loading ? 'Saving...' : quiz ? 'Update Quiz' : 'Save Quiz'}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border-2 border-red-100 bg-red-50 p-4 text-sm font-bold text-red-500">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid: Left Column (Details) & Right Column (Questions) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Quiz Info Settings */}
        <div className="space-y-6">
          <div className="card-3d bg-white p-6 space-y-6">
            <h2 className="text-xl font-black text-gray-800 flex items-center gap-2 border-b-2 border-gray-100 pb-3">
              <Sliders className="h-5 w-5 text-duo-blue" />
              Quiz Settings
            </h2>

            {/* Title */}
            <div>
              <label className="block text-xs font-extrabold text-gray-400 uppercase mb-2">Quiz Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. JavaScript Arrays"
                className="block w-full py-2.5 px-3 border-2 border-gray-200 rounded-xl font-bold text-gray-800 focus:outline-none focus:border-duo-blue bg-gray-50 focus:bg-white text-sm transition-all"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-extrabold text-gray-400 uppercase mb-2">Description</label>
              <textarea
                required
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe what this quiz covers..."
                rows={3}
                className="block w-full py-2.5 px-3 border-2 border-gray-200 rounded-xl font-bold text-gray-800 focus:outline-none focus:border-duo-blue bg-gray-50 focus:bg-white text-sm transition-all"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-extrabold text-gray-400 uppercase mb-2">Category</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Folder className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  placeholder="e.g. Basics"
                  className="block w-full pl-9 py-2.5 px-3 border-2 border-gray-200 rounded-xl font-bold text-gray-800 focus:outline-none focus:border-duo-blue bg-gray-50 focus:bg-white text-sm transition-all"
                />
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-xs font-extrabold text-gray-400 uppercase mb-2">Difficulty</label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value as any)}
                className="block w-full py-2.5 px-3 border-2 border-gray-200 rounded-xl font-bold text-gray-800 focus:outline-none focus:border-duo-blue bg-gray-50 focus:bg-white text-sm transition-all"
              >
                <option value="EASY">Easy (🔥 Level 1)</option>
                <option value="MEDIUM">Medium (🔥 Level 2)</option>
                <option value="HARD">Hard (🔥 Level 3)</option>
              </select>
            </div>

            {/* XP Reward */}
            <div>
              <label className="block text-xs font-extrabold text-gray-400 uppercase mb-2 flex items-center justify-between">
                <span>Quiz Completion XP</span>
                <span className="text-duo-blue font-black flex items-center gap-0.5">
                  <Zap className="h-3 w-3 fill-current" /> {xpReward} XP
                </span>
              </label>
              <input
                type="number"
                required
                min={10}
                max={500}
                value={xpReward}
                onChange={e => setXpReward(Number(e.target.value))}
                className="block w-full py-2.5 px-3 border-2 border-gray-200 rounded-xl font-bold text-gray-800 focus:outline-none focus:border-duo-blue bg-gray-50 focus:bg-white text-sm transition-all"
              />
            </div>

            {/* Sequence Order */}
            <div>
              <label className="block text-xs font-extrabold text-gray-400 uppercase mb-2 flex items-center gap-1.5">
                <span>Sequence Path Order</span>
                <span title="Determines position in the progression path tree.">
                  <Info className="h-3.5 w-3.5 text-gray-400" />
                </span>
              </label>
              <input
                type="number"
                min={1}
                value={sequenceOrder === undefined ? '' : sequenceOrder}
                onChange={e => setSequenceOrder(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Leave blank to append at end"
                className="block w-full py-2.5 px-3 border-2 border-gray-200 rounded-xl font-bold text-gray-800 focus:outline-none focus:border-duo-blue bg-gray-50 focus:bg-white text-sm transition-all"
              />
            </div>

            {/* Published Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border-2 border-gray-100">
              <div>
                <span className="block text-sm font-extrabold text-gray-800">Publish Quiz</span>
                <span className="block text-[10px] text-gray-400 font-semibold">Make visible on learning path</span>
              </div>
              <input
                type="checkbox"
                checked={published}
                onChange={e => setPublished(e.target.checked)}
                className="h-6 w-6 text-duo-green focus:ring-duo-green border-gray-300 rounded cursor-pointer"
              />
            </div>

          </div>
        </div>

        {/* Right Column: Questions List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
              <HelpCircle className="h-6 w-6 text-duo-orange" />
              Quiz Questions ({questions.length})
            </h3>
            <button
              type="button"
              onClick={handleAddQuestion}
              className="btn-3d-blue px-4 py-2 text-xs flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" /> Add Question
            </button>
          </div>

          <div className="space-y-6">
            {questions.map((q, qIndex) => (
              <div 
                key={qIndex} 
                className="card-3d bg-white p-6 space-y-6 relative border-l-4 border-l-duo-orange"
              >
                {/* Delete question button */}
                <button
                  type="button"
                  onClick={() => handleRemoveQuestion(qIndex)}
                  className="absolute top-4 right-4 p-2 text-red-500 bg-red-50 border-2 border-red-100 rounded-xl hover:bg-red-100 transition-all cursor-pointer"
                  title="Remove Question"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                <span className="text-xs font-black text-duo-orange uppercase tracking-wider bg-orange-50 border-2 border-orange-100 px-3 py-1 rounded-full inline-block">
                  Question #{qIndex + 1}
                </span>

                {/* Question Text */}
                <div>
                  <label className="block text-xs font-extrabold text-gray-400 uppercase mb-2">Question Text</label>
                  <input
                    type="text"
                    required
                    value={q.text}
                    onChange={e => handleQuestionChange(qIndex, 'text', e.target.value)}
                    placeholder="Enter question text here..."
                    className="block w-full py-2.5 px-3 border-2 border-gray-200 rounded-xl font-bold text-gray-800 focus:outline-none focus:border-duo-blue bg-gray-50 focus:bg-white text-sm transition-all"
                  />
                </div>

                {/* Question Properties */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Select Type */}
                  <div>
                    <label className="block text-xs font-extrabold text-gray-400 uppercase mb-2">Question Type</label>
                    <select
                      value={q.type}
                      onChange={e => handleQuestionChange(qIndex, 'type', e.target.value)}
                      className="block w-full py-2.5 px-3 border-2 border-gray-200 rounded-xl font-bold text-gray-800 focus:outline-none focus:border-duo-blue bg-gray-50 focus:bg-white text-sm transition-all"
                    >
                      <option value="SINGLE">Single Correct Choice</option>
                      <option value="MULTIPLE">Multiple Correct Choices</option>
                    </select>
                  </div>

                  {/* XP Gained */}
                  <div>
                    <label className="block text-xs font-extrabold text-gray-400 uppercase mb-2">XP Reward</label>
                    <input
                      type="number"
                      required
                      min={5}
                      max={100}
                      value={q.xpReward}
                      onChange={e => handleQuestionChange(qIndex, 'xpReward', Number(e.target.value))}
                      className="block w-full py-2.5 px-3 border-2 border-gray-200 rounded-xl font-bold text-gray-800 focus:outline-none focus:border-duo-blue bg-gray-50 focus:bg-white text-sm transition-all"
                    />
                  </div>
                </div>

                {/* Option list */}
                <div className="space-y-3">
                  <label className="block text-xs font-extrabold text-gray-400 uppercase">
                    Answer Options & Correct Answers (Select circles to mark correct)
                  </label>
                  
                  {q.options.map((opt, optIndex) => {
                    const isCorrect = q.correct.includes(opt) && opt.trim() !== '';
                    return (
                      <div key={optIndex} className="flex items-center gap-3">
                        {/* Toggle Check checkbox circle */}
                        <button
                          type="button"
                          onClick={() => handleToggleCorrect(qIndex, opt)}
                          className={`h-9 w-9 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
                            isCorrect 
                              ? 'bg-duo-green border-duo-green-dark text-white' 
                              : 'bg-white border-gray-200 text-transparent hover:border-gray-400'
                          }`}
                        >
                          <Check className="h-4 w-4 stroke-[3px]" />
                        </button>

                        <input
                          type="text"
                          required
                          value={opt}
                          onChange={e => handleOptionChange(qIndex, optIndex, e.target.value)}
                          placeholder={`Option #${optIndex + 1}`}
                          className={`block flex-1 py-2.5 px-3 border-2 rounded-xl font-bold text-gray-800 focus:outline-none focus:border-duo-blue bg-gray-50 focus:bg-white text-sm transition-all ${
                            isCorrect ? 'border-duo-green/45 bg-green-50/20' : 'border-gray-200'
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Add Question at the bottom too */}
          <button
            type="button"
            onClick={handleAddQuestion}
            className="w-full btn-3d-blue py-3.5 text-sm flex justify-center items-center gap-1.5"
          >
            <Plus className="h-5 w-5" /> Add Another Question
          </button>
        </div>

      </div>
    </form>
  );
}
