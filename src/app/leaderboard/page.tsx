import { getLeaderboardData } from '@/app/actions/leaderboard';
import LeaderboardClient from './LeaderboardClient';
import Sidebar from '@/app/components/Sidebar';

export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';

export default async function LeaderboardPage() {
  const res = await getLeaderboardData();

  if (!res.success || !res.currentUser) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Shared Layout Sidebar */}
      <Sidebar user={res.currentUser} />

      {/* Main Container */}
      <div className="flex-1 md:pl-64 pb-24 md:pb-6">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Leaderboard</h1>
            <p className="text-sm font-bold text-gray-400">Compete with other developers and claim the top podium!</p>
          </div>

          <LeaderboardClient 
            leaderboardData={res.data} 
            currentUserId={res.currentUser.id} 
          />
        </div>
      </div>
    </div>
  );
}
