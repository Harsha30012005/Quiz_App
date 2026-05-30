'use server';

import prisma from '@/lib/prisma';
import { getCurrentUser } from './auth';
import { revalidatePath } from 'next/cache';

export async function getQuizPath() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized.');
  }

  try {
    // 1. Fetch all published quizzes in sequenceOrder
    const quizzes = await prisma.quiz.findMany({
      where: { published: true },
      orderBy: { sequenceOrder: 'asc' },
      include: {
        _count: { select: { questions: true } },
      },
    });

    // 2. Fetch all completed quiz attempts for the user
    const completedAttempts = await prisma.attempt.findMany({
      where: { userId: user.id },
      select: { quizId: true, score: true },
    });

    const completedQuizIds = new Set(
      completedAttempts.filter((a: any) => a.score >= 80).map(a => a.quizId) // 80% passing grade
    );

    // 3. Map status
    const completedSequences = new Set<number>();
    
    // Find sequence numbers of quizzes the user has completed
    for (const q of quizzes) {
      if (completedQuizIds.has(q.id)) {
        completedSequences.add(q.sequenceOrder);
      }
    }

    const pathNodes = quizzes.map((quiz) => {
      const isCompleted = completedQuizIds.has(quiz.id);
      
      // Unlocked if first quiz OR if previous quiz is completed
      let isUnlocked = quiz.sequenceOrder === 1;
      if (!isUnlocked) {
        const prevSeq = quiz.sequenceOrder - 1;
        isUnlocked = completedSequences.has(prevSeq);
      }

      return {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        category: quiz.category,
        difficulty: quiz.difficulty,
        xpReward: quiz.xpReward,
        sequenceOrder: quiz.sequenceOrder,
        questionsCount: quiz._count.questions,
        isCompleted,
        isUnlocked,
      };
    });

    return { success: true, pathNodes, user };
  } catch (err: any) {
    console.error('[QUIZ ACTION] getQuizPath error:', err);
    return { success: false, pathNodes: [], user: null, error: err.message };
  }
}

export async function getQuizDetails(id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized.');

  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          select: {
            id: true,
            text: true,
            type: true,
            xpReward: true,
            options: true,
          },
        },
      },
    });

    if (!quiz || !quiz.published) return null;

    return quiz;
  } catch (err) {
    console.error('[QUIZ ACTION] getQuizDetails error:', err);
    return null;
  }
}

export async function checkQuestion(questionId: string, selected: string[]) {
  try {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: { correct: true },
    });
    if (!question) return { isCorrect: false, correct: [] };

    const correctSet = new Set(question.correct);
    const selectedSet = new Set(selected);

    const isCorrect = 
      correctSet.size === selectedSet.size && 
      [...correctSet].every(opt => selectedSet.has(opt));

    return { isCorrect, correct: question.correct };
  } catch (e) {
    return { isCorrect: false, correct: [] };
  }
}

interface SubmittedAnswer {
  questionId: string;
  selected: string[];
}

