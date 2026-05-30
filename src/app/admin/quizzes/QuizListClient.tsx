'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, Eye, EyeOff, BookOpen, Layers, Zap } from 'lucide-react';
import { deleteQuiz, togglePublishQuiz } from '@/app/actions/admin';

interface QuizItem {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  xpReward: number;
  published: boolean;
  sequenceOrder: number;
  _count: {
    questions: number;
    attempts: number;
  };
}

interface QuizListClientProps {
  initialQuizzes: QuizItem[];
}

export default function QuizListClient({ initialQuizzes }: QuizListClientProps) {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<QuizItem[]>(initialQuizzes);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleTogglePublish = async (id: string) => {
    try {
      const res = await togglePublishQuiz(id);
      if (res.success) {
        setQuizzes(prev =>
          prev.map(q => (q.id === id ? { ...q, published: res.published! } : q))
        );
        router.refresh();
      } else {
        alert(res.error || 'Failed to toggle publication status.');
      }
    } catch (e) {
      alert('An error occurred.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this quiz? All user progress and attempts for this quiz will be permanently deleted.')) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await deleteQuiz(id);
      if (res.success) {
        setQuizzes(prev => prev.filter(q => q.id !== id));
        router.refresh();
      } else {
        alert(res.error || 'Failed to delete quiz.');
      }
    } catch (e) {
      alert('An error occurred during deletion.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="card-3d bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr className="text-left text-xs font-extrabold text-gray-400 uppercase tracking-wider">
              <th className="px-6 py-4">Path Node</th>
              <th className="px-6 py-4">Quiz Details</th>
              <th className="px-6 py-4">Difficulty</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4 text-center">Questions</th>
              <th className="px-6 py-4 text-center">Attempts</th>
              <th className="px-6 py-4 text-center">XP</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm font-bold text-gray-600">
            {quizzes.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-400 font-semibold">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <BookOpen className="h-10 w-10 text-gray-300" />
                    <span>No quizzes created yet. Start by creating one!</span>
                  </div>
                </td>
              </tr>
            ) : (
              quizzes.map((quiz) => (
                <tr key={quiz.id} className={!quiz.published ? 'bg-gray-50/50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-black border-2 border-gray-200">
                        {quiz.sequenceOrder}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <div className="truncate font-black text-gray-800 text-base">{quiz.title}</div>
                    <div className="truncate text-xs font-medium text-gray-400 mt-0.5">{quiz.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-block px-2.5 py-0.5 text-[10px] uppercase font-extrabold rounded-full border ${
                      quiz.difficulty === 'EASY'
                        ? 'bg-green-50 border-green-200 text-duo-green-dark'
                        : quiz.difficulty === 'MEDIUM'
                        ? 'bg-blue-50 border-blue-200 text-duo-blue-dark'
                        : 'bg-red-50 border-red-200 text-duo-red-dark'
                    }`}>
                      {quiz.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-semibold">{quiz.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-gray-800">{quiz._count.questions}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-gray-800">{quiz._count.attempts}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-duo-blue font-extrabold flex items-center justify-center gap-1">
                    <Zap className="h-4 w-4 fill-current text-duo-blue" />
                    {quiz.xpReward}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div className="flex justify-end gap-2">
                      {/* Publish / Unpublish Toggle button */}
                      <button
                        onClick={() => handleTogglePublish(quiz.id)}
                        className={`p-2 rounded-lg border-2 transition-all cursor-pointer ${
                          quiz.published 
                            ? 'bg-green-50 border-green-100 text-duo-green-dark hover:bg-green-100/50' 
                            : 'bg-gray-100 border-gray-200 text-gray-400 hover:bg-gray-200/50'
                        }`}
                        title={quiz.published ? 'Unpublish Quiz' : 'Publish Quiz'}
                      >
                        {quiz.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>

                      {/* Edit button */}
                      <Link
                        href={`/admin/quizzes/${quiz.id}/edit`}
                        className="p-2 rounded-lg border-2 border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all"
                        title="Edit Quiz"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>

                      {/* Delete button */}
                      <button
                        onClick={() => handleDelete(quiz.id)}
                        disabled={deletingId === quiz.id}
                        className="p-2 rounded-lg border-2 border-red-100 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition-all cursor-pointer"
                        title="Delete Quiz"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
