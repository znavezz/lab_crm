import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hashPassword, checkPasswordStrength } from '@/lib/auth/password-service';

/**
 * POST /api/auth/password/set
 * Set or update a user's password
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { password, currentPassword } = body;

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    // Check password strength
    const strength = checkPasswordStrength(password);
    if (!strength.isValid) {
      return NextResponse.json(
        { error: 'Password does not meet requirements', feedback: strength.feedback },
        { status: 400 }
      );
    }

    // Get the user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // If user already has a password, verify the current password
    if (user.password && !currentPassword) {
      return NextResponse.json(
        { error: 'Current password is required to change password' },
        { status: 400 }
      );
    }

    if (user.password && currentPassword) {
      const { verifyPassword } = await import('@/lib/auth/password-service');
      const isValid = await verifyPassword(currentPassword, user.password);
      if (!isValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        );
      }
    }

    // Hash and save the new password
    const hashedPassword = await hashPassword(password);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({
      success: true,
      message: user.password ? 'Password updated successfully' : 'Password set successfully',
    });
  } catch (error) {
    console.error('Error setting password:', error);
    return NextResponse.json(
      { error: 'Failed to set password' },
      { status: 500 }
    );
  }
}

