import QuizFormClient from '../QuizFormClient';
import { Plus } from 'lucide-react';

export default function NewQuizPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
          <Plus className="text-duo-green h-8 w-8" />
          Create New Quiz
        </h1>
        <p className="text-sm font-bold text-gray-400">
          Configure a new node, define multiple questions, select correct answers, and publish.
        </p>
      </div>

      <QuizFormClient quiz={null} />
    </div>
  );
}
