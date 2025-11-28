import { getRepositories } from '@/repositories/factory';

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
  const { smsCode: smsRepo } = getRepositories();
  
  // Delete expired codes
  const expiredCount = await smsRepo.deleteExpired();
  
  // Delete verified codes older than 24 hours
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const verifiedCount = await smsRepo.deleteVerifiedOlderThan(oneDayAgo);

  return expiredCount + verifiedCount;
}

/**
 * Clean up expired WebAuthn challenges
 */
async function cleanupWebAuthnChallenges(): Promise<number> {
  const { webauthn: webauthnRepo } = getRepositories();
  return await webauthnRepo.deleteExpiredChallenges();
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

  const { smsCode: smsRepo, webauthn: webauthnRepo } = getRepositories();

  // Delete user's auth data using repositories
  await smsRepo.deleteByUserId(userId);
  await webauthnRepo.deleteUserChallenges(userId, 'registration');
  await webauthnRepo.deleteUserChallenges(userId, 'authentication');
  await webauthnRepo.deleteUserAuthenticators(userId);

  console.log(`[Cleanup] Completed cleanup for user ${userId}`);
}

