import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateWebAuthnRegistrationOptions } from '@/lib/webauthn';

/**
 * GET /api/auth/webauthn/register-options
 * Generate registration options for WebAuthn credential
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

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        authenticators: {
          select: { credentialID: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Generate registration options
    const options = await generateWebAuthnRegistrationOptions(
      user.id,
      user.name,
      user.email,
      user.authenticators
    );

    // Store challenge temporarily (5 minute expiry)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    // Delete any existing registration challenges for this user
    await prisma.webAuthnChallenge.deleteMany({
      where: {
        userId: user.id,
        type: 'registration',
      },
    });

    // Create new challenge
    await prisma.webAuthnChallenge.create({
      data: {
        userId: user.id,
        challenge: options.challenge,
        expiresAt,
        type: 'registration',
      },
    });

    return NextResponse.json(options);
  } catch (error) {
    console.error('Error generating registration options:', error);
    return NextResponse.json(
      { error: 'Failed to generate registration options' },
      { status: 500 }
    );
  }
}

