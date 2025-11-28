/**
 * Common Auth Validation Utilities
 * 
 * General validation functions used across authentication
 */

/**
 * Sanitize email address
 * Converts to lowercase and trims whitespace
 */
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate email and return normalized version
 */
export function validateEmail(email: string): {
  isValid: boolean;
  normalized?: string;
  error?: string;
} {
  if (!email) {
    return {
      isValid: false,
      error: 'Email is required',
    };
  }

  const normalized = sanitizeEmail(email);

  if (!isValidEmail(normalized)) {
    return {
      isValid: false,
      error: 'Invalid email format',
    };
  }

  return {
    isValid: true,
    normalized,
  };
}

/**
 * Check if a string is a valid username (alphanumeric + underscore/dash)
 */
export function isValidUsername(username: string): boolean {
  // 3-20 characters, alphanumeric plus underscore and dash
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return usernameRegex.test(username);
}

/**
 * Sanitize string input (remove dangerous characters)
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, ''); // Remove potential HTML tags
}

/**
 * Check if a value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

