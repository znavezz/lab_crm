import { ISmsProvider, type SmsResult } from '../types';

/**
 * Console SMS Provider
 * 
 * Logs SMS codes to console instead of sending actual SMS.
 * Useful for development and testing without incurring SMS costs.
 */
export class ConsoleSmsProvider implements ISmsProvider {
  getName(): string {
    return 'Console';
  }

  async sendCode(phone: string, code: string): Promise<SmsResult> {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📱 SMS CODE (Development Mode)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📞 To: ${phone}`);
    console.log(`🔢 Code: ${code}`);
    console.log(`⏰ Time: ${new Date().toISOString()}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return {
      success: true,
      messageId: `console-${Date.now()}`,
    };
  }

  async sendMessage(phone: string, message: string): Promise<SmsResult> {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📱 SMS MESSAGE (Development Mode)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📞 To: ${phone}`);
    console.log(`📝 Message: ${message}`);
    console.log(`⏰ Time: ${new Date().toISOString()}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return {
      success: true,
      messageId: `console-${Date.now()}`,
    };
  }
}

