import Link from 'next/link';
import { Zap, Trophy, Flame, ChevronRight, Award, Layers } from 'lucide-react';
import { getCurrentUser } from '@/app/actions/auth';
import { redirect } from 'next/navigation';

export default async function LandingPage() {
  const user = await getCurrentUser();
  
  // If user is already logged in, redirect them to their path immediately
  if (user) {
    if (user.role === 'ADMIN') {
      redirect('/admin');
    } else {
      redirect('/path');
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col justify-between overflow-x-hidden relative">
      {/* Decorative gradient blur */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-duo-green/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 rounded-full bg-duo-blue/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between border-b-2 border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-black tracking-wider text-duo-green">
            QUIZGO
          </span>
          <div className="rounded-full bg-duo-blue p-1 text-white">
            <Zap className="h-5 w-5 fill-current animate-pulse" />
          </div>
        </div>
        <Link href="/login" className="btn-3d-white px-6 py-2.5 text-sm">
          Sign In
        </Link>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col md:flex-row items-center gap-12 flex-1 justify-center">
        <div className="flex-1 space-y-6 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-duo-orange/10 text-duo-orange border-2 border-duo-orange/20 font-black text-xs uppercase tracking-wider animate-bounce">
            <Flame className="h-4 w-4 fill-current" />
            Keep the Streak Alive!
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-gray-900 leading-tight">
            The free, fun, and effective way to <span className="text-duo-blue">learn code</span>!
          </h1>
          <p className="text-lg font-bold text-gray-500 max-w-xl mx-auto md:mx-0">
            Learn Programming, Web Development, and Computer Science concepts through short, interactive quiz paths inspired by gamified language lessons.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Link href="/login" className="btn-3d-green px-8 py-4 text-lg flex items-center gap-2 justify-center shadow-lg shadow-duo-green/20">
              Get Started
              <ChevronRight className="h-6 w-6" />
            </Link>
            <a href="#features" className="btn-3d-white px-8 py-4 text-lg flex items-center justify-center">
              Learn More
            </a>
          </div>
        </div>

        {/* Visual Mockups */}
        <div className="flex-1 w-full max-w-md">
          <div className="card-3d p-6 space-y-6 relative bg-white max-w-sm mx-auto shadow-xl">
            {/* Duolingo style stats preview widget */}
            <div className="flex justify-between items-center pb-4 border-b-2 border-gray-100">
              <div className="flex items-center gap-1.5 text-duo-orange font-black">
                <Flame className="h-6 w-6 fill-current text-duo-orange" />
                <span>7 Day Streak</span>
              </div>
              <div className="flex items-center gap-1.5 text-duo-blue font-black">
                <Zap className="h-6 w-6 fill-current text-duo-blue" />
                <span>1,250 XP</span>
              </div>
              <div className="text-duo-green font-black">
                Lvl 5
              </div>
            </div>

            {/* Path Node Demo */}
            <div className="space-y-4">
              <span className="text-xs font-extrabold text-gray-400 uppercase tracking-widest block">Learning Progression</span>
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-duo-green border-4 border-duo-green-dark shadow-md flex items-center justify-center text-white font-extrabold text-lg select-none ring-8 ring-duo-green/20 animate-bounce">
                    1
                  </div>
                  <div className="absolute -top-2 -right-2 bg-duo-orange text-white text-[10px] font-black px-1.5 py-0.5 rounded-full border-2 border-white flex items-center gap-0.5">
                    <Flame className="h-2.5 w-2.5 fill-current" /> Active
                  </div>
                </div>
                <div className="w-1.5 h-10 bg-gray-200 rounded-full" />
                <div className="w-16 h-16 rounded-full bg-gray-200 border-4 border-gray-300 flex items-center justify-center text-gray-400 font-extrabold text-lg select-none">
                  2
                </div>
              </div>
            </div>

            {/* Achievement Toast Demo */}
            <div className="flex items-center gap-3 border-t-2 border-gray-100 pt-4">
              <div className="h-10 w-10 bg-duo-orange/10 rounded-xl border-2 border-duo-orange/20 flex items-center justify-center text-duo-orange">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-xs font-black text-gray-800">Badge Unlocked!</h4>
                <p className="text-[10px] text-gray-400 font-bold">First Quiz Master badge awarded</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white border-t-2 border-gray-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl font-black text-gray-900">
              Why Learn with QuizGo?
            </h2>
            <p className="text-base font-bold text-gray-500">
              Traditional quizzes are boring. We combine cognitive science, learning paths, and visual feedback loop rewards to make coding concepts stick.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card-3d p-6 space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-duo-green/10 border-2 border-duo-green/20 flex items-center justify-center text-duo-green">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-gray-800">Node-Based Path</h3>
              <p className="text-sm font-semibold text-gray-500 leading-relaxed">
                Quizzes are connected in a logical learning sequence. Completing a quiz unlocks the path to the next node, offering a clear guide to mastery.
              </p>
            </div>

            <div className="card-3d p-6 space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-duo-orange/10 border-2 border-duo-orange/20 flex items-center justify-center text-duo-orange">
                <Flame className="h-6 w-6 fill-current" />
              </div>
              <h3 className="text-lg font-black text-gray-800">Streak Mechanics</h3>
              <p className="text-sm font-semibold text-gray-500 leading-relaxed">
                Stay motivated by keeping your daily practice streak alive. Compete to prevent your streak fire count from burning out.
              </p>
            </div>

            <div className="card-3d p-6 space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-duo-blue/10 border-2 border-duo-blue/20 flex items-center justify-center text-duo-blue">
                <Trophy className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-gray-800">Weekly Leaderboards</h3>
              <p className="text-sm font-semibold text-gray-500 leading-relaxed">
                Rank against other programmers in weekly XP leaderboards. Climb the ranks from Bronze to Diamond levels.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 border-t-2 border-gray-800 text-center text-xs font-bold">
        <p>© 2026 QuizGo Platform. Engineered for ultimate developer engagement.</p>
      </footer>
    </main>
  );
}
