import bcrypt from 'bcryptjs';

/**
 * Password Utilities
 */

const SALT_ROUNDS = 12;
const PASSWORD_MIN_LENGTH = parseInt(process.env.PASSWORD_MIN_LENGTH || '8', 10);

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export interface PasswordStrength {
  score: number; // 0-4
  isValid: boolean;
  feedback: string[];
}

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
 * Phone Number Utilities
 */

export interface PhoneValidationResult {
  isValid: boolean;
  formatted?: string;
  error?: string;
}

export function validatePhoneNumber(phone: string): PhoneValidationResult {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // Check if it's empty
  if (!digits) {
    return {
      isValid: false,
      error: 'Phone number is required',
    };
  }

  // Check minimum length (at least 10 digits for most countries)
  if (digits.length < 10) {
    return {
      isValid: false,
      error: 'Phone number must be at least 10 digits',
    };
  }

  // Check maximum length (max 15 digits per E.164 standard)
  if (digits.length > 15) {
    return {
      isValid: false,
      error: 'Phone number must be at most 15 digits',
    };
  }

  // Format as E.164 (add + prefix if not present)
  const formatted = digits.startsWith('+') ? digits : `+${digits}`;

  return {
    isValid: true,
    formatted,
  };
}

/**
 * SMS Code Utilities
 */

export interface SmsCodeData {
  code: string;
  expiresAt: Date;
}

export function generateSmsCode(): SmsCodeData {
  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // Set expiration to 10 minutes from now
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10);

  return {
    code,
    expiresAt,
  };
}

export function verifySmsCode(
  storedCode: string,
  providedCode: string,
  expiresAt: Date
): { isValid: boolean; error?: string } {
  // Check if code has expired
  if (new Date() > expiresAt) {
    return {
      isValid: false,
      error: 'Verification code has expired',
    };
  }

  // Check if codes match
  if (storedCode !== providedCode) {
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
 * General Auth Utilities
 */

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export function sanitizePhoneNumber(phone: string): string {
  // Remove all non-digit characters except +
  return phone.replace(/[^\d+]/g, '');
}

