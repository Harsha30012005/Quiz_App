import { getAdminUsers } from '@/app/actions/admin';
import UsersListClient from './UsersListClient';

export const dynamic = 'force-dynamic';

import { Users } from 'lucide-react';

export default async function AdminUsersPage() {
  const users = await getAdminUsers();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
          <Users className="text-duo-blue h-8 w-8" />
          User Management
        </h1>
        <p className="text-sm font-bold text-gray-400">
          Monitor user progress, streaks, XP, and toggle account roles.
        </p>
      </div>

      <UsersListClient initialUsers={users} />
    </div>
  );
}
