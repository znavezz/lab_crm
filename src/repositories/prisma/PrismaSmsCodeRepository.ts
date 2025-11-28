import { PrismaClient } from '@/generated/prisma';
import {
  ISmsCodeRepository,
  SmsCode,
  CreateSmsCodeData,
} from '../interfaces/ISmsCodeRepository';

/**
 * Prisma Implementation of SMS Code Repository
 * 
 * Handles temporary SMS verification codes for 2FA
 */
export class PrismaSmsCodeRepository implements ISmsCodeRepository {
  constructor(private prisma: PrismaClient) {}

  // ===== Query Operations =====

  async findLatestByUserId(userId: string): Promise<SmsCode | null> {
    return this.prisma.smsVerificationCode.findFirst({
      where: {
        userId,
        verified: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findById(id: string): Promise<SmsCode | null> {
    return this.prisma.smsVerificationCode.findUnique({
      where: { id },
    });
  }

  // ===== Mutation Operations =====

  async create(data: CreateSmsCodeData): Promise<SmsCode> {
    return this.prisma.smsVerificationCode.create({
      data,
    });
  }

  async markAsVerified(id: string): Promise<void> {
    await this.prisma.smsVerificationCode.update({
      where: { id },
      data: { verified: true },
    });
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.prisma.smsVerificationCode.deleteMany({
      where: { userId },
    });
  }

  // ===== Cleanup Operations =====

  async deleteExpired(): Promise<number> {
    const result = await this.prisma.smsVerificationCode.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
    return result.count;
  }

  async deleteVerifiedOlderThan(date: Date): Promise<number> {
    const result = await this.prisma.smsVerificationCode.deleteMany({
      where: {
        verified: true,
        createdAt: { lt: date },
      },
    });
    return result.count;
  }
}

