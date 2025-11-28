import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { validatePhoneNumber, sanitizePhoneNumber } from '@/lib/auth/phone-service';
import { generateSmsCode } from '@/lib/auth/sms-service';
import { sendSmsCode } from '@/lib/sms';

/**
 * POST /api/auth/phone/add
 * Add a phone number to the user's account and send verification code
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
    const { phone } = body;

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Validate and format phone number
    const sanitized = sanitizePhoneNumber(phone);
    const validation = validatePhoneNumber(sanitized);

    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Check if phone number is already in use by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        phone: validation.formatted,
        NOT: { id: session.user.id },
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'This phone number is already in use' },
        { status: 400 }
      );
    }

    // Update user's phone number (unverified)
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        phone: validation.formatted,
        phoneVerified: null, // Clear verification until code is verified
      },
    });

    // Delete any existing verification codes
    await prisma.smsVerificationCode.deleteMany({
      where: {
        userId: session.user.id,
        verified: false,
      },
    });

    // Generate and send verification code
    const { code, expiresAt } = generateSmsCode();

    await prisma.smsVerificationCode.create({
      data: {
        userId: session.user.id,
        code,
        expiresAt,
      },
    });

    const result = await sendSmsCode(validation.formatted!, code);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send verification code' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Phone number added. Verification code sent.',
      phone: validation.formatted,
      // In development/stub mode, include the code in response
      ...(process.env.SMS_PROVIDER === 'stub' && { code }),
    });
  } catch (error) {
    console.error('Error adding phone number:', error);
    return NextResponse.json(
      { error: 'Failed to add phone number' },
      { status: 500 }
    );
  }
}

