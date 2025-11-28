/**
 * Phone Service
 * 
 * Handles phone number validation and formatting
 */

export interface PhoneValidationResult {
  isValid: boolean;
  formatted?: string;
  error?: string;
}

/**
 * Validate and format a phone number
 * 
 * Basic validation following E.164 standard:
 * - Min 10 digits (most countries)
 * - Max 15 digits (E.164 standard)
 * - Returns formatted number with + prefix
 */
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
 * Sanitize phone number for storage
 * Removes all non-digit characters except +
 */
export function sanitizePhoneNumber(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}

/**
 * Format phone number for display
 * Example: +12025551234 -> +1 (202) 555-1234
 */
export function formatPhoneNumberForDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, '');

  // US/Canada format
  if (digits.length === 11 && (digits.startsWith('1'))) {
    return `+${digits[0]} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }

  // General international format
  if (digits.length >= 10) {
    const countryCode = digits.slice(0, -10);
    const localNumber = digits.slice(-10);
    return `+${countryCode} ${localNumber.slice(0, 3)}-${localNumber.slice(3, 6)}-${localNumber.slice(6)}`;
  }

  // Fallback: just add +
  return `+${digits}`;
}

/**
 * Check if two phone numbers are the same
 * Compares only digits, ignoring formatting
 */
export function phoneNumbersEqual(phone1: string, phone2: string): boolean {
  const digits1 = phone1.replace(/\D/g, '');
  const digits2 = phone2.replace(/\D/g, '');
  return digits1 === digits2;
}

