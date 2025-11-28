/**
 * SMS Service
 * 
 * Handles SMS verification code generation and validation
 */

export interface SmsCodeData {
  code: string;
  expiresAt: Date;
}

export interface SmsCodeVerificationResult {
  isValid: boolean;
  error?: string;
}

const CODE_LENGTH = 6;
const CODE_EXPIRY_MINUTES = 10;

/**
 * Generate a random SMS verification code
 * 
 * Returns a 6-digit code and expiration timestamp
 */
export function generateSmsCode(): SmsCodeData {
  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // Set expiration to 10 minutes from now
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + CODE_EXPIRY_MINUTES);

  return {
    code,
    expiresAt,
  };
}

/**
 * Verify an SMS code
 * 
 * Checks if the provided code matches the stored code and hasn't expired
 */
export function verifySmsCode(
  storedCode: string,
  providedCode: string,
  expiresAt: Date
): SmsCodeVerificationResult {
  // Check if code has expired
  if (new Date() > expiresAt) {
    return {
      isValid: false,
      error: 'Verification code has expired',
    };
  }

  // Check if codes match (case-insensitive, trim whitespace)
  const normalizedStored = storedCode.trim();
  const normalizedProvided = providedCode.trim();

  if (normalizedStored !== normalizedProvided) {
    return {
      isValid: false,
      error: 'Invalid verification code',
    };
  }

  return {
    isValid: true,
  };
}

/**
 * Check if a code format is valid (6 digits)
 */
export function isValidCodeFormat(code: string): boolean {
  return /^\d{6}$/.test(code.trim());
}

/**
 * Calculate time remaining until code expires
 */
export function getCodeTimeRemaining(expiresAt: Date): number {
  const now = new Date();
  const remaining = expiresAt.getTime() - now.getTime();
  return Math.max(0, Math.floor(remaining / 1000)); // seconds
}

/**
 * Format time remaining as human-readable string
 */
export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return 'Expired';
  
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

