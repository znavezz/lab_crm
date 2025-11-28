import { ISmsProvider } from './types';
import { ConsoleSmsProvider } from './providers/console-provider';
import { TwilioSmsProvider } from './providers/twilio-provider';

/**
 * SMS Provider Factory
 * 
 * Returns the configured SMS provider based on environment variables.
 * Defaults to console provider for development.
 */

let providerInstance: ISmsProvider | null = null;

export function getSmsProvider(): ISmsProvider {
  // Return cached instance if available
  if (providerInstance) {
    return providerInstance;
  }

  const providerType = process.env.SMS_PROVIDER || 'console';

  switch (providerType.toLowerCase()) {
    case 'twilio': {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const fromNumber = process.env.TWILIO_PHONE_NUMBER;

      if (!accountSid || !authToken || !fromNumber) {
        console.warn(
          'Twilio credentials not configured. Falling back to console provider.'
        );
        providerInstance = new ConsoleSmsProvider();
      } else {
        console.log('Using Twilio SMS provider');
        providerInstance = new TwilioSmsProvider(accountSid, authToken, fromNumber);
      }
      break;
    }

    case 'console':
    default:
      console.log('Using console SMS provider (development mode)');
      providerInstance = new ConsoleSmsProvider();
      break;
  }

  return providerInstance;
}

/**
 * Send an SMS verification code
 * Convenience function that uses the configured provider
 */
export async function sendSmsCode(phone: string, code: string) {
  const provider = getSmsProvider();
  return provider.sendCode(phone, code);
}

/**
 * Send a custom SMS message
 * Convenience function that uses the configured provider
 */
export async function sendSmsMessage(phone: string, message: string) {
  const provider = getSmsProvider();
  
  if (provider.sendMessage) {
    return provider.sendMessage(phone, message);
  }

  // Fallback: use sendCode method (not ideal but works)
  return provider.sendCode(phone, message);
}

/**
 * Reset the provider instance (useful for testing)
 */
export function resetSmsProvider() {
  providerInstance = null;
}

