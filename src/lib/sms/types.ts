/**
 * SMS Provider Interface
 * 
 * Defines the contract for SMS sending services
 */

export interface SmsResult {
  success: boolean;
  error?: string;
  messageId?: string; // Provider's message ID for tracking
}

export interface ISmsProvider {
  /**
   * Send an SMS verification code to a phone number
   * 
   * @param phone - Phone number in E.164 format (e.g., +12025551234)
   * @param code - Verification code to send
   * @returns Result indicating success or failure
   */
  sendCode(phone: string, code: string): Promise<SmsResult>;

  /**
   * Send a custom SMS message
   * 
   * @param phone - Phone number in E.164 format
   * @param message - Message content
   * @returns Result indicating success or failure
   */
  sendMessage?(phone: string, message: string): Promise<SmsResult>;

  /**
   * Get provider name (for logging/debugging)
   */
  getName(): string;
}

/**
 * SMS Provider Configuration
 */
export interface SmsProviderConfig {
  type: 'console' | 'twilio' | 'custom';
  // Twilio-specific config
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioPhoneNumber?: string;
  // Generic custom provider config
  apiKey?: string;
  apiUrl?: string;
}

