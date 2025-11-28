import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { verifyWebAuthnRegistration } from '@/lib/webauthn';
import type { RegistrationResponseJSON } from '@simplewebauthn/types';

/**
 * POST /api/auth/webauthn/register
 * Verify and store a new WebAuthn credential
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
    const { response, deviceName } = body as {
      response: RegistrationResponseJSON;
      deviceName?: string;
    };

    if (!response) {
      return NextResponse.json(
        { error: 'Registration response is required' },
        { status: 400 }
      );
    }

    // Get stored challenge
    const challengeRecord = await prisma.webAuthnChallenge.findFirst({
      where: {
        userId: session.user.id,
        type: 'registration',
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

    // Verify the registration
    const verification = await verifyWebAuthnRegistration(
      response,
      expectedChallenge
    );

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json(
        { error: 'Registration verification failed' },
        { status: 400 }
      );
    }

    const { credential } = verification.registrationInfo;

    // Store the authenticator and delete the challenge (transaction for atomicity)
    await prisma.$transaction([
      prisma.authenticator.create({
        data: {
          credentialID: Buffer.from(credential.id).toString('base64url'),
          userId: session.user.id,
          providerAccountId: Buffer.from(credential.id).toString('base64url'),
          credentialPublicKey: Buffer.from(credential.publicKey).toString('base64url'),
          counter: credential.counter,
          credentialDeviceType: verification.registrationInfo.credentialDeviceType,
          credentialBackedUp: verification.registrationInfo.credentialBackedUp,
          transports: credential.transports ? JSON.stringify(credential.transports) : null,
        },
      }),
      // Delete the used challenge
      prisma.webAuthnChallenge.delete({
        where: { id: challengeRecord.id },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Authenticator registered successfully',
    });
  } catch (error) {
    console.error('Error registering authenticator:', error);
    return NextResponse.json(
      { error: 'Failed to register authenticator' },
      { status: 500 }
    );
  }
}

