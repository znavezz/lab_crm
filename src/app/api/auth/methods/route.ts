import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { hasuraQuery } from '@/lib/hasura-client';

interface UserAuthMethods {
  email: string;
  emailVerified: string | null;
  phone: string | null;
  phoneVerified: string | null;
  password: string | null;
  authenticators: Array<{
    credentialID: string;
    credentialDeviceType: string;
    transports: string | null;
  }>;
}

/**
 * GET /api/auth/methods
 * Get the authentication methods enabled for the current user
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

    const data = await hasuraQuery<{ User: UserAuthMethods | null }>(
      `query GetUserAuthMethods($id: String!) {
        User(id: $id) {
          email
          emailVerified
          phone
          phoneVerified
          password
          authenticators {
            credentialID
            credentialDeviceType
            transports
          }
        }
      }`,
      { id: session.user.id }
    );

    const user = data.User;

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      methods: {
        email: {
          enabled: true, // Email is always enabled
          verified: !!user.emailVerified,
          value: user.email,
        },
        password: {
          enabled: !!user.password,
        },
        sms: {
          enabled: !!user.phone,
          verified: !!user.phoneVerified,
          value: user.phone ? maskPhoneNumber(user.phone) : null,
        },
        webauthn: {
          enabled: user.authenticators.length > 0,
          count: user.authenticators.length,
          devices: user.authenticators.map((auth, index) => ({
            id: auth.credentialID,
            name: getDeviceName(auth.credentialDeviceType, index),
            type: auth.credentialDeviceType,
          })),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching auth methods:', error);
    return NextResponse.json(
      { error: 'Failed to fetch authentication methods' },
      { status: 500 }
    );
  }
}

function maskPhoneNumber(phone: string): string {
  if (phone.length < 4) return phone;
  return phone.slice(0, -4).replace(/\d/g, '*') + phone.slice(-4);
}

function getDeviceName(deviceType: string, index: number): string {
  const names: Record<string, string> = {
    singleDevice: 'This Device',
    multiDevice: 'Passkey',
  };
  const baseName = names[deviceType] || 'Security Key';
  return index === 0 ? baseName : `${baseName} ${index + 1}`;
}
