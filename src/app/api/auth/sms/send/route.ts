import { NextRequest, NextResponse } from 'next/server';
import { getRepositories } from '@/repositories/factory';
import { generateSmsCode } from '@/lib/auth/sms-service';
import { validatePhoneNumber, sanitizePhoneNumber } from '@/lib/auth/phone-service';
import { sendSmsCode } from '@/lib/sms';

/**
 * POST /api/auth/sms/send
 * Generate and send an SMS verification code
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Validate phone number
    const sanitized = sanitizePhoneNumber(phone);
    const validation = validatePhoneNumber(sanitized);

    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Use repositories instead of direct Prisma
    const { user: userRepo, smsCode: smsRepo } = getRepositories();

    // Find user with this phone number
    const user = await userRepo.findByPhone(validation.formatted);

    if (!user) {
      return NextResponse.json(
        { error: 'No user found with this phone number' },
        { status: 404 }
      );
    }

    // Delete any existing unverified codes for this user
    await smsRepo.deleteByUserId(user.id);

    // Generate new code
    const { code, expiresAt } = generateSmsCode();

    // Save code to database
    await smsRepo.create({
      userId: user.id,
      code,
      expiresAt,
    });

    // Send SMS (this will be stubbed unless configured)
    const result = await sendSmsCode(validation.formatted!, code);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send SMS' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent',
      // In development/stub mode, include the code in response
      ...(process.env.SMS_PROVIDER === 'stub' && { code }),
    });
  } catch (error) {
    console.error('Error sending SMS:', error);
    return NextResponse.json(
      { error: 'Failed to send SMS code' },
      { status: 500 }
    );
  }
}

