'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ShieldCheck, ArrowRight, Zap, RefreshCw, AlertCircle } from 'lucide-react';
import { sendOTP, verifyOTP } from '@/app/actions/auth';

export default function LoginClient() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  
  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  // Poll for the dev helper cookie or read the action response
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await sendOTP(email);
      if (res.success) {
        setStep('otp');
        setMessage(res.message || null);
        if (res.devCode) {
          setDevOtp(res.devCode || null);
        }
      } else {
        setError(res.error || 'Something went wrong.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError('Please enter a 6-digit verification code.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await verifyOTP(email, otp);
      if (res.success) {
        if (res.user?.role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
        router.refresh();
      } else {
        setError(res.error || 'Verification failed.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Allow pasting 6-digit OTP
  const handleOtpChange = (val: string) => {
    const sanitized = val.replace(/\D/g, '').slice(0, 6);
    setOtp(sanitized);
  };

  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 z-10">
      {/* Title Header */}
      <div className="text-center mb-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-duo-green text-white shadow-lg shadow-duo-green/20">
          <Zap className="h-8 w-8 fill-current animate-pulse" />
        </div>
        <h2 className="mt-4 text-3xl font-extrabold text-gray-900 tracking-tight">
          QUIZGO
        </h2>
        <p className="mt-1 text-sm font-bold text-gray-500">
          Supercharge your learning streak
        </p>
      </div>

      <div className="card-3d bg-white py-8 px-6 sm:px-10">
        <AnimatePresence mode="wait">
          {step === 'email' ? (
            <motion.div
              key="email-step"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-xl font-extrabold text-gray-800 mb-2 text-center">
                Welcome back!
              </h3>
              <p className="text-sm font-semibold text-gray-400 mb-6 text-center">
                Enter your email address to receive a one-time sign-in code.
              </p>

              {error && (
                <div className="mb-4 flex items-center gap-2 rounded-xl border-2 border-red-100 bg-red-50 p-3 text-sm font-bold text-red-500">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSendEmail} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-extrabold text-gray-500 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Mail className="h-5 w-5" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="block w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl font-bold placeholder-gray-400 text-gray-800 focus:outline-none focus:border-duo-blue bg-gray-50/50 focus:bg-white transition-all text-base"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-3d-green py-3.5 text-base flex justify-center items-center gap-2"
                >
                  {loading ? (
                    <RefreshCw className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Send Sign-In Code
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="otp-step"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-xl font-extrabold text-gray-800 mb-2 text-center">
                Verify Your Email
              </h3>
              <p className="text-sm font-semibold text-gray-400 mb-4 text-center">
                We sent a 6-digit code to <span className="text-gray-600 font-bold">{email}</span>
              </p>

              {message && (
                <div className="mb-4 text-center rounded-xl bg-green-50 border-2 border-green-100 p-2.5 text-xs font-bold text-duo-green-dark">
                  {message}
                </div>
              )}

              {error && (
                <div className="mb-4 flex items-center gap-2 rounded-xl border-2 border-red-100 bg-red-50 p-3 text-sm font-bold text-red-500">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Dev Helper Code Display */}
              {devOtp && (
                <div className="mb-6 rounded-xl border-2 border-dashed border-duo-blue/30 bg-blue-50/30 p-3.5 text-center">
                  <span className="text-xs font-extrabold text-duo-blue tracking-wide uppercase">
                    Development OTP Helper
                  </span>
                  <div className="mt-1 text-2xl font-black tracking-widest text-duo-blue-dark">
                    {devOtp}
                  </div>
                  <p className="mt-0.5 text-[10px] text-gray-400 font-medium">
                    This box is displayed to simulate an email inbox check.
                  </p>
                </div>
              )}

              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div>
                  <label htmlFor="otp" className="block text-sm font-extrabold text-gray-500 mb-2 text-center">
                    Enter 6-Digit Code
                  </label>
                  <div className="flex justify-center relative">
                    <input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      required
                      value={otp}
                      onChange={(e) => handleOtpChange(e.target.value)}
                      placeholder="0 0 0 0 0 0"
                      className="block w-48 text-center py-3 border-2 border-gray-200 rounded-xl font-black text-2xl tracking-widest placeholder-gray-300 text-gray-800 focus:outline-none focus:border-duo-blue bg-gray-50/50 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-3d-blue py-3.5 text-base flex justify-center items-center gap-2"
                  >
                    {loading ? (
                      <RefreshCw className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        Verify & Login
                        <ShieldCheck className="h-5 w-5" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep('email');
                      setOtp('');
                      setDevOtp(null);
                    }}
                    className="w-full btn-3d-white py-3 text-sm"
                  >
                    Back to Email
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
