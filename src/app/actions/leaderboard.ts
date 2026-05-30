'use server';

import prisma from '@/lib/prisma';
import { getCurrentUser } from './auth';

export async function getLeaderboardData() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) throw new Error('Unauthorized.');

  try {
    // 1. Overall Leaderboard: Sort users by totalXp
    const overallUsers = await prisma.user.findMany({
      orderBy: { totalXp: 'desc' },
      take: 20,
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        level: true,
        totalXp: true,
        currentStreak: true,
      },
    });

    const overall = overallUsers.map((u, idx) => ({
      ...u,
      rank: idx + 1,
      xp: u.totalXp,
    }));

    // 2. Weekly Leaderboard: Sum of XPHistory in the last 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyHistory = await prisma.xPHistory.groupBy({
      by: ['userId'],
      _sum: { xpGained: true },
      where: { createdAt: { gte: oneWeekAgo } },
      orderBy: { _sum: { xpGained: 'desc' } },
      take: 20,
    });

    const weeklyUserIds = weeklyHistory.map(h => h.userId);
    const weeklyUsers = await prisma.user.findMany({
      where: { id: { in: weeklyUserIds } },
      select: { id: true, name: true, avatarUrl: true, level: true },
    });

    const weekly = weeklyHistory.map((h, idx) => {
      const u = weeklyUsers.find(user => user.id === h.userId);
      return {
        id: h.userId,
        name: u?.name || 'Anonymous',
        avatarUrl: u?.avatarUrl || null,
        level: u?.level || 1,
        xp: h._sum.xpGained || 0,
        rank: idx + 1,
      };
    });

    // If weekly list is shorter than 10 entries, pad it with top overall users who aren't listed
    if (weekly.length < 10) {
      const weeklyIds = new Set(weekly.map(w => w.id));
      const padUsers = overall.filter(o => !weeklyIds.has(o.id)).slice(0, 10 - weekly.length);
      
      padUsers.forEach((p, idx) => {
        weekly.push({
          id: p.id,
          name: p.name || 'Anonymous',
          avatarUrl: p.avatarUrl || null,
          level: p.level,
          xp: 0,
          rank: weekly.length + 1,
        });
      });
    }

    // 3. Monthly Leaderboard: Sum of XPHistory in the last 30 days
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

    const monthlyHistory = await prisma.xPHistory.groupBy({
      by: ['userId'],
      _sum: { xpGained: true },
      where: { createdAt: { gte: oneMonthAgo } },
      orderBy: { _sum: { xpGained: 'desc' } },
      take: 20,
    });

    const monthlyUserIds = monthlyHistory.map(h => h.userId);
    const monthlyUsers = await prisma.user.findMany({
      where: { id: { in: monthlyUserIds } },
      select: { id: true, name: true, avatarUrl: true, level: true },
    });

    const monthly = monthlyHistory.map((h, idx) => {
      const u = monthlyUsers.find(user => user.id === h.userId);
      return {
        id: h.userId,
        name: u?.name || 'Anonymous',
        avatarUrl: u?.avatarUrl || null,
        level: u?.level || 1,
        xp: h._sum.xpGained || 0,
        rank: idx + 1,
      };
    });

    // Pad monthly if needed
    if (monthly.length < 10) {
      const monthlyIds = new Set(monthly.map(m => m.id));
      const padUsers = overall.filter(o => !monthlyIds.has(o.id)).slice(0, 10 - monthly.length);
      
      padUsers.forEach((p) => {
        monthly.push({
          id: p.id,
          name: p.name || 'Anonymous',
          avatarUrl: p.avatarUrl || null,
          level: p.level,
          xp: 0,
          rank: monthly.length + 1,
        });
      });
    }

    return {
      success: true,
      data: {
        weekly,
        monthly,
        overall,
      },
      currentUser: sessionUser,
    };
  } catch (err: any) {
    console.error('[LEADERBOARD ACTION] error:', err);
    return {
      success: false,
      data: { weekly: [], monthly: [], overall: [] },
      currentUser: null,
      error: err.message,
    };
  }
}
