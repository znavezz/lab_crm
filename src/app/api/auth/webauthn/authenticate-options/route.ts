import { NextRequest, NextResponse } from 'next/server';
import { getRepositories } from '@/repositories/factory';
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

    // Use repositories instead of direct Prisma
    const { user: userRepo, webauthn: webauthnRepo } = getRepositories();

    // Find user and their authenticators
    const user = await userRepo.findByEmail(email);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const authenticators = await webauthnRepo.findAuthenticatorsByUserId(user.id);

    if (authenticators.length === 0) {
      return NextResponse.json(
        { error: 'No authenticators registered for this user' },
        { status: 400 }
      );
    }

    // Generate authentication options
    const options = await generateWebAuthnAuthenticationOptions(authenticators);

    // Store challenge temporarily (5 minute expiry)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    // Delete any existing authentication challenges for this user
    await webauthnRepo.deleteUserChallenges(user.id, 'authentication');

    // Create new challenge
    await webauthnRepo.createChallenge({
      userId: user.id,
      challenge: options.challenge,
      expiresAt,
      type: 'authentication',
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

