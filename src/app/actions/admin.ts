'use server';

import prisma from '@/lib/prisma';
import { getCurrentUser } from './auth';
import { revalidatePath } from 'next/cache';

// Helper to check if current user is admin
async function ensureAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    throw new Error('Unauthorized. Admin access required.');
  }
}

export async function getAdminQuizzes() {
  await ensureAdmin();
  try {
    return await prisma.quiz.findMany({
      orderBy: { sequenceOrder: 'asc' },
      include: {
        _count: { select: { questions: true, attempts: true } },
      },
    });
  } catch (err) {
    console.error('[ADMIN ACTION] getAdminQuizzes error:', err);
    return [];
  }
}

export async function getQuizWithQuestions(id: string) {
  await ensureAdmin();
  try {
    return await prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: true,
      },
    });
  } catch (err) {
    console.error('[ADMIN ACTION] getQuizWithQuestions error:', err);
    return null;
  }
}

export async function deleteQuiz(id: string) {
  await ensureAdmin();
  try {
    await prisma.quiz.delete({
      where: { id },
    });
    revalidatePath('/admin');
    revalidatePath('/dashboard');
    revalidatePath('/path');
    return { success: true };
  } catch (err: any) {
    console.error('[ADMIN ACTION] deleteQuiz error:', err);
    return { success: false, error: err.message || 'Failed to delete quiz.' };
  }
}

export async function togglePublishQuiz(id: string) {
  await ensureAdmin();
  try {
    const quiz = await prisma.quiz.findUnique({ where: { id } });
    if (!quiz) return { success: false, error: 'Quiz not found' };

    const updated = await prisma.quiz.update({
      where: { id },
      data: { published: !quiz.published },
    });

    revalidatePath('/admin');
    revalidatePath('/dashboard');
    revalidatePath('/path');
    return { success: true, published: updated.published };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

interface QuestionInput {
  id?: string;
  text: string;
  type: 'SINGLE' | 'MULTIPLE';
  xpReward: number;
  options: string[];
  correct: string[];
}

interface QuizInput {
  title: string;
  description: string;
  category: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  xpReward: number;
  published: boolean;
  sequenceOrder?: number;
}

export async function saveQuiz(
  id: string | null,
  quizData: QuizInput,
  questions: QuestionInput[]
) {
  await ensureAdmin();
  try {
    // 1. Determine sequenceOrder if creating a new quiz
    let sequenceOrder = quizData.sequenceOrder;
    if (!id && (sequenceOrder === undefined || sequenceOrder === null)) {
      const maxQuiz = await prisma.quiz.findFirst({
        orderBy: { sequenceOrder: 'desc' },
      });
      sequenceOrder = maxQuiz ? maxQuiz.sequenceOrder + 1 : 1;
    }

    let quiz;
    if (id) {
      // 2. Update Quiz
      quiz = await prisma.quiz.update({
        where: { id },
        data: {
          title: quizData.title,
          description: quizData.description,
          category: quizData.category,
          difficulty: quizData.difficulty,
          xpReward: quizData.xpReward,
          published: quizData.published,
          ...(sequenceOrder !== undefined ? { sequenceOrder } : {}),
        },
      });

      // Handle Questions update:
      // We will delete existing questions not in the input list, and upsert the rest
      const inputQuestionIds = questions.filter((q) => q.id).map((q) => q.id!);
      await prisma.question.deleteMany({
        where: {
          quizId: id,
          id: { notIn: inputQuestionIds },
        },
      });

      for (const q of questions) {
        if (q.id) {
          await prisma.question.update({
            where: { id: q.id },
            data: {
              text: q.text,
              type: q.type,
              xpReward: q.xpReward,
              options: q.options,
              correct: q.correct,
            },
          });
        } else {
          await prisma.question.create({
            data: {
              quizId: id,
              text: q.text,
              type: q.type,
              xpReward: q.xpReward,
              options: q.options,
              correct: q.correct,
            },
          });
        }
      }
    } else {
      // 3. Create Quiz
      quiz = await prisma.quiz.create({
        data: {
          title: quizData.title,
          description: quizData.description,
          category: quizData.category,
          difficulty: quizData.difficulty,
          xpReward: quizData.xpReward,
          published: quizData.published,
          sequenceOrder: sequenceOrder || 1,
          questions: {
            create: questions.map((q) => ({
              text: q.text,
              type: q.type,
              xpReward: q.xpReward,
              options: q.options,
              correct: q.correct,
            })),
          },
        },
      });

      // Automatically unlock this quiz for users who have completed the previous ones,
      // or if it's the very first quiz, unlock it for everyone.
      if (sequenceOrder === 1) {
        const users = await prisma.user.findMany({ select: { id: true } });
        for (const user of users) {
          await prisma.userProgress.upsert({
            where: { userId_quizId: { userId: user.id, quizId: quiz.id } },
            update: { unlocked: true },
            create: { userId: user.id, quizId: quiz.id, unlocked: true },
          }).catch(() => {});
        }
      }
    }

    revalidatePath('/admin');
    revalidatePath('/dashboard');
    revalidatePath('/path');
    return { success: true, quizId: quiz.id };
  } catch (err: any) {
    console.error('[ADMIN ACTION] saveQuiz error:', err);
    return { success: false, error: err.message || 'Failed to save quiz.' };
  }
}

export async function getAdminAnalytics() {
  await ensureAdmin();
  try {
    const totalUsers = await prisma.user.count();
    const totalQuizzes = await prisma.quiz.count();
    const totalAttempts = await prisma.attempt.count();
    
    // Average score calculation
    const attempts = await prisma.attempt.findMany({ select: { score: true } });
    const averageScore = attempts.length
  ? Math.round(
      attempts.reduce(
        (sum: number, item: { score: number }) => sum + item.score,
        0
      ) / attempts.length
    )
  : 0;

    // Daily active streaks / top performance (users with streak > 0)
    const activeStreaksCount = await prisma.user.count({
      where: { currentStreak: { gt: 0 } }
    });

    // Recent attempts list
    const recentAttempts = await prisma.attempt.findMany({
      take: 5,
      orderBy: { completedAt: 'desc' },
      include: {
        user: { select: { name: true, email: true, avatarUrl: true } },
        quiz: { select: { title: true } },
      },
    });

    // Completion rate per quiz
    const quizzes = await prisma.quiz.findMany({
      include: {
        _count: { select: { attempts: true } },
      },
    });

    const quizStats = quizzes.map((q) => ({
      id: q.id,
      title: q.title,
      attemptsCount: q._count.attempts,
      category: q.category,
      difficulty: q.difficulty,
    }));

    return {
      totalUsers,
      totalQuizzes,
      totalAttempts,
      averageScore,
      activeStreaksCount,
      recentAttempts,
      quizStats,
    };
  } catch (err) {
    console.error('[ADMIN ACTION] getAdminAnalytics error:', err);
    return {
      totalUsers: 0,
      totalQuizzes: 0,
      totalAttempts: 0,
      averageScore: 0,
      activeStreaksCount: 0,
      recentAttempts: [],
      quizStats: [],
    };
  }
}

export async function getAdminUsers() {
  await ensureAdmin();
  try {
    return await prisma.user.findMany({
      orderBy: { totalXp: 'desc' },
      include: {
        _count: { select: { attempts: true, achievements: true } },
      },
    });
  } catch (err) {
    console.error('[ADMIN ACTION] getAdminUsers error:', err);
    return [];
  }
}

export async function updateUserRole(userId: string, newRole: 'USER' | 'ADMIN') {
  await ensureAdmin();
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });
    return { success: true, user: { id: user.id, email: user.email, role: user.role } };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