export async function submitQuizAttempt(
  quizId: string,
  submittedAnswers: SubmittedAnswer[],
  durationSeconds: number
) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) throw new Error('Unauthorized.');

  try {
    // 1. Fetch the quiz and correct answers
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    });

    if (!quiz || !quiz.published) {
      return { success: false, error: 'Quiz not found or not published.' };
    }

    // 2. Grade the attempt
    let correctCount = 0;
    let totalQuestionsXp = 0;
    
    const dbAnswersData: { questionId: string; selected: string[]; isCorrect: boolean }[] = [];

    for (const question of quiz.questions) {
      const submitted = submittedAnswers.find(sa => sa.questionId === question.id);
      const selected = submitted ? submitted.selected : [];
      
      const correctOptionsSet = new Set(question.correct);
      const selectedOptionsSet = new Set(selected);
      
      const isCorrect = 
        correctOptionsSet.size === selectedOptionsSet.size && 
        [...correctOptionsSet].every(opt => selectedOptionsSet.has(opt));

      if (isCorrect) {
        correctCount++;
        totalQuestionsXp += question.xpReward;
      }

      dbAnswersData.push({
        questionId: question.id,
        selected,
        isCorrect,
      });
    }

    const totalQuestions = quiz.questions.length;
    const scorePercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    
    const isPass = scorePercentage >= 80;
    const attemptXp = isPass ? (quiz.xpReward + totalQuestionsXp) : totalQuestionsXp;

    // 3. Begin Transaction to update stats
    const result = await prisma.$transaction(async (tx) => {
      // Get fresh User record
      const dbUser = await tx.user.findUniqueOrThrow({ where: { id: sessionUser.id } });

      // Create Attempt
      const attempt = await tx.attempt.create({
        data: {
          userId: dbUser.id,
          quizId,
          score: scorePercentage,
          xpEarned: attemptXp,
          duration: durationSeconds,
          answers: {
            create: dbAnswersData,
          },
        },
      });

      // Update XP History
      if (attemptXp > 0) {
        await tx.xPHistory.create({
          data: {
            userId: dbUser.id,
            xpGained: attemptXp,
            source: `QUIZ_COMPLETED: ${quiz.title}`,
          },
        });
      }

      // Calculate Streak Update
      let newStreak = dbUser.currentStreak;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const lastActive = dbUser.lastActiveDate ? new Date(dbUser.lastActiveDate) : null;
      if (lastActive) {
        lastActive.setHours(0, 0, 0, 0);
        
        if (lastActive.getTime() === yesterday.getTime()) {
          newStreak += 1;
        } else if (lastActive.getTime() < yesterday.getTime()) {
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }

      // Update User Progress Node Unlock details if passed
      let didUnlockNext = false;
      if (isPass) {
        await tx.userProgress.upsert({
          where: { userId_quizId: { userId: dbUser.id, quizId } },
          update: { completed: true, completedAt: new Date() },
          create: { userId: dbUser.id, quizId, unlocked: true, completed: true, completedAt: new Date() },
        });

        const nextQuiz = await tx.quiz.findUnique({
          where: { sequenceOrder: quiz.sequenceOrder + 1 },
        });

        if (nextQuiz) {
          await tx.userProgress.upsert({
            where: { userId_quizId: { userId: dbUser.id, quizId: nextQuiz.id } },
            update: { unlocked: true, unlockedAt: new Date() },
            create: { userId: dbUser.id, quizId: nextQuiz.id, unlocked: true, unlockedAt: new Date() },
          });
          didUnlockNext = true;
        }
      }

      // Update total XP, Levels, Streak
      const totalNewXp = dbUser.totalXp + attemptXp;
      
      const newLevel = Math.floor(totalNewXp / 150) + 1;
      const didLevelUp = newLevel > dbUser.level;

      await tx.user.update({
        where: { id: dbUser.id },
        data: {
          totalXp: totalNewXp,
          level: newLevel,
          currentStreak: newStreak,
          lastActiveDate: new Date(),
        },
      });

      // 4. Badge Milestones Evaluation
      const totalPassedAttempts = await tx.userProgress.count({
        where: { userId: dbUser.id, completed: true },
      });

      const totalCorrectAnswersCount = await tx.answer.count({
        where: { attempt: { userId: dbUser.id }, isCorrect: true },
      });

      const newAchievements: string[] = [];

      const allBadges = await tx.badge.findMany();

      for (const badge of allBadges) {
        let qualifies = false;
        
        if (badge.requirement === 'FIRST_QUIZ' && totalPassedAttempts >= 1) {
          qualifies = true;
        } else if (badge.requirement === 'STREAK_7' && newStreak >= 7) {
          qualifies = true;
        } else if (badge.requirement === 'MASTER_10' && totalPassedAttempts >= 10) {
          qualifies = true;
        } else if (badge.requirement === 'CORRECT_100' && totalCorrectAnswersCount >= 100) {
          qualifies = true;
        }

        if (qualifies) {
          const created = await tx.achievement.create({
            data: {
              userId: dbUser.id,
              badgeId: badge.id,
            },
          }).then(() => true).catch(() => false);

          if (created) {
            newAchievements.push(badge.name);
          }
        }
      }

      return {
        attemptId: attempt.id,
        score: scorePercentage,
        xpEarned: attemptXp,
        correctCount,
        totalQuestions,
        isPass,
        newStreak,
        newLevel,
        didLevelUp,
        newAchievements,
        didUnlockNext,
      };
    });

    revalidatePath('/dashboard');
    revalidatePath('/path');
    revalidatePath('/leaderboard');
    revalidatePath('/profile');

    return { success: true, results: result };
  } catch (err: any) {
    console.error('[QUIZ ACTION] submitQuizAttempt error:', err);
    return { success: false, error: err.message || 'Failed to submit quiz attempt.' };
  }
}
