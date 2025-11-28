import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getRepositories } from '@/repositories/factory';
import { verifySmsCode } from '@/lib/auth/sms-service';

/**
 * POST /api/auth/phone/verify
 * Verify a phone number with the SMS code
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
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { error: 'Verification code is required' },
        { status: 400 }
      );
    }

    // Use repositories instead of direct Prisma
    const { user: userRepo, smsCode: smsRepo } = getRepositories();

    // Find the most recent unverified code for this user
    const smsCode = await smsRepo.findLatestByUserId(session.user.id);

    if (!smsCode) {
      return NextResponse.json(
        { error: 'No verification code found' },
        { status: 404 }
      );
    }

    // Verify the code
    const verification = verifySmsCode(smsCode.code, code, smsCode.expiresAt);

    if (!verification.isValid) {
      return NextResponse.json(
        { error: verification.error },
        { status: 400 }
      );
    }

    // Mark code as verified
    await smsRepo.markAsVerified(smsCode.id);

    // Mark phone as verified
    const user = await userRepo.findById(session.user.id);
    if (user?.phone) {
      await userRepo.updatePhone(session.user.id, user.phone, true);
    }

    return NextResponse.json({
      success: true,
      message: 'Phone number verified successfully',
    });
  } catch (error) {
    console.error('Error verifying phone:', error);
    return NextResponse.json(
      { error: 'Failed to verify phone number' },
      { status: 500 }
    );
  }
}

