import { getCurrentUser } from '@/app/actions/auth';
import ProfileClient from '../../profile/ProfileClient';
import Sidebar from '@/app/components/Sidebar';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminProfilePage() {
  const user = await getCurrentUser();

  if (!user || user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Shared Navigation Sidebar */}
      <Sidebar user={user} />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 pb-24 md:pb-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Admin Profile Settings</h1>
            <p className="text-sm font-bold text-gray-400">Update your administrator bio, avatar image, and credentials.</p>
          </div>

          <ProfileClient 
            user={user} 
            allBadges={[]} 
            unlockedBadgeIds={new Set()} 
            attempts={[]} 
            isAdminMode={true} 
          />
        </div>
      </div>
    </div>
  );
}
