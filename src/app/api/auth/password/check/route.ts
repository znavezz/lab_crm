import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserRepository } from '@/repositories/factory';

/**
 * GET /api/auth/password/check
 * Check if the current user has a password set
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userRepo = getUserRepository();
    const user = await userRepo.findById(session.user.id);

    return NextResponse.json({
      hasPassword: !!user?.password,
    });
  } catch (error) {
    console.error('Error checking password:', error);
    return NextResponse.json(
      { error: 'Failed to check password status' },
      { status: 500 }
    );
  }
}

