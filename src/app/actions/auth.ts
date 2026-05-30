'use server';

import prisma from '@/lib/prisma';
import { signJWT } from '@/lib/jwt';
import { cookies } from 'next/headers';

// Simple in-memory fallback store for local development without database
const otpCache = new Map<string, { code: string; expiresAt: Date }>();

export async function sendOTP(email: string) {
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  const normalizedEmail = email.toLowerCase().trim();
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  console.log(`========================================`);
  console.log(`[AUTH] Generating OTP for ${normalizedEmail}: ${code}`);
  console.log(`========================================`);

  try {
    // Delete any existing OTPs for this email
    await prisma.oTP.deleteMany({ where: { email: normalizedEmail } }).catch(() => {});
    
    // Save to Database
    await prisma.oTP.create({
      data: {
        email: normalizedEmail,
        code,
        expiresAt,
      },
    });
  } catch (err) {
    console.warn('[AUTH WARNING] Database not reachable. Falling back to in-memory OTP cache.');
    otpCache.set(normalizedEmail, { code, expiresAt });
  }

  // Set a development helper cookie so the frontend can display the code for easy local testing.
  // (In production, this would be sent via real email and NOT set in a readable cookie)
  const cookieStore = await cookies();
  cookieStore.set('dev_otp_helper', code, {
    maxAge: 60, // 1 minute
    path: '/',
    secure: false, // development helper
  });

  return { 
    success: true, 
    message: 'OTP has been generated and logged to the server console.',
    devCode: code // Exposed for seamless testing
  };
}

export async function verifyOTP(email: string, enteredCode: string) {
  if (!email || !enteredCode) {
    return { success: false, error: 'Email and verification code are required.' };
  }

  const normalizedEmail = email.toLowerCase().trim();
  let isValid = false;

  try {
    // 1. Fetch OTP from database
    const otpRecord = await prisma.oTP.findFirst({
      where: { email: normalizedEmail },
      orderBy: { createdAt: 'desc' },
    });

    if (otpRecord && otpRecord.code === enteredCode && otpRecord.expiresAt > new Date()) {
      isValid = true;
      // Delete the OTP
      await prisma.oTP.delete({ where: { id: otpRecord.id } }).catch(() => {});
    }
  } catch (err) {
    // 2. Fallback to in-memory cache
    const cached = otpCache.get(normalizedEmail);
    if (cached && cached.code === enteredCode && cached.expiresAt > new Date()) {
      isValid = true;
      otpCache.delete(normalizedEmail);
    }
  }

  if (!isValid) {
    return { success: false, error: 'The OTP code is invalid or has expired.' };
  }

  try {
    // Find or create User
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Determine role: set first user as ADMIN, or if email starts with admin@
      const userCount = await prisma.user.count().catch(() => 0);
      const role = (userCount === 0 || normalizedEmail.startsWith('admin@')) ? 'ADMIN' : 'USER';
      
      const defaultName = normalizedEmail.split('@')[0];
      const avatarUrl = `/avatars/avatar-${Math.floor(Math.random() * 8) + 1}.png`; // random default avatar ID

      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          name: defaultName.charAt(0).toUpperCase() + defaultName.slice(1),
          role,
          avatarUrl,
          level: 1,
          totalXp: 0,
          currentStreak: 0,
        },
      });

      // Unlock first quiz node for the user if quizzes exist
      const firstQuiz = await prisma.quiz.findFirst({
        orderBy: { sequenceOrder: 'asc' },
      });

      if (firstQuiz) {
        await prisma.userProgress.create({
          data: {
            userId: user.id,
            quizId: firstQuiz.id,
            unlocked: true,
            completed: false,
          },
        }).catch(() => {});
      }
    }

    // Sign session JWT
    const sessionToken = await signJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Save session in cookie
    const cookieStore = await cookies();
    cookieStore.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    // Clear dev_otp_helper cookie
    cookieStore.delete('dev_otp_helper');

    return { success: true, user: { id: user.id, email: user.email, role: user.role, name: user.name } };

  } catch (err: any) {
    console.error('Registration/Session error:', err);
    // Even if db registration fails completely, we can return a mock user for local-only testing
    const mockUser = {
      id: 'mock-user-id',
      email: normalizedEmail,
      role: normalizedEmail.startsWith('admin') ? 'ADMIN' : 'USER',
      name: normalizedEmail.split('@')[0],
    };

    const sessionToken = await signJWT({
      userId: mockUser.id,
      email: mockUser.email,
      role: mockUser.role,
    });

    const cookieStore = await cookies();
    cookieStore.set('session', sessionToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });
    cookieStore.delete('dev_otp_helper');

    return { 
      success: true, 
      user: mockUser,
      warning: 'Database registration failed. Logged in as a mock developer user.'
    };
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    if (!token) return null;

    const payload = await signJWT({ userId: '', email: '', role: '' }); // check verification imports
    // decrypt actually:
    const { verifyJWT } = await import('@/lib/jwt');
    const userPayload = await verifyJWT(token);
    if (!userPayload) return null;

    // Try fetching detailed database details
    const dbUser = await prisma.user.findUnique({
      where: { id: userPayload.userId },
    }).catch(() => null);

    if (dbUser) {
      return {
        id: dbUser.id,
        email: dbUser.email,
        role: dbUser.role,
        name: dbUser.name,
        avatarUrl: dbUser.avatarUrl,
        level: dbUser.level,
        totalXp: dbUser.totalXp,
        currentStreak: dbUser.currentStreak,
      };
    }

    return {
      id: userPayload.userId,
      email: userPayload.email,
      role: userPayload.role,
      name: userPayload.email.split('@')[0],
      avatarUrl: '/avatars/avatar-1.png',
      level: 1,
      totalXp: 0,
      currentStreak: 0,
    };
  } catch (e) {
    return null;
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
  cookieStore.delete('dev_otp_helper');
  return { success: true };
}
