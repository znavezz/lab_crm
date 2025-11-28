/**
 * SMS Verification Code Repository Interface
 * 
 * Abstract contract for SMS code data access operations.
 */

export interface SmsCode {
  id: string;
  userId: string;
  code: string;
  expiresAt: Date;
  verified: boolean;
  createdAt: Date;
}

export interface CreateSmsCodeData {
  userId: string;
  code: string;
  expiresAt: Date;
}

/**
 * SMS Code Repository Interface
 * 
 * Handles temporary SMS verification codes for 2FA
 */
export interface ISmsCodeRepository {
  // ===== Query Operations =====
  
  /**
   * Find the latest unverified code for a user
   */
  findLatestByUserId(userId: string): Promise<SmsCode | null>;
  
  /**
   * Find a specific code by ID
   */
  findById(id: string): Promise<SmsCode | null>;
  
  // ===== Mutation Operations =====
  
  /**
   * Create a new SMS verification code
   */
  create(data: CreateSmsCodeData): Promise<SmsCode>;
  
  /**
   * Mark a code as verified
   */
  markAsVerified(id: string): Promise<void>;
  
  /**
   * Delete all codes for a user
   */
  deleteByUserId(userId: string): Promise<void>;
  
  // ===== Cleanup Operations =====
  
  /**
   * Delete expired codes (for cleanup jobs)
   * Returns count of deleted codes
   */
  deleteExpired(): Promise<number>;
  
  /**
   * Delete verified codes older than specified date
   */
  deleteVerifiedOlderThan(date: Date): Promise<number>;
}

