'use server';

import prisma from '@/lib/prisma';
import { getCurrentUser } from './auth';
import { revalidatePath } from 'next/cache';

export async function updateProfile(data: { name: string; bio: string; avatarUrl: string }) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized.');
  }

  try {
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: data.name.trim(),
        bio: data.bio.trim(),
        avatarUrl: data.avatarUrl.trim(),
      },
    });

    // Revalidate paths to refresh layouts and details
    revalidatePath('/dashboard');
    revalidatePath('/profile');
    revalidatePath('/admin');
    revalidatePath('/admin/users');

    return { 
      success: true, 
      user: { 
        name: updated.name, 
        bio: updated.bio, 
        avatarUrl: updated.avatarUrl 
      } 
    };
  } catch (err: any) {
    console.error('[PROFILE ACTION] updateProfile error:', err);
    return { success: false, error: err.message || 'Failed to update profile.' };
  }
}
