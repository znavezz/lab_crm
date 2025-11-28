import { prisma } from '@/lib/prisma';

/**
 * Cleanup Job for Authentication Data
 * 
 * This job cleans up expired and used authentication temporary data:
 * - Expired SMS verification codes
 * - Verified SMS codes older than 24 hours
 * - Expired WebAuthn challenges
 */

export interface CleanupResult {
  smsCodesDeleted: number;
  webAuthnChallengesDeleted: number;
  totalDeleted: number;
}

/**
 * Clean up expired SMS verification codes
 */
async function cleanupSmsVerificationCodes(): Promise<number> {
  const now = new Date();
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const result = await prisma.smsVerificationCode.deleteMany({
    where: {
      OR: [
        // Delete expired codes
        { expiresAt: { lt: now } },
        // Delete verified codes older than 24 hours
        {
          verified: true,
          createdAt: { lt: oneDayAgo },
        },
      ],
    },
  });

  return result.count;
}

/**
 * Clean up expired WebAuthn challenges
 */
async function cleanupWebAuthnChallenges(): Promise<number> {
  const now = new Date();

  const result = await prisma.webAuthnChallenge.deleteMany({
    where: {
      expiresAt: { lt: now },
    },
  });

  return result.count;
}

/**
 * Main cleanup function
 * Runs all cleanup tasks and returns statistics
 */
export async function cleanupAuthData(): Promise<CleanupResult> {
  try {
    console.log('[Cleanup] Starting authentication data cleanup...');

    const [smsCodesDeleted, webAuthnChallengesDeleted] = await Promise.all([
      cleanupSmsVerificationCodes(),
      cleanupWebAuthnChallenges(),
    ]);

    const totalDeleted = smsCodesDeleted + webAuthnChallengesDeleted;

    console.log('[Cleanup] Completed:', {
      smsCodesDeleted,
      webAuthnChallengesDeleted,
      totalDeleted,
    });

    return {
      smsCodesDeleted,
      webAuthnChallengesDeleted,
      totalDeleted,
    };
  } catch (error) {
    console.error('[Cleanup] Error during cleanup:', error);
    throw error;
  }
}

/**
 * Cleanup specific user's auth data (for GDPR compliance, account deletion, etc.)
 */
export async function cleanupUserAuthData(userId: string): Promise<void> {
  console.log(`[Cleanup] Cleaning up auth data for user ${userId}...`);

  await prisma.$transaction([
    // Delete all SMS codes
    prisma.smsVerificationCode.deleteMany({
      where: { userId },
    }),
    // Delete all WebAuthn challenges
    prisma.webAuthnChallenge.deleteMany({
      where: { userId },
    }),
    // Delete all authenticators
    prisma.authenticator.deleteMany({
      where: { userId },
    }),
  ]);

  console.log(`[Cleanup] Completed cleanup for user ${userId}`);
}

