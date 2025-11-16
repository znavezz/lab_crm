// tests/auth.integration.test.ts
// Integration tests for authentication - testing NextAuth API routes and session management

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { testPrisma, setupTestDatabase, teardownTestDatabase, cleanTestDatabase } from './setup';
import { createUser, createUserWithMember } from './helpers';

describe('Authentication Integration Tests', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    await cleanTestDatabase();
  });

  describe('NextAuth Adapter Integration', () => {
    it('should create User via Prisma adapter', async () => {
      // Simulate what NextAuth adapter does when creating a user
      const userData = {
        email: 'test@example.com',
        emailVerified: null,
        name: 'Test User',
        image: null,
      };

      // The adapter's createUser method
      const user = await testPrisma.user.create({
        data: {
          ...userData,
          memberId: null, // User created without Member
        },
      });

      expect(user.id).toBeDefined();
      expect(user.email).toBe('test@example.com');
      expect(user.memberId).toBeNull();
    });

    it('should create Account linked to User', async () => {
      const user = await createUser({ email: 'test@example.com' });

      const account = await testPrisma.account.create({
        data: {
          userId: user.id,
          type: 'email',
          provider: 'email',
          providerAccountId: user.email,
        },
      });

      expect(account.userId).toBe(user.id);
      expect(account.provider).toBe('email');

      // Verify relationship
      const userWithAccount = await testPrisma.user.findUnique({
        where: { id: user.id },
        include: { accounts: true },
      });

      expect(userWithAccount?.accounts).toHaveLength(1);
      expect(userWithAccount?.accounts[0].id).toBe(account.id);
    });

    it('should create Session for User', async () => {
      const user = await createUser();

      const session = await testPrisma.session.create({
        data: {
          sessionToken: 'test-session-token-123',
          userId: user.id,
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      });

      expect(session.userId).toBe(user.id);
      expect(session.sessionToken).toBe('test-session-token-123');

      // Verify relationship
      const userWithSession = await testPrisma.user.findUnique({
        where: { id: user.id },
        include: { sessions: true },
      });

      expect(userWithSession?.sessions).toHaveLength(1);
    });
  });

  describe('Session Management Integration', () => {
    it('should retrieve session with user data', async () => {
      const user = await createUser({ email: 'session@example.com' });

      const session = await testPrisma.session.create({
        data: {
          sessionToken: 'test-session',
          userId: user.id,
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      // Retrieve session with user
      const sessionWithUser = await testPrisma.session.findUnique({
        where: { sessionToken: session.sessionToken },
        include: { user: true },
      });

      expect(sessionWithUser).toBeDefined();
      expect(sessionWithUser?.user).toBeDefined();
      if (sessionWithUser?.user) {
        expect(sessionWithUser.user.id).toBe(user.id);
        expect(sessionWithUser.user.email).toBe('session@example.com');
      }
    });

    it('should include memberId in session when User is linked to Member', async () => {
      const { user, member } = await createUserWithMember();

      const session = await testPrisma.session.create({
        data: {
          sessionToken: 'test-session-with-member',
          userId: user.id,
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      const sessionWithUser = await testPrisma.session.findUnique({
        where: { sessionToken: session.sessionToken },
        include: { user: { include: { member: true } } },
      });

      expect(sessionWithUser?.user.memberId).toBe(member.id);
      expect(sessionWithUser?.user.member).toBeDefined();
    });

    it('should handle expired sessions', async () => {
      const user = await createUser();

      const expiredSession = await testPrisma.session.create({
        data: {
          sessionToken: 'expired-session',
          userId: user.id,
          expires: new Date(Date.now() - 1000), // Expired 1 second ago
        },
      });

      // Session should exist but be expired
      const found = await testPrisma.session.findUnique({
        where: { sessionToken: expiredSession.sessionToken },
      });

      expect(found).toBeDefined();
      expect(new Date(found!.expires).getTime()).toBeLessThan(Date.now());
    });
  });

  describe('User-Member Linking Integration', () => {
    it('should link existing User to existing Member', async () => {
      const user = await createUser({ email: 'link@example.com' });
      const member = await testPrisma.member.create({
        data: {
          name: 'Lab Member',
          status: 'ACTIVE',
          role: 'STUDENT',
        },
      });

      // Link them
      const updatedUser = await testPrisma.user.update({
        where: { id: user.id },
        data: { memberId: member.id },
      });

      expect(updatedUser.memberId).toBe(member.id);

      // Verify bidirectional relationship
      const memberWithUser = await testPrisma.member.findUnique({
        where: { id: member.id },
        include: { user: true },
      });

      expect(memberWithUser?.user).toBeDefined();
      expect(memberWithUser?.user?.id).toBe(user.id);
    });

    it('should unlink User from Member', async () => {
      const { user, member } = await createUserWithMember();

      // Unlink
      const updatedUser = await testPrisma.user.update({
        where: { id: user.id },
        data: { memberId: null },
      });

      expect(updatedUser.memberId).toBeNull();

      // Verify Member no longer has User
      const memberWithoutUser = await testPrisma.member.findUnique({
        where: { id: member.id },
        include: { user: true },
      });

      expect(memberWithoutUser?.user).toBeNull();
    });

    it('should handle User with multiple Account providers', async () => {
      const user = await createUser({ email: 'multi@example.com' });

      // Create multiple accounts
      await testPrisma.account.createMany({
        data: [
          {
            userId: user.id,
            type: 'email',
            provider: 'email',
            providerAccountId: user.email,
          },
          {
            userId: user.id,
            type: 'oauth',
            provider: 'google',
            providerAccountId: 'google-123',
          },
          {
            userId: user.id,
            type: 'oauth',
            provider: 'github',
            providerAccountId: 'github-456',
          },
        ],
      });

      const userWithAccounts = await testPrisma.user.findUnique({
        where: { id: user.id },
        include: { accounts: true },
      });

      expect(userWithAccounts?.accounts).toHaveLength(3);
      expect(userWithAccounts?.accounts.some((a) => a.provider === 'email')).toBe(true);
      expect(userWithAccounts?.accounts.some((a) => a.provider === 'google')).toBe(true);
      expect(userWithAccounts?.accounts.some((a) => a.provider === 'github')).toBe(true);
    });
  });

  describe('Verification Token Integration', () => {
    it('should create and retrieve verification token', async () => {
      const token = await testPrisma.verificationToken.create({
        data: {
          identifier: 'test@example.com',
          token: 'verification-token-123',
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
      });

      expect(token.identifier).toBe('test@example.com');
      expect(token.token).toBe('verification-token-123');

      const found = await testPrisma.verificationToken.findUnique({
        where: { 
          identifier_token: {
            identifier: token.identifier,
            token: token.token,
          },
        },
      });

      expect(found).toBeDefined();
      expect(found?.identifier).toBe('test@example.com');
      expect(found?.token).toBe('verification-token-123');
    });

    it('should handle expired verification tokens', async () => {
      const expiredToken = await testPrisma.verificationToken.create({
        data: {
          identifier: 'expired@example.com',
          token: 'expired-token',
          expires: new Date(Date.now() - 1000), // Expired
        },
      });

      const found = await testPrisma.verificationToken.findUnique({
        where: { token: expiredToken.token },
      });

      expect(found).toBeDefined();
      expect(new Date(found!.expires).getTime()).toBeLessThan(Date.now());
    });
  });

  describe('Database Constraints', () => {
    it('should enforce unique email on User', async () => {
      await createUser({ email: 'unique@example.com' });

      await expect(
        testPrisma.user.create({
          data: {
            email: 'unique@example.com',
            name: 'Duplicate',
            memberId: null,
          },
        })
      ).rejects.toThrow();
    });

    it('should enforce unique memberId on User', async () => {
      // Create a Member
      const member = await testPrisma.member.create({
        data: {
          name: 'Member',
          status: 'ACTIVE',
        },
      });

      // Create first User linked to this Member
      const { user: firstUser } = await createUserWithMember({
        memberName: 'First Member',
      });
      
      // Update first user to use our test member
      await testPrisma.user.update({
        where: { id: firstUser.id },
        data: { memberId: member.id },
      });

      // Try to create second User with same memberId - should fail
      await expect(
        testPrisma.user.create({
          data: {
            email: 'another@example.com',
            name: 'Another User',
            memberId: member.id, // Same memberId as first user
          },
        })
      ).rejects.toThrow();
    });

    it('should enforce unique provider+providerAccountId on Account', async () => {
      const user = await createUser();

      await testPrisma.account.create({
        data: {
          userId: user.id,
          type: 'email',
          provider: 'email',
          providerAccountId: 'test@example.com',
        },
      });

      await expect(
        testPrisma.account.create({
          data: {
            userId: user.id,
            type: 'email',
            provider: 'email',
            providerAccountId: 'test@example.com',
          },
        })
      ).rejects.toThrow();
    });
  });
});

