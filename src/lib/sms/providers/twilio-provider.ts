import { ISmsProvider, type SmsResult } from '../types';

/**
 * Twilio SMS Provider
 * 
 * Sends actual SMS messages via Twilio API.
 * Requires Twilio account credentials and phone number.
 */
export class TwilioSmsProvider implements ISmsProvider {
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;

  constructor(accountSid: string, authToken: string, fromNumber: string) {
    if (!accountSid || !authToken || !fromNumber) {
      throw new Error('Twilio provider requires accountSid, authToken, and fromNumber');
    }

    this.accountSid = accountSid;
    this.authToken = authToken;
    this.fromNumber = fromNumber;
  }

  getName(): string {
    return 'Twilio';
  }

  async sendCode(phone: string, code: string): Promise<SmsResult> {
    const message = `Your verification code is: ${code}. This code will expire in 10 minutes.`;
    return this.sendMessage(phone, message);
  }

  async sendMessage(phone: string, message: string): Promise<SmsResult> {
    try {
      // Twilio API endpoint
      const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;

      // Basic auth header
      const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');

      // Send request
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: phone,
          From: this.fromNumber,
          Body: message,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Twilio error:', errorData);
        
        return {
          success: false,
          error: errorData.message || 'Failed to send SMS via Twilio',
        };
      }

      const data = await response.json();
      console.log(`SMS sent via Twilio: ${data.sid}`);

      return {
        success: true,
        messageId: data.sid,
      };
    } catch (error) {
      console.error('Error sending SMS via Twilio:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

