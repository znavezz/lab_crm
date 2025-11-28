import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getRepositories } from '@/repositories/factory';
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

    // Use repositories instead of direct Prisma
    const { user: userRepo, webauthn: webauthnRepo } = getRepositories();

    // Get user details
    const user = await userRepo.findById(session.user.id);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user's authenticators
    const authenticators = await webauthnRepo.findAuthenticatorsByUserId(user.id);

    // Generate registration options
    const options = await generateWebAuthnRegistrationOptions(
      user.id,
      user.name,
      user.email,
      authenticators
    );

    // Store challenge temporarily (5 minute expiry)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    // Delete any existing registration challenges for this user
    await webauthnRepo.deleteUserChallenges(user.id, 'registration');

    // Create new challenge
    await webauthnRepo.createChallenge({
      userId: user.id,
      challenge: options.challenge,
      expiresAt,
      type: 'registration',
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

