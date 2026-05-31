import LoginClient from './LoginClient';

export default async function LoginPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative bouncy background circles */}
      <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-duo-green/10 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-80 h-80 rounded-full bg-duo-blue/10 blur-2xl pointer-events-none" />
      
      <LoginClient />
    </main>
  );
}
