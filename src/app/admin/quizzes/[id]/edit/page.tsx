import { getQuizWithQuestions } from '@/app/actions/admin';
import QuizFormClient from '../../QuizFormClient';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface EditQuizPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditQuizPage({ params }: EditQuizPageProps) {
  const { id } = await params;
  const quiz = await getQuizWithQuestions(id);

  if (!quiz) {
    notFound();
  }

  // Cast prisma schemas to component interface matches
  const formattedQuiz = {
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    category: quiz.category,
    difficulty: quiz.difficulty,
    xpReward: quiz.xpReward,
    published: quiz.published,
    sequenceOrder: quiz.sequenceOrder,
    questions: quiz.questions.map((q) => ({
      id: q.id,
      text: q.text,
      type: q.type as 'SINGLE' | 'MULTIPLE',
      xpReward: q.xpReward,
      options: q.options,
      correct: q.correct,
    })),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
          Edit Quiz
        </h1>
        <p className="text-sm font-bold text-gray-400">
          Make updates to the quiz options, add questions, or modify incorrect answers.
        </p>
      </div>

      <QuizFormClient quiz={formattedQuiz} />
    </div>
  );
}
