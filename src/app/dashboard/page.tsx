import prisma from '@/lib/prisma';
import Sidebar from '@/app/components/Sidebar';
import { getCurrentUser } from '@/app/actions/auth';

export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  Zap, 
  Flame, 
  Trophy, 
  Award, 
  ChevronRight, 
  Calendar, 
  CheckCircle,
  HelpCircle,
  TrendingUp,
  LayoutDashboard
} from 'lucide-react';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // 1. Calculate Leaderboard Rank (Overall)
  const rankingUsers = await prisma.user.findMany({
    orderBy: { totalXp: 'desc' },
    select: { id: true },
  });
  const currentRank = rankingUsers.findIndex(u => u.id === user.id) + 1;

  // 2. Fetch Recent Attempts
  const recentAttempts = await prisma.attempt.findMany({
    where: { userId: user.id },
    orderBy: { completedAt: 'desc' },
    take: 4,
    include: {
      quiz: { select: { title: true, difficulty: true, category: true } },
    },
  });

  // 3. Fetch Earned Badges count
  const badgeCount = await prisma.achievement.count({
    where: { userId: user.id },
  });
  const totalBadgesAvailable = await prisma.badge.count();

  // 4. Calculate progress details for level progress bar
  const xpCurrentLevel = user.totalXp % 150;
  const xpPercent = Math.round((xpCurrentLevel / 150) * 100);

  // 5. Activity Completion Counts
  const completedNodesCount = await prisma.userProgress.count({
    where: { userId: user.id, completed: true },
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Navigation Layout */}
      <Sidebar user={user} />

      {/* Main Board */}
      <div className="flex-1 md:pl-64 pb-24 md:pb-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          
          {/* Header Title */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                <LayoutDashboard className="text-duo-blue h-8 w-8" />
                User Dashboard
              </h1>
              <p className="text-sm font-bold text-gray-400">Track your daily programming practice milestones</p>
            </div>
            <Link href="/path" className="btn-3d-green px-5 py-3 text-sm flex items-center gap-2">
              Resume Learning Path
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>

          {/* Quick Metrics Widget Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Level Card */}
            <div className="card-3d bg-white p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-green-50 border-2 border-green-200 flex items-center justify-center text-duo-green font-black text-lg">
                👑
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">Current Level</span>
                <span className="text-xl font-black text-gray-800">Level {user.level}</span>
              </div>
            </div>

            {/* Streak Card */}
            <div className="card-3d bg-white p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-orange-50 border-2 border-orange-200 flex items-center justify-center text-duo-orange">
                <Flame className="h-6 w-6 fill-current" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">Streak</span>
                <span className="text-xl font-black text-gray-800">{user.currentStreak} Days</span>
              </div>
            </div>

            {/* XP Gained */}
            <div className="card-3d bg-white p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 border-2 border-blue-200 flex items-center justify-center text-duo-blue">
                <Zap className="h-6 w-6 fill-current animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">Total XP</span>
                <span className="text-xl font-black text-gray-800">{user.totalXp} XP</span>
              </div>
            </div>

            {/* Leaderboard rank */}
            <div className="card-3d bg-white p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-yellow-50 border-2 border-yellow-200 flex items-center justify-center text-yellow-600">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">Rank Placement</span>
                <span className="text-xl font-black text-gray-800">#{currentRank}</span>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left side grid: Level progress & Badge summary */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Level Progress Indicator */}
              <div className="card-3d bg-white p-6 space-y-4">
                <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
                  <TrendingUp className="h-5.5 w-5.5 text-duo-blue" />
                  XP Level Progress
                </h2>
                
                <div className="space-y-2 text-left">
                  <div className="flex justify-between items-center text-xs font-black text-gray-500">
                    <span>Level {user.level}</span>
                    <span>{xpCurrentLevel} / 150 XP for Level {user.level + 1}</span>
                  </div>
                  <div className="h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-200 p-0.5">
                    <div 
                      className="h-full bg-duo-blue rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${xpPercent}%` }}
                    />
                  </div>
                  <p className="text-xs font-semibold text-gray-400 mt-1">
                    You need <span className="font-extrabold text-duo-blue-dark">{150 - xpCurrentLevel} more XP</span> to level up. Keep solving quizzes to level up!
                  </p>
                </div>
              </div>

              {/* Path Node Summary details */}
              <div className="card-3d bg-white p-6 space-y-4">
                <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
                  <CheckCircle className="h-5.5 w-5.5 text-duo-green" />
                  Learning Path Milestones
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 border border-gray-150 p-4 rounded-xl text-center">
                    <span className="block text-2xl font-black text-duo-green-dark">{completedNodesCount}</span>
                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Nodes Completed</span>
                  </div>
                  <div className="bg-gray-50 border border-gray-150 p-4 rounded-xl text-center">
                    <span className="block text-2xl font-black text-yellow-600">🎖️ {badgeCount}</span>
                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Badges Unlocked</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-gray-500 p-2 border-t border-gray-100">
                  <span>Current Path Node Unlock:</span>
                  <Link href="/path" className="text-duo-blue hover:underline font-extrabold">
                    View Path Nodes &rarr;
                  </Link>
                </div>
              </div>

            </div>

            {/* Right side column: Recent quiz attempts logs */}
            <div className="space-y-6">
              <div className="card-3d bg-white p-6 space-y-6">
                <h2 className="text-xl font-black text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3">
                  <Calendar className="h-5.5 w-5.5 text-duo-blue" />
                  Recent Quiz Attempts
                </h2>

                <div className="flow-root">
                  <ul className="-my-4 divide-y divide-gray-100">
                    {recentAttempts.length === 0 ? (
                      <p className="py-6 text-center text-gray-400 font-semibold text-xs leading-relaxed">
                        No quiz runs completed yet.<br />
                        <Link href="/path" className="text-duo-blue underline font-extrabold mt-1 inline-block">
                          Solve Quiz 1 Now
                        </Link>
                      </p>
                    ) : (
                      recentAttempts.map((attempt) => (
                        <li key={attempt.id} className="py-4">
                          <div className="flex items-center space-x-3">
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-black text-gray-800">
                                {attempt.quiz.title}
                              </p>
                              <p className="truncate text-[9px] text-gray-400 font-bold uppercase mt-0.5">
                                {attempt.quiz.difficulty} • passed: {attempt.score >= 80 ? 'Yes' : 'No'}
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
