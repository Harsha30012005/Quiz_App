import { getCurrentUser } from '@/app/actions/auth';
import Sidebar from '@/app/components/Sidebar';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // Route security: Ensure role is ADMIN
  if (!user || user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Shared Navigation Sidebar */}
      <Sidebar user={user} />
      
      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 pb-20 md:pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </div>
    </div>
  );
}
