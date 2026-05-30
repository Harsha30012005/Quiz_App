import prisma from '../src/lib/prisma.js';

async function main() {
  console.log('Seeding database with initial data...');

  // 1. Create Badges
  const badges = [
    {
      name: 'First Quiz',
      description: 'Completed your very first quiz on the platform!',
      iconUrl: '/badges/first-quiz.png',
      requirement: 'FIRST_QUIZ',
      threshold: 1,
    },
    {
      name: '7-Day Streak',
      description: 'Maintained a daily login and quiz completion streak of 7 days.',
      iconUrl: '/badges/streak-7.png',
      requirement: 'STREAK_7',
      threshold: 7,
    },
    {
      name: 'Quiz Master',
      description: 'Completed a total of 10 quizzes on the platform.',
      iconUrl: '/badges/quiz-master.png',
      requirement: 'MASTER_10',
      threshold: 10,
    },
    {
      name: 'Centurion',
      description: 'Answered 100 questions correctly across all attempts.',
      iconUrl: '/badges/correct-100.png',
      requirement: 'CORRECT_100',
      threshold: 100,
    },
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: badge,
      create: badge,
    });
  }
  console.log('Badges upserted.');

  // 2. Create Quizzes and Questions
  // Quiz 1 (Easy) - Sequence Order 1
  const quiz1 = await prisma.quiz.upsert({
    where: { sequenceOrder: 1 },
    update: {
      title: 'JavaScript Basics',
      description: 'Learn the fundamental building blocks of JavaScript development including variables, types, and loops.',
      category: 'Programming Basics',
      difficulty: 'EASY',
      xpReward: 50,
      published: true,
    },
    create: {
      title: 'JavaScript Basics',
      description: 'Learn the fundamental building blocks of JavaScript development including variables, types, and loops.',
      category: 'Programming Basics',
      difficulty: 'EASY',
      xpReward: 50,
      published: true,
      sequenceOrder: 1,
    },
  });

  // Questions for Quiz 1
  const q1_1 = {
    quizId: quiz1.id,
    text: 'Which of the following is correct for variable declaration in JavaScript?',
    type: 'MULTIPLE' as const,
    xpReward: 10,
    options: ['var', 'let', 'const', 'define'],
    correct: ['var', 'let', 'const'],
  };

  const q1_2 = {
    quizId: quiz1.id,
    text: 'What is the output of: typeof null ?',
    type: 'SINGLE' as const,
    xpReward: 10,
    options: ['"null"', '"undefined"', '"object"', '"string"'],
    correct: ['"object"'],
  };

  const q1_3 = {
    quizId: quiz1.id,
    text: 'Which array method adds elements to the end of an array and returns its new length?',
    type: 'SINGLE' as const,
    xpReward: 10,
    options: ['pop()', 'push()', 'shift()', 'unshift()'],
    correct: ['push()'],
  };

  // Re-create questions for Quiz 1
  await prisma.question.deleteMany({ where: { quizId: quiz1.id } });
  await prisma.question.createMany({
    data: [q1_1, q1_2, q1_3],
  });

  // Quiz 2 (Medium) - Sequence Order 2
  const quiz2 = await prisma.quiz.upsert({
    where: { sequenceOrder: 2 },
    update: {
      title: 'React Core & Hooks',
      description: 'Master component state, props, lifecycle events, and the most common React Hooks.',
      category: 'Frontend Frameworks',
      difficulty: 'MEDIUM',
      xpReward: 75,
      published: true,
    },
    create: {
      title: 'React Core & Hooks',
      description: 'Master component state, props, lifecycle events, and the most common React Hooks.',
      category: 'Frontend Frameworks',
      difficulty: 'MEDIUM',
      xpReward: 75,
      published: true,
      sequenceOrder: 2,
    },
  });

  // Questions for Quiz 2
  const q2_1 = {
    quizId: quiz2.id,
    text: 'Which Hook is designed to execute side effects in React functional components?',
    type: 'SINGLE' as const,
    xpReward: 15,
    options: ['useState', 'useContext', 'useEffect', 'useMemo'],
    correct: ['useEffect'],
  };

  const q2_2 = {
    quizId: quiz2.id,
    text: 'What are the rules of Hooks in React? (Select all that apply)',
    type: 'MULTIPLE' as const,
    xpReward: 15,
    options: [
      'Only call Hooks at the top level',
      'Only call Hooks from React functions',
      'Hooks can be called inside conditional statements',
      'Hooks can be called inside regular JS loops',
    ],
    correct: ['Only call Hooks at the top level', 'Only call Hooks from React functions'],
  };

  const q2_3 = {
    quizId: quiz2.id,
    text: 'In React, components can re-render when which of the following changes?',
    type: 'MULTIPLE' as const,
    xpReward: 15,
    options: ['State', 'Props', 'Local variables outside of state', 'Context values'],
    correct: ['State', 'Props', 'Context values'],
  };

  await prisma.question.deleteMany({ where: { quizId: quiz2.id } });
  await prisma.question.createMany({
    data: [q2_1, q2_2, q2_3],
  });

  // Quiz 3 (Hard) - Sequence Order 3
  const quiz3 = await prisma.quiz.upsert({
    where: { sequenceOrder: 3 },
    update: {
      title: 'Next.js 15 App Router',
      description: 'Deep dive into App Router architecture, Server Components, API routes, and Server Actions.',
      category: 'Frontend Frameworks',
      difficulty: 'HARD',
      xpReward: 100,
      published: true,
    },
    create: {
      title: 'Next.js 15 App Router',
      description: 'Deep dive into App Router architecture, Server Components, API routes, and Server Actions.',
      category: 'Frontend Frameworks',
      difficulty: 'HARD',
      xpReward: 100,
      published: true,
      sequenceOrder: 3,
    },
  });

  // Questions for Quiz 3
  const q3_1 = {
    quizId: quiz3.id,
    text: 'By default, all components inside the Next.js App Router are Client Components.',
    type: 'SINGLE' as const,
    xpReward: 20,
    options: ['True', 'False'],
    correct: ['False'],
  };

  const q3_2 = {
    quizId: quiz3.id,
    text: 'To convert a Server Component into a Client Component, what directive must be placed at the very top of the file?',
    type: 'SINGLE' as const,
    xpReward: 20,
    options: ['"use client"', '"use client side"', '"use react"', 'import React from "react"'],
    correct: ['"use client"'],
  };

  const q3_3 = {
    quizId: quiz3.id,
    text: 'Which files have special roles in Next.js 15 dynamic routing directories? (Select all that apply)',
    type: 'MULTIPLE' as const,
    xpReward: 20,
    options: ['page.tsx', 'layout.tsx', 'loading.tsx', 'error.tsx', 'style.css'],
    correct: ['page.tsx', 'layout.tsx', 'loading.tsx', 'error.tsx'],
  };

  await prisma.question.deleteMany({ where: { quizId: quiz3.id } });
  await prisma.question.createMany({
    data: [q3_1, q3_2, q3_3],
  });

  console.log('Quizzes and questions seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
