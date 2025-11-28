import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateWebAuthnAuthenticationOptions } from '@/lib/webauthn';

/**
 * POST /api/auth/webauthn/authenticate-options
 * Generate authentication options for WebAuthn signin
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user and their authenticators
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: {
        id: true,
        authenticators: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.authenticators.length === 0) {
      return NextResponse.json(
        { error: 'No authenticators registered for this user' },
        { status: 400 }
      );
    }

    // Generate authentication options
    const options = await generateWebAuthnAuthenticationOptions(
      user.authenticators
    );

    // Store challenge temporarily (5 minute expiry)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    // Delete any existing authentication challenges for this user
    await prisma.webAuthnChallenge.deleteMany({
      where: {
        userId: user.id,
        type: 'authentication',
      },
    });

    // Create new challenge
    await prisma.webAuthnChallenge.create({
      data: {
        userId: user.id,
        challenge: options.challenge,
        expiresAt,
        type: 'authentication',
      },
    });

    return NextResponse.json(options);
  } catch (error) {
    console.error('Error generating authentication options:', error);
    return NextResponse.json(
      { error: 'Failed to generate authentication options' },
      { status: 500 }
    );
  }
}

