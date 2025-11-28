import bcrypt from 'bcryptjs';

/**
 * Password Service
 * 
 * Handles all password-related operations:
 * - Hashing passwords
 * - Verifying passwords
 * - Checking password strength
 */

const SALT_ROUNDS = 12;
const PASSWORD_MIN_LENGTH = parseInt(process.env.PASSWORD_MIN_LENGTH || '8', 10);

export interface PasswordStrength {
  score: number; // 0-4
  isValid: boolean;
  feedback: string[];
}

/**
 * Hash a plain text password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hashed password
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Check password strength and return validation feedback
 */
export function checkPasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  // Check minimum length
  if (password.length < PASSWORD_MIN_LENGTH) {
    feedback.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
  } else {
    score++;
  }

  // Check for uppercase
  if (!/[A-Z]/.test(password)) {
    feedback.push('Password should contain at least one uppercase letter');
  } else {
    score++;
  }

  // Check for lowercase
  if (!/[a-z]/.test(password)) {
    feedback.push('Password should contain at least one lowercase letter');
  } else {
    score++;
  }

  // Check for numbers
  if (!/\d/.test(password)) {
    feedback.push('Password should contain at least one number');
  } else {
    score++;
  }

  // Check for special characters
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    feedback.push('Password should contain at least one special character');
  } else {
    score++;
  }

  const isValid = password.length >= PASSWORD_MIN_LENGTH && score >= 3;

  return {
    score: Math.min(score, 4),
    isValid,
    feedback,
  };
}

/**
 * Generate a random password (useful for password resets)
 */
export function generateRandomPassword(length: number = 16): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}';
  const all = uppercase + lowercase + numbers + special;

  let password = '';
  
  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  // Shuffle the password
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

