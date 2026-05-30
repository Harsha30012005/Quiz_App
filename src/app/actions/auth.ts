'use server';

import prisma from '@/lib/prisma';
import { signJWT } from '@/lib/jwt';
import { cookies } from 'next/headers';
import nodemailer from 'nodemailer';

// Simple in-memory fallback store for local development without database
const otpCache = new Map<string, { code: string; expiresAt: Date }>();

async function sendEmailOTP(email: string, code: string) {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || 'no-reply@quizapp.com';

  if (!host || !port || !user || !pass) {
    console.warn('[EMAIL SERVICE] SMTP details missing in .env. Skipping real email delivery.');
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from,
      to: email,
      subject: 'Your QUIZGO Verification OTP',
      text: `Your verification OTP is: ${code}. It expires in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 2px solid #e5e5e5; border-radius: 16px;">
          <h2 style="color: #58cc02; text-align: center; font-weight: 900; letter-spacing: 2px;">QUIZGO</h2>
          <p style="font-size: 16px; font-weight: bold; color: #3c3c3c; text-align: center;">Your One-Time verification passcode is:</p>
          <div style="background-color: #f7f7f7; border: 2px dashed #1cb0f6; border-radius: 12px; padding: 15px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: 950; letter-spacing: 5px; color: #1cb0f6;">${code}</span>
          </div>
          <p style="font-size: 12px; color: #afafaf; text-align: center; margin-top: 20px;">This passcode will expire in 10 minutes. If you did not request this code, please ignore this email.</p>
        </div>
      `,
    });

    console.log(`[EMAIL SERVICE] Successfully delivered OTP email to ${email}`);
    return true;
  } catch (error) {
    console.error('[EMAIL SERVICE ERROR] Failed to send email via SMTP:', error);
    return false;
  }
}

export async function sendOTP(email: string, isAdmin: boolean = false, adminCode?: string) {
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  const normalizedEmail = email.toLowerCase().trim();

  // 1. Two-part verification for Admins: Validate the special admin security code
  if (isAdmin) {
    if (adminCode !== '999999999') {
      return { success: false, error: 'Invalid Admin Security Code.' };
    }
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  console.log(`========================================`);
  console.log(`[AUTH] Generating OTP for ${normalizedEmail}: ${code}`);
  console.log(`[AUTH] Mode: ${isAdmin ? 'ADMIN' : 'USER'}`);
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

  // Send real email if SMTP is configured, otherwise notify log fallback
  const emailSent = await sendEmailOTP(normalizedEmail, code);

  if (emailSent) {
    return { 
      success: true, 
      message: 'A verification OTP has been sent to your email inbox.'
    };
  } else {
    return {
      success: true,
      message: 'SMTP credentials not configured. Please retrieve your OTP from the server terminal console logs.'
    };
  }
}

export async function verifyOTP(email: string, enteredCode: string, isAdmin: boolean = false) {
  if (!email || !enteredCode) {
    return { success: false, error: 'Email and verification code are required.' };
  }

  const normalizedEmail = email.toLowerCase().trim();
  let isValid = false;

  try {
    const otpRecord = await prisma.oTP.findFirst({
      where: { email: normalizedEmail },
      orderBy: { createdAt: 'desc' },
    });

    if (otpRecord && otpRecord.code === enteredCode && otpRecord.expiresAt > new Date()) {
      isValid = true;
      await prisma.oTP.delete({ where: { id: otpRecord.id } }).catch(() => {});
    }
  } catch (err) {
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
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      const role = isAdmin ? 'ADMIN' : 'USER';
      const defaultName = normalizedEmail.split('@')[0];
      const avatarUrl = `/avatars/avatar-${Math.floor(Math.random() * 8) + 1}.png`;

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

      if (role === 'USER') {
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
    } else {
      if (isAdmin && user.role !== 'ADMIN') {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { role: 'ADMIN' },
        });
      }
    }

    const sessionToken = await signJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const cookieStore = await cookies();
    cookieStore.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return { success: true, user: { id: user.id, email: user.email, role: user.role, name: user.name } };

  } catch (err: any) {
    console.error('Registration/Session error:', err);
    const mockUser = {
      id: 'mock-user-id',
      email: normalizedEmail,
      role: isAdmin ? 'ADMIN' as const : 'USER' as const,
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

    const { verifyJWT } = await import('@/lib/jwt');
    const userPayload = await verifyJWT(token);
    if (!userPayload) return null;

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
        bio: dbUser.bio,
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
      bio: null,
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
  return { success: true };
}
