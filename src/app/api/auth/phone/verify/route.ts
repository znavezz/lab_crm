import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
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

    // Find the most recent unverified code for this user
    const smsCode = await prisma.smsVerificationCode.findFirst({
      where: {
        userId: session.user.id,
        verified: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

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
    await prisma.smsVerificationCode.update({
      where: { id: smsCode.id },
      data: { verified: true },
    });

    // Mark phone as verified
    await prisma.user.update({
      where: { id: session.user.id },
      data: { phoneVerified: new Date() },
    });

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

