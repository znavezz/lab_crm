import { describe, it, expect } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  checkPasswordStrength,
  validatePhoneNumber,
  generateSmsCode,
  verifySmsCode,
  sanitizeEmail,
  sanitizePhoneNumber,
} from '@/lib/auth-utils';

describe('Password Utilities', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'MyPassword123!';
      const hash = await hashPassword(password);

      expect(hash).toBeTruthy();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'MyPassword123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'MyPassword123!';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'MyPassword123!';
      const wrongPassword = 'WrongPassword123!';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(wrongPassword, hash);

      expect(isValid).toBe(false);
    });
  });

  describe('checkPasswordStrength', () => {
    it('should validate a strong password', () => {
      const result = checkPasswordStrength('MyP@ssw0rd123!');

      expect(result.isValid).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(4);
      expect(result.feedback).toHaveLength(0);
    });

    it('should reject a weak password', () => {
      const result = checkPasswordStrength('weak');

      expect(result.isValid).toBe(false);
      expect(result.score).toBeLessThan(3);
      expect(result.feedback.length).toBeGreaterThan(0);
    });

    it('should check minimum length', () => {
      const result = checkPasswordStrength('Short1!');

      expect(result.isValid).toBe(false);
      expect(result.feedback.some((f) => f.includes('at least'))).toBe(true);
    });

    it('should check for uppercase letters', () => {
      const result = checkPasswordStrength('lowercase123!');

      expect(result.feedback.some((f) => f.includes('uppercase'))).toBe(true);
    });

    it('should check for lowercase letters', () => {
      const result = checkPasswordStrength('UPPERCASE123!');

      expect(result.feedback.some((f) => f.includes('lowercase'))).toBe(true);
    });

    it('should check for numbers', () => {
      const result = checkPasswordStrength('NoNumbers!');

      expect(result.feedback.some((f) => f.includes('number'))).toBe(true);
    });

    it('should check for special characters', () => {
      const result = checkPasswordStrength('NoSpecialChars123');

      expect(result.feedback.some((f) => f.includes('special'))).toBe(true);
    });
  });
});

describe('Phone Number Utilities', () => {
  describe('validatePhoneNumber', () => {
    it('should validate a valid phone number', () => {
      const result = validatePhoneNumber('+1234567890');

      expect(result.isValid).toBe(true);
      expect(result.formatted).toBe('+1234567890');
    });

    it('should format phone number with + prefix', () => {
      const result = validatePhoneNumber('1234567890');

      expect(result.isValid).toBe(true);
      expect(result.formatted).toBe('+1234567890');
    });

    it('should reject empty phone number', () => {
      const result = validatePhoneNumber('');

      expect(result.isValid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should reject too short phone number', () => {
      const result = validatePhoneNumber('123');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('at least 10 digits');
    });

    it('should reject too long phone number', () => {
      const result = validatePhoneNumber('12345678901234567890');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('at most 15 digits');
    });

    it('should handle phone numbers with formatting characters', () => {
      const result = validatePhoneNumber('+1 (234) 567-8900');

      expect(result.isValid).toBe(true);
      expect(result.formatted).toBe('+12345678900');
    });
  });

  describe('sanitizePhoneNumber', () => {
    it('should remove all non-digit characters except +', () => {
      const sanitized = sanitizePhoneNumber('+1 (234) 567-8900');

      expect(sanitized).toBe('+12345678900');
    });

    it('should preserve + at the beginning', () => {
      const sanitized = sanitizePhoneNumber('+1234567890');

      expect(sanitized).toBe('+1234567890');
    });
  });
});

describe('SMS Code Utilities', () => {
  describe('generateSmsCode', () => {
    it('should generate a 6-digit code', () => {
      const { code, expiresAt } = generateSmsCode();

      expect(code).toHaveLength(6);
      expect(code).toMatch(/^\d{6}$/);
      expect(expiresAt).toBeInstanceOf(Date);
    });

    it('should generate different codes', () => {
      const code1 = generateSmsCode().code;
      const code2 = generateSmsCode().code;

      // Very unlikely to be the same (but technically possible)
      expect(code1).not.toBe(code2);
    });

    it('should set expiration to 10 minutes in the future', () => {
      const { expiresAt } = generateSmsCode();
      const now = new Date();
      const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);

      // Allow 1 second tolerance
      expect(Math.abs(expiresAt.getTime() - tenMinutesFromNow.getTime())).toBeLessThan(1000);
    });
  });

  describe('verifySmsCode', () => {
    it('should verify a valid code', () => {
      const storedCode = '123456';
      const providedCode = '123456';
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      const result = verifySmsCode(storedCode, providedCode, expiresAt);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject an incorrect code', () => {
      const storedCode = '123456';
      const providedCode = '654321';
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      const result = verifySmsCode(storedCode, providedCode, expiresAt);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid');
    });

    it('should reject an expired code', () => {
      const storedCode = '123456';
      const providedCode = '123456';
      const expiresAt = new Date(Date.now() - 1000); // Expired

      const result = verifySmsCode(storedCode, providedCode, expiresAt);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('expired');
    });
  });
});

describe('General Auth Utilities', () => {
  describe('sanitizeEmail', () => {
    it('should convert to lowercase', () => {
      const result = sanitizeEmail('USER@EXAMPLE.COM');

      expect(result).toBe('user@example.com');
    });

    it('should trim whitespace', () => {
      const result = sanitizeEmail('  user@example.com  ');

      expect(result).toBe('user@example.com');
    });

    it('should handle both lowercase and trim', () => {
      const result = sanitizeEmail('  USER@EXAMPLE.COM  ');

      expect(result).toBe('user@example.com');
    });
  });
});

