import { getQuizPath } from '@/app/actions/quizzes';
import PathClient from './PathClient';
import Sidebar from '@/app/components/Sidebar';

export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';

export default async function PathPage() {
  const result = await getQuizPath();

  if (!result.success || !result.user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Layout */}
      <Sidebar user={result.user} />

      {/* Path Content Scroll Board */}
      <div className="flex-1 md:pl-64 pb-24 md:pb-6 flex flex-col items-center">
        <header className="w-full bg-white border-b-2 border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-black text-gray-800 uppercase tracking-wider">Learning Path</h1>
            <p className="text-xs text-gray-400 font-bold">Complete each node passing with 80% score to unlock the next</p>
          </div>
        </header>

        <div className="w-full max-w-2xl px-4 py-12">
          <PathClient nodes={result.pathNodes} />
        </div>
      </div>
    </div>
  );
}
