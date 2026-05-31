import { getAdminAnalytics } from '@/app/actions/admin';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

import { 
  Users, 
  BookOpen, 
  HelpCircle, 
  Award, 
  Flame, 
  Percent, 
  Calendar,
  CheckCircle,
  Plus
} from 'lucide-react';

export default async function AdminDashboardPage() {
  const analytics = await getAdminAnalytics();

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-sm font-bold text-gray-400">Overview of QuizGo usage and quiz performance</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/quizzes" className="btn-3d-white px-5 py-3 text-sm flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Manage Quizzes
          </Link>
          <Link href="/admin/quizzes/new" className="btn-3d-green px-5 py-3 text-sm flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create Quiz
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-3d p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-duo-blue/10 border-2 border-duo-blue/20 flex items-center justify-center text-duo-blue">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider block">Total Users</span>
            <span className="text-2xl font-black text-gray-800">{analytics.totalUsers}</span>
          </div>
        </div>

        <div className="card-3d p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-duo-green/10 border-2 border-duo-green/20 flex items-center justify-center text-duo-green">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider block">Total Quizzes</span>
            <span className="text-2xl font-black text-gray-800">{analytics.totalQuizzes}</span>
          </div>
        </div>

        <div className="card-3d p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-duo-orange/10 border-2 border-duo-orange/20 flex items-center justify-center text-duo-orange">
            <HelpCircle className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider block">Attempts</span>
            <span className="text-2xl font-black text-gray-800">{analytics.totalAttempts}</span>
          </div>
        </div>

        <div className="card-3d p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-yellow-100 border-2 border-yellow-200 flex items-center justify-center text-yellow-600">
            <Percent className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider block">Avg Score</span>
            <span className="text-2xl font-black text-gray-800">{analytics.averageScore}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quiz Performance List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card-3d bg-white p-6">
            <h2 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
              <CheckCircle className="text-duo-green h-5 w-5" />
              Quiz Performance
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead>
                  <tr className="text-left text-xs font-extrabold text-gray-400 uppercase tracking-wider">
                    <th className="pb-3">Title</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Difficulty</th>
                    <th className="pb-3 text-right">Attempts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm font-bold text-gray-600">
                  {analytics.quizStats.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-gray-400 font-semibold">
                        No quizzes created yet.
                      </td>
                    </tr>
                  ) : (
                    analytics.quizStats.map((quiz: any) => (
                      <tr key={quiz.id}>
                        <td className="py-4 font-black text-gray-800">{quiz.title}</td>
                        <td className="py-4">{quiz.category}</td>
                        <td className="py-4">
                          <span className={`inline-block px-2 py-0.5 text-[10px] uppercase font-extrabold rounded-full border ${
                            quiz.difficulty === 'EASY'
                              ? 'bg-green-50 border-green-200 text-duo-green-dark'
                              : quiz.difficulty === 'MEDIUM'
                              ? 'bg-blue-50 border-blue-200 text-duo-blue-dark'
                              : 'bg-red-50 border-red-200 text-duo-red-dark'
                          }`}>
                            {quiz.difficulty}
                          </span>
                        </td>
                        <td className="py-4 text-right font-black text-gray-800">{quiz.attemptsCount}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Activity Panel */}
        <div className="space-y-4">
          <div className="card-3d bg-white p-6">
            <h2 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
              <Calendar className="text-duo-blue h-5 w-5" />
              Recent Quiz Attempts
            </h2>
            <div className="flow-root">
              <ul className="-my-5 divide-y divide-gray-100">
                {analytics.recentAttempts.length === 0 ? (
                  <p className="py-4 text-center text-gray-400 font-semibold text-sm">
                    No attempts submitted yet.
                  </p>
                ) : (
                  analytics.recentAttempts.map((attempt: any) => (
                    <li key={attempt.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="relative h-9 w-9 overflow-hidden rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center font-bold text-gray-600">
                          {attempt.user.avatarUrl ? (
                            <img src={attempt.user.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                          ) : (
                            attempt.user.name ? attempt.user.name[0].toUpperCase() : 'U'
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-black text-gray-800">
                            {attempt.user.name}
                          </p>
                          <p className="truncate text-xs text-gray-400 font-bold">
                            attempted <span className="text-gray-600 font-extrabold">{attempt.quiz.title}</span>
                          </p>
                        </div>
                        <div>
                          <span className={`inline-flex items-center text-xs font-black px-2 py-1 rounded-lg ${
                            attempt.score >= 80 
                              ? 'bg-green-50 text-duo-green-dark border border-green-200' 
                              : 'bg-yellow-50 text-duo-orange-dark border border-yellow-200'
                          }`}>
                            {attempt.score}%
                          </span>
                        </div>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
