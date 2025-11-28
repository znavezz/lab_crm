import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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

    // Get the stored challenge
    const challengeRecord = await prisma.webAuthnChallenge.findFirst({
      where: {
        userId: user.id,
        type: 'authentication',
        expiresAt: { gt: new Date() }, // Not expired
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!challengeRecord) {
      return NextResponse.json(
        { error: 'No valid challenge found or challenge has expired' },
        { status: 400 }
      );
    }

    const expectedChallenge = challengeRecord.challenge;

    // Find the authenticator being used
    const credentialID = Buffer.from(response.id, 'base64url').toString('base64url');
    const authenticator = user.authenticators.find(
      (auth) => auth.credentialID === credentialID
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

    // Update the authenticator counter and delete the challenge (transaction)
    await prisma.$transaction([
      prisma.authenticator.update({
        where: {
          userId_credentialID: {
            userId: user.id,
            credentialID: authenticator.credentialID,
          },
        },
        data: {
          counter: verification.authenticationInfo.newCounter,
        },
      }),
      // Delete the used challenge
      prisma.webAuthnChallenge.delete({
        where: { id: challengeRecord.id },
      }),
    ]);

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

