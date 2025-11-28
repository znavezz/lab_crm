/**
 * WebAuthn Utilities
 * 
 * Handles biometric authentication (Face ID, Touch ID, Windows Hello, etc.)
 * using the WebAuthn standard via SimpleWebAuthn library.
 */

import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  type GenerateRegistrationOptionsOpts,
  type GenerateAuthenticationOptionsOpts,
  type VerifyRegistrationResponseOpts,
  type VerifyAuthenticationResponseOpts,
  type VerifiedRegistrationResponse,
  type VerifiedAuthenticationResponse,
} from '@simplewebauthn/server';

import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from '@simplewebauthn/types';

// Configuration from environment variables
export const rpName = process.env.WEBAUTHN_RP_NAME || 'Lab CRM';
export const rpID = process.env.WEBAUTHN_RP_ID || 'localhost';
export const origin = process.env.WEBAUTHN_ORIGIN || 'http://localhost:3000';

/**
 * Authenticator data structure (matches Prisma model)
 */
export interface AuthenticatorData {
  credentialID: string;
  credentialPublicKey: string;
  counter: number;
  credentialDeviceType: string;
  credentialBackedUp: boolean;
  transports?: string;
}

/**
 * Generate registration options for a new WebAuthn credential
 * 
 * @param userId - User's unique ID
 * @param userName - User's name
 * @param userEmail - User's email
 * @param excludeCredentials - Array of existing credential IDs to exclude
 * @returns Registration options to send to the client
 */
export async function generateWebAuthnRegistrationOptions(
  userId: string,
  userName: string,
  userEmail: string,
  excludeCredentials: { id: string }[] = []
) {
  const options: GenerateRegistrationOptionsOpts = {
    rpName,
    rpID,
    userName: userEmail,
    userDisplayName: userName,
    userID: Buffer.from(userId),
    attestationType: 'none',
    excludeCredentials: excludeCredentials.map((cred) => ({
      id: Buffer.from(cred.id, 'base64url'),
      type: 'public-key',
    })),
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'preferred',
      authenticatorAttachment: 'platform',
    },
  };

  return generateRegistrationOptions(options);
}

/**
 * Verify a WebAuthn registration response
 * 
 * @param response - Response from the client
 * @param expectedChallenge - The challenge that was sent to the client
 * @returns Verified registration data
 */
export async function verifyWebAuthnRegistration(
  response: RegistrationResponseJSON,
  expectedChallenge: string
): Promise<VerifiedRegistrationResponse> {
  const opts: VerifyRegistrationResponseOpts = {
    response,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
  };

  return verifyRegistrationResponse(opts);
}

/**
 * Generate authentication options for signing in with WebAuthn
 * 
 * @param userAuthenticators - Array of user's existing authenticators
 * @returns Authentication options to send to the client
 */
export async function generateWebAuthnAuthenticationOptions(
  userAuthenticators: AuthenticatorData[] = []
) {
  const options: GenerateAuthenticationOptionsOpts = {
    rpID,
    allowCredentials: userAuthenticators.map((auth) => ({
      id: Buffer.from(auth.credentialID, 'base64url'),
      type: 'public-key',
      transports: auth.transports ? JSON.parse(auth.transports) : undefined,
    })),
    userVerification: 'preferred',
  };

  return generateAuthenticationOptions(options);
}

/**
 * Verify a WebAuthn authentication response
 * 
 * @param response - Response from the client
 * @param expectedChallenge - The challenge that was sent to the client
 * @param authenticator - The authenticator data from the database
 * @returns Verified authentication data
 */
export async function verifyWebAuthnAuthentication(
  response: AuthenticationResponseJSON,
  expectedChallenge: string,
  authenticator: AuthenticatorData
): Promise<VerifiedAuthenticationResponse> {
  const opts: VerifyAuthenticationResponseOpts = {
    response,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    authenticator: {
      credentialID: Buffer.from(authenticator.credentialID, 'base64url'),
      credentialPublicKey: Buffer.from(authenticator.credentialPublicKey, 'base64url'),
      counter: authenticator.counter,
    },
  };

  return verifyAuthenticationResponse(opts);
}

/**
 * Convert an authenticator to the format expected by SimpleWebAuthn
 */
export function prepareAuthenticatorForVerification(
  authenticator: AuthenticatorData
) {
  return {
    credentialID: Buffer.from(authenticator.credentialID, 'base64url'),
    credentialPublicKey: Buffer.from(authenticator.credentialPublicKey, 'base64url'),
    counter: authenticator.counter,
    transports: authenticator.transports ? JSON.parse(authenticator.transports) : undefined,
  };
}

/**
 * Format verified registration response for database storage
 */
export function formatRegistrationForStorage(
  verification: VerifiedRegistrationResponse,
  userId: string,
  providerAccountId: string
): Omit<AuthenticatorData, 'credentialID'> & { credentialID: Buffer } {
  const { registrationInfo } = verification;
  
  if (!registrationInfo) {
    throw new Error('Registration info is missing from verification response');
  }

  const {
    credential,
    credentialDeviceType,
    credentialBackedUp,
  } = registrationInfo;

  return {
    credentialID: credential.id,
    credentialPublicKey: Buffer.from(credential.publicKey).toString('base64url'),
    counter: credential.counter,
    credentialDeviceType,
    credentialBackedUp,
    transports: credential.transports ? JSON.stringify(credential.transports) : null,
  };
}

/**
 * Check if WebAuthn is properly configured
 */
export function isWebAuthnConfigured(): boolean {
  return !!(
    process.env.WEBAUTHN_RP_NAME &&
    process.env.WEBAUTHN_RP_ID &&
    process.env.WEBAUTHN_ORIGIN
  );
}

/**
 * Get a user-friendly device name based on the authenticator data
 */
export function getDeviceName(
  authenticator: Pick<AuthenticatorData, 'credentialDeviceType' | 'transports'>
): string {
  const deviceType = authenticator.credentialDeviceType;
  const transports = authenticator.transports ? JSON.parse(authenticator.transports) : [];

  if (deviceType === 'singleDevice') {
    if (transports.includes('internal')) {
      return 'This Device (Biometric)';
    }
    return 'Security Key';
  }

  if (deviceType === 'multiDevice') {
    return 'Passkey';
  }

  return 'Unknown Device';
}

