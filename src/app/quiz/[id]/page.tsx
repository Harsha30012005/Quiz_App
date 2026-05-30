import { getQuizDetails } from '@/app/actions/quizzes';
import QuizEngineClient from './QuizEngineClient';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface QuizPageProps {
  params: Promise<{ id: string }>;
}

export default async function QuizPage({ params }: QuizPageProps) {
  const { id } = await params;
  const quiz = await getQuizDetails(id);

  if (!quiz) {
    notFound();
  }

  // Cast prisma model schema to engine input structure
  const formattedQuiz = {
    id: quiz.id,
    title: quiz.title,
    xpReward: quiz.xpReward,
    questions: quiz.questions.map((q) => ({
      id: q.id,
      text: q.text,
      type: q.type as 'SINGLE' | 'MULTIPLE',
      xpReward: q.xpReward,
      options: q.options,
    })),
  };

  return (
    <main className="min-h-screen bg-white flex flex-col justify-between">
      <QuizEngineClient quiz={formattedQuiz} />
    </main>
  );
}
