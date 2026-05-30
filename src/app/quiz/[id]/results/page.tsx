import prisma from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
import { notFound, redirect } from 'next/navigation';
import { Star, Trophy, Flame, Zap, ArrowLeft, RefreshCw, Award, ChevronRight } from 'lucide-react';
import Sidebar from '@/app/components/Sidebar';
import { getCurrentUser } from '@/app/actions/auth';

interface ResultsPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ attemptId?: string }>;
}

export default async function ResultsPage({ params, searchParams }: ResultsPageProps) {
  const { id } = await params;
  const { attemptId } = await searchParams;
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (!attemptId) {
    redirect('/path');
  }

  // Fetch attempt details
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      quiz: { select: { title: true, xpReward: true, sequenceOrder: true } },
    },
  });

  if (!attempt || attempt.userId !== user.id) {
    notFound();
  }

  const isPass = attempt.score >= 80;

  // Query achievements earned in the last 10 seconds of this attempt
  const achievements = await prisma.achievement.findMany({
    where: {
      userId: user.id,
      earnedAt: { gte: new Date(attempt.completedAt.getTime() - 10000) },
    },
    include: { badge: true },
  });

  // Calculate XP values for progress bar (each level is 150 XP)
  const xpCurrentLevel = attempt.score >= 80 ? (user.totalXp % 150) : (user.totalXp % 150);
  const xpPercent = Math.round((xpCurrentLevel / 150) * 100);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Navigation Layout */}
      <Sidebar user={user} />

      <div className="flex-1 md:pl-64 pb-24 md:pb-6 flex items-center justify-center py-12 px-4 sm:px-6">
        <div className="max-w-md w-full space-y-8 text-center">
          
          {/* Header Banners */}
          <div className="space-y-3">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100 border-4 border-yellow-200 text-yellow-500 shadow-md">
              <Trophy className="h-10 w-10 animate-bounce" />
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              {isPass ? 'Quiz Completed!' : 'Keep Practicing!'}
            </h1>
            <p className="text-sm font-bold text-gray-400">
              {isPass 
                ? `You passed the "${attempt.quiz.title}" node!` 
                : `You scored ${attempt.score}%. You need 80% accuracy to unlock the next node.`
              }
            </p>
          </div>

          {/* Results Score Cards */}
          <div className="card-3d bg-white p-6 space-y-6">
            
            {/* Circular score display */}
            <div className="relative w-36 h-36 mx-auto flex items-center justify-center rounded-full border-8 border-gray-100">
              <div className="text-center">
                <span className="block text-4xl font-black text-gray-800">{attempt.score}%</span>
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Accuracy</span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-4 border-t-2 border-b-2 border-gray-100 py-4">
              <div className="flex flex-col items-center border-r-2 border-gray-100">
                <div className="flex items-center gap-1.5 text-duo-blue font-black text-lg">
                  <Zap className="h-5 w-5 fill-current text-duo-blue" />
                  <span>+{attempt.xpEarned}</span>
                </div>
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">XP Gained</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1.5 text-duo-orange font-black text-lg">
                  <Flame className="h-5 w-5 fill-current text-duo-orange" />
                  <span>{user.currentStreak}</span>
                </div>
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Day Streak</span>
              </div>
            </div>

            {/* XP Level progression indicator */}
            <div className="space-y-2 text-left">
              <div className="flex justify-between items-center text-xs font-black text-gray-500">
                <span>LEVEL {user.level}</span>
                <span>{xpCurrentLevel} / 150 XP FOR LEVEL {user.level + 1}</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200 p-0.5">
                <div 
                  className="h-full bg-duo-blue rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Unlocked Badges Notification Display */}
          {achievements.length > 0 && (
            <div className="card-3d bg-gradient-to-br from-yellow-50/50 to-orange-50/30 border-yellow-200 p-5 space-y-4">
              <div className="inline-flex items-center gap-1.5 text-yellow-600 bg-yellow-100 border border-yellow-200 rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-wider animate-bounce">
                <Award className="h-3.5 w-3.5" /> Achievement Unlocked!
              </div>
              
              <div className="flex flex-col items-center gap-3">
                {achievements.map((ach) => (
                  <div key={ach.id} className="flex items-center gap-4 text-left w-full bg-white p-3 rounded-xl border border-yellow-100">
                    <div className="h-12 w-12 rounded-full bg-yellow-100 border-2 border-yellow-300 flex items-center justify-center text-yellow-600 font-extrabold text-lg shrink-0">
                      🎖️
                    </div>
                    <div>
                      <h4 className="font-black text-gray-800 text-sm">{ach.badge.name}</h4>
                      <p className="text-xs text-gray-400 font-semibold">{ach.badge.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Buttons Navigation */}
          <div className="flex flex-col gap-3">
            <Link 
              href="/path" 
              className="w-full btn-3d-green py-4 text-base flex justify-center items-center gap-2"
            >
              Back to Path
              <ChevronRight className="h-5 w-5" />
            </Link>
            
            <Link 
              href={`/quiz/${id}`} 
              className="w-full btn-3d-white py-3.5 text-sm flex justify-center items-center gap-2"
            >
              <RefreshCw className="h-4.5 w-4.5" />
              Try Again
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
