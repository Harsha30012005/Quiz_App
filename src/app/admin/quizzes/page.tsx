import { getAdminQuizzes } from '@/app/actions/admin';
import QuizListClient from './QuizListClient';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

import { Plus, BookOpen } from 'lucide-react';

export default async function ManageQuizzesPage() {
  const quizzes = await getAdminQuizzes();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <BookOpen className="text-duo-blue h-8 w-8" />
            Manage Quizzes
          </h1>
          <p className="text-sm font-bold text-gray-400">
            Publish quizzes to the Duolingo progress path, add questions, or modify sequences.
          </p>
        </div>
        <Link href="/admin/quizzes/new" className="btn-3d-green px-5 py-3 text-sm flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create New Quiz
        </Link>
      </div>

      <QuizListClient initialQuizzes={quizzes} />
    </div>
  );
}
