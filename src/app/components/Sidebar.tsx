'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Trophy, 
  User as UserIcon, 
  Shield, 
  LogOut, 
  Flame, 
  Zap, 
  BookOpen,
  LayoutDashboard,
  Users
} from 'lucide-react';
import { logout } from '@/app/actions/auth';

interface SidebarProps {
  user: {
    name: string | null;
    email: string;
    role: string;
    level: number;
    totalXp: number;
    currentStreak: number;
    avatarUrl?: string | null;
    bio?: string | null;
  } | null;
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
    router.refresh();
  };

  const isAdmin = user?.role === 'ADMIN';

  // Completely separate nav items for User vs. Admin
  const navItems = isAdmin
    ? [
        { name: 'Admin Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Manage Quizzes', href: '/admin/quizzes', icon: BookOpen },
        { name: 'Manage Users', href: '/admin/users', icon: Users },
        { name: 'Profile Settings', href: '/admin/profile', icon: UserIcon },
      ]
    : [
        { name: 'Path', href: '/path', icon: BookOpen },
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
        { name: 'Profile', href: '/profile', icon: UserIcon },
      ];

  const logoHref = isAdmin ? '/admin' : '/path';

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed top-0 left-0 hidden h-screen w-64 border-r-2 border-gray-200 bg-white px-4 py-6 md:flex md:flex-col justify-between z-20">
        <div>
          {/* Logo */}
          <Link href={logoHref} className="flex items-center gap-3 px-3 py-2">
            <span className="text-3xl font-extrabold tracking-wider text-duo-green">
              QUIZGO
            </span>
            <div className="rounded-full bg-duo-blue p-1 text-white">
              <Zap className="h-5 w-5 fill-current" />
            </div>
          </Link>

          {/* Quick Stats Widget - ONLY visible to standard users, NOT admins */}
          {user && !isAdmin && (
            <div className="mt-6 flex items-center justify-around rounded-xl border-2 border-gray-200 bg-gray-50 p-3 mx-2">
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1 text-duo-orange font-bold">
                  <Flame className="h-5 w-5 fill-current" />
                  <span>{user.currentStreak}</span>
                </div>
                <span className="text-xs text-gray-500 font-medium">Streak</span>
              </div>
              <div className="h-8 w-px bg-gray-200" />
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1 text-duo-blue font-bold">
                  <Zap className="h-5 w-5 fill-current" />
                  <span>{user.totalXp}</span>
                </div>
                <span className="text-xs text-gray-500 font-medium">XP</span>
              </div>
              <div className="h-8 w-px bg-gray-200" />
              <div className="flex flex-col items-center">
                <div className="text-duo-green font-extrabold text-sm">
                  Lvl {user.level}
                </div>
                <span className="text-xs text-gray-500 font-medium">Rank</span>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="mt-8 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-4 rounded-xl px-4 py-3 text-base font-extrabold tracking-wide transition-all border-2 ${
                    isActive
                      ? 'border-duo-blue/30 bg-blue-50/50 text-duo-blue'
                      : 'border-transparent text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <Icon className={`h-6 w-6 ${isActive ? 'text-duo-blue' : 'text-gray-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User profile section at the bottom */}
        {user && (
          <div className="border-t-2 border-gray-255 pt-4">
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-duo-blue bg-blue-100 flex items-center justify-center font-bold text-duo-blue-dark">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                ) : (
                  user.name ? user.name[0].toUpperCase() : 'U'
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-bold text-gray-800">{user.name}</p>
                <p className="truncate text-xs text-gray-400 font-medium">{user.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-2 flex w-full items-center gap-3 rounded-xl border-2 border-transparent px-4 py-2 text-sm font-bold text-gray-500 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </div>
        )}
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 border-t-2 border-gray-200 bg-white px-2 py-2 flex md:hidden justify-around items-center z-20">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center rounded-xl p-2 text-xs font-bold tracking-tight transition-all ${
                isActive ? 'text-duo-blue' : 'text-gray-400'
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className="mt-0.5 text-[10px]">{item.name}</span>
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center p-2 text-xs font-bold text-gray-400"
        >
          <LogOut className="h-6 w-6" />
          <span className="mt-0.5 text-[10px]">Exit</span>
        </button>
      </nav>
    </>
  );
}
