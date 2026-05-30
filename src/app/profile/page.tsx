import prisma from '@/lib/prisma';
import Sidebar from '@/app/components/Sidebar';
import { getCurrentUser } from '@/app/actions/auth';

export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { Award, Flame, Zap, Calendar, BadgeAlert, CheckCircle, HelpCircle } from 'lucide-react';

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch all achievements/badges
  const allBadges = await prisma.badge.findMany();
  const achievements = await prisma.achievement.findMany({
    where: { userId: user.id },
    select: { badgeId: true },
  });
  const unlockedBadgeIds = new Set(achievements.map(a => a.badgeId));

  // Fetch user attempts
  const attempts = await prisma.attempt.findMany({
    where: { userId: user.id },
    orderBy: { completedAt: 'desc' },
    take: 10,
    include: {
      quiz: { select: { title: true, difficulty: true } },
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Navigation Sidebar */}
      <Sidebar user={user} />

      {/* Main Panel */}
      <div className="flex-1 md:pl-64 pb-24 md:pb-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          
          {/* 1. Header Profile Info Card */}
          <div className="card-3d bg-white p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6">
            <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-duo-blue bg-blue-50 flex items-center justify-center font-bold text-duo-blue-dark text-3xl shadow-md">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                user.name ? user.name[0].toUpperCase() : 'U'
              )}
            </div>
            
            <div className="space-y-2 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">{user.name}</h1>
                <span className="inline-block self-center bg-gray-100 border border-gray-200 text-gray-500 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                  {user.role}
                </span>
              </div>
              <p className="text-sm text-gray-400 font-semibold">{user.email}</p>
              
              {/* Quick stats badges */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-3 text-sm font-black">
                <div className="flex items-center gap-1 text-duo-orange">
                  <Flame className="h-5 w-5 fill-current" />
                  <span>{user.currentStreak} Day Streak</span>
                </div>
                <div className="flex items-center gap-1 text-duo-blue">
                  <Zap className="h-5 w-5 fill-current animate-pulse" />
                  <span>{user.totalXp} Total XP</span>
                </div>
                <div className="flex items-center gap-1 text-duo-green">
                  <Award className="h-5 w-5" />
                  <span>Level {user.level}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* 2. Badges Showcase (Left column, 2 cols wide on desktop) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="card-3d bg-white p-6">
                <h2 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
                  <Award className="h-5.5 w-5.5 text-duo-orange" />
                  Earned Badges ({achievements.length} of {allBadges.length})
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {allBadges.map((badge) => {
                    const isUnlocked = unlockedBadgeIds.has(badge.id);
                    return (
                      <div 
                        key={badge.id}
                        className={`flex items-center gap-4 p-3 rounded-xl border-2 transition-all ${
                          isUnlocked 
                            ? 'bg-yellow-50/20 border-yellow-100' 
                            : 'bg-gray-50 border-gray-200 opacity-60'
                        }`}
                      >
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center border-2 shrink-0 ${
                          isUnlocked
                            ? 'bg-yellow-100 border-yellow-300 text-yellow-600 text-2xl animate-bounce-slow shadow-sm'
                            : 'bg-gray-200 border-gray-300 text-gray-400 text-xl'
                        }`}>
                          {isUnlocked ? '🏆' : '🔒'}
                        </div>
                        <div>
                          <h4 className={`text-sm font-black ${isUnlocked ? 'text-gray-800' : 'text-gray-400'}`}>
                            {badge.name}
                          </h4>
                          <p className="text-[10px] text-gray-400 font-semibold leading-normal mt-0.5">
                            {badge.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 3. Recent Attempt History Logs (Right column) */}
            <div className="space-y-6">
              <div className="card-3d bg-white p-6">
                <h2 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
                  <Calendar className="h-5.5 w-5.5 text-duo-blue" />
                  Recent Quizzes
                </h2>

                <div className="flow-root">
                  <ul className="-my-5 divide-y divide-gray-100">
                    {attempts.length === 0 ? (
                      <p className="py-6 text-center text-gray-400 font-semibold text-xs">
                        No quiz completions yet. Keep practicing!
                      </p>
                    ) : (
                      attempts.map((attempt) => (
                        <li key={attempt.id} className="py-4">
                          <div className="flex items-center space-x-3">
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-black text-gray-800">
                                {attempt.quiz.title}
                              </p>
                              <p className="truncate text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                                {attempt.quiz.difficulty} • Passed: {attempt.score >= 80 ? 'Yes' : 'No'}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className={`inline-flex items-center text-xs font-black px-2 py-0.5 rounded-lg ${
                                attempt.score >= 80 
                                  ? 'bg-green-50 text-duo-green-dark border border-green-200' 
                                  : 'bg-red-50 text-duo-red-dark border border-red-200'
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
      </div>
    </div>
  );
}
