'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, ShieldAlert, Zap, Flame, Award, HelpCircle } from 'lucide-react';
import { updateUserRole as updateRole } from '@/app/actions/admin';

interface UserItem {
  id: string;
  email: string;
  name: string | null;
  role: 'USER' | 'ADMIN';
  avatarUrl: string | null;
  level: number;
  totalXp: number;
  currentStreak: number;
  createdAt: Date;
  _count: {
    attempts: number;
    achievements: number;
  };
}

interface UsersListClientProps {
  initialUsers: UserItem[];
}

export default function UsersListClient({ initialUsers }: UsersListClientProps) {
  const router = useRouter();
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleRoleToggle = async (userId: string, currentRole: 'USER' | 'ADMIN') => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return;
    }

    setUpdatingId(userId);
    try {
      const res = await updateRole(userId, newRole);
      if (res.success) {
        setUsers(prev =>
          prev.map(u => (u.id === userId ? { ...u, role: newRole } : u))
        );
        router.refresh();
      } else {
        alert(res.error || 'Failed to update user role.');
      }
    } catch (e) {
      alert('An error occurred.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="card-3d bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr className="text-left text-xs font-extrabold text-gray-400 uppercase tracking-wider">
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4 text-center">Level</th>
              <th className="px-6 py-4 text-center">Streak</th>
              <th className="px-6 py-4 text-center">Total XP</th>
              <th className="px-6 py-4 text-center">Attempts</th>
              <th className="px-6 py-4 text-center">Badges</th>
              <th className="px-6 py-4 text-center">Role</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm font-bold text-gray-600">
            {users.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-400 font-semibold">
                  No registered users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-gray-200 bg-gray-50 flex items-center justify-center font-bold text-gray-600">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                        ) : (
                          user.name ? user.name[0].toUpperCase() : 'U'
                        )}
                      </div>
                      <div>
                        <div className="font-black text-gray-800">{user.name || 'Anonymous'}</div>
                        <div className="text-xs text-gray-400 font-medium">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-gray-800">
                    <span className="bg-green-50 border border-green-100 text-duo-green-dark px-2 py-0.5 rounded-full text-xs font-black">
                      Lvl {user.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-duo-orange font-extrabold">
                    <div className="flex items-center justify-center gap-1">
                      <Flame className="h-4 w-4 fill-current text-duo-orange" />
                      {user.currentStreak}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-duo-blue font-extrabold">
                    <div className="flex items-center justify-center gap-1">
                      <Zap className="h-4 w-4 fill-current text-duo-blue" />
                      {user.totalXp} XP
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-gray-700">
                    <div className="flex items-center justify-center gap-1">
                      <HelpCircle className="h-4 w-4 text-gray-400" />
                      {user._count.attempts}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-yellow-600">
                    <div className="flex items-center justify-center gap-1">
                      <Award className="h-4 w-4 text-yellow-500" />
                      {user._count.achievements}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-block px-2.5 py-0.5 text-[10px] uppercase font-black rounded-full border ${
                      user.role === 'ADMIN'
                        ? 'bg-purple-50 border-purple-200 text-purple-600'
                        : 'bg-gray-50 border-gray-200 text-gray-500'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button
                      onClick={() => handleRoleToggle(user.id, user.role)}
                      disabled={updatingId === user.id}
                      className={`btn-3d-white text-xs px-3 py-1.5 flex items-center gap-1 ml-auto ${
                        user.role === 'ADMIN' ? 'text-red-500 hover:text-red-700' : 'text-purple-600 hover:text-purple-800'
                      }`}
                    >
                      {user.role === 'ADMIN' ? (
                        <>
                          <ShieldAlert className="h-3.5 w-3.5" />
                          Demote
                        </>
                      ) : (
                        <>
                          <Shield className="h-3.5 w-3.5" />
                          Promote
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
