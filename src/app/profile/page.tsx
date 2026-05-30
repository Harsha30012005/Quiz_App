import prisma from '@/lib/prisma';
import Sidebar from '@/app/components/Sidebar';
import { getCurrentUser } from '@/app/actions/auth';
import { redirect } from 'next/navigation';
import ProfileClient from './ProfileClient';

export const dynamic = 'force-dynamic';

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
      {/* Shared Navigation Sidebar */}
      <Sidebar user={user} />

      {/* Main Panel */}
      <div className="flex-1 md:pl-64 pb-24 md:pb-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Your Profile</h1>
            <p className="text-sm font-bold text-gray-400">Manage your credentials, status, and view earned badges.</p>
          </div>

          <ProfileClient 
            user={user} 
            allBadges={allBadges} 
            unlockedBadgeIds={unlockedBadgeIds} 
            attempts={attempts} 
          />
        </div>
      </div>
    </div>
  );
}
