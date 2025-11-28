import { NextRequest, NextResponse } from 'next/server';
import { getRepositories } from '@/repositories/factory';
import { verifyWebAuthnAuthentication } from '@/lib/webauthn';
import { signIn } from '@/lib/auth';
import type { AuthenticationResponseJSON } from '@simplewebauthn/types';

/**
 * POST /api/auth/webauthn/authenticate
 * Verify WebAuthn authentication and sign in the user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { response, email } = body as {
      response: AuthenticationResponseJSON;
      email: string;
    };

    if (!response || !email) {
      return NextResponse.json(
        { error: 'Authentication response and email are required' },
        { status: 400 }
      );
    }

    // Use repositories instead of direct Prisma
    const { user: userRepo, webauthn: webauthnRepo } = getRepositories();

    // Find user
    const user = await userRepo.findByEmail(email);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get the stored challenge
    const challengeRecord = await webauthnRepo.findLatestChallenge(
      user.id,
      'authentication'
    );

    if (!challengeRecord) {
      return NextResponse.json(
        { error: 'No valid challenge found or challenge has expired' },
        { status: 400 }
      );
    }

    const expectedChallenge = challengeRecord.challenge;

    // Find the authenticator being used
    const credentialID = Buffer.from(response.id, 'base64url').toString('base64url');
    const authenticator = await webauthnRepo.findAuthenticatorByCredentialId(
      user.id,
      credentialID
    );

    if (!authenticator) {
      return NextResponse.json(
        { error: 'Authenticator not found' },
        { status: 404 }
      );
    }

    // Verify the authentication
    const verification = await verifyWebAuthnAuthentication(
      response,
      expectedChallenge,
      authenticator
    );

    if (!verification.verified) {
      return NextResponse.json(
        { error: 'Authentication verification failed' },
        { status: 400 }
      );
    }

    // Update the authenticator counter
    await webauthnRepo.updateAuthenticatorCounter(
      user.id,
      authenticator.credentialID,
      verification.authenticationInfo.newCounter
    );

    // Delete the used challenge
    await webauthnRepo.deleteChallenge(challengeRecord.id);

    // Note: Actual session creation would happen through NextAuth
    // This endpoint verifies the WebAuthn response
    // The client should then call the NextAuth signin endpoint

    return NextResponse.json({
      success: true,
      verified: true,
      userId: user.id,
    });
  } catch (error) {
    console.error('Error authenticating with WebAuthn:', error);
    return NextResponse.json(
      { error: 'Failed to authenticate' },
      { status: 500 }
    );
  }
}

