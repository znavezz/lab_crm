import { PrismaClient } from '@/generated/prisma';
import {
  IWebAuthnRepository,
  WebAuthnChallenge,
  Authenticator,
  CreateChallengeData,
  CreateAuthenticatorData,
} from '../interfaces/IWebAuthnRepository';

/**
 * Prisma Implementation of WebAuthn Repository
 * 
 * Handles biometric authentication challenges and registered devices
 */
export class PrismaWebAuthnRepository implements IWebAuthnRepository {
  constructor(private prisma: PrismaClient) {}

  // ===== Challenge Operations =====

  async createChallenge(data: CreateChallengeData): Promise<WebAuthnChallenge> {
    return this.prisma.webAuthnChallenge.create({
      data,
    });
  }

  async findLatestChallenge(userId: string, type: string): Promise<WebAuthnChallenge | null> {
    return this.prisma.webAuthnChallenge.findFirst({
      where: {
        userId,
        type,
        expiresAt: { gt: new Date() }, // Not expired
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async deleteChallenge(id: string): Promise<void> {
    await this.prisma.webAuthnChallenge.delete({
      where: { id },
    });
  }

  async deleteUserChallenges(userId: string, type: string): Promise<void> {
    await this.prisma.webAuthnChallenge.deleteMany({
      where: { userId, type },
    });
  }

  async deleteExpiredChallenges(): Promise<number> {
    const result = await this.prisma.webAuthnChallenge.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
    return result.count;
  }

  // ===== Authenticator Operations =====

  async createAuthenticator(data: CreateAuthenticatorData): Promise<Authenticator> {
    return this.prisma.authenticator.create({
      data,
    });
  }

  async findAuthenticatorsByUserId(userId: string): Promise<Authenticator[]> {
    return this.prisma.authenticator.findMany({
      where: { userId },
    });
  }

  async findAuthenticatorByCredentialId(
    userId: string,
    credentialId: string
  ): Promise<Authenticator | null> {
    return this.prisma.authenticator.findUnique({
      where: {
        userId_credentialID: {
          userId,
          credentialID: credentialId,
        },
      },
    });
  }

  async updateAuthenticatorCounter(
    userId: string,
    credentialId: string,
    counter: number
  ): Promise<void> {
    await this.prisma.authenticator.update({
      where: {
        userId_credentialID: {
          userId,
          credentialID: credentialId,
        },
      },
      data: { counter },
    });
  }

  async deleteAuthenticator(userId: string, credentialId: string): Promise<void> {
    await this.prisma.authenticator.delete({
      where: {
        userId_credentialID: {
          userId,
          credentialID: credentialId,
        },
      },
    });
  }

  async deleteUserAuthenticators(userId: string): Promise<void> {
    await this.prisma.authenticator.deleteMany({
      where: { userId },
    });
  }
}

