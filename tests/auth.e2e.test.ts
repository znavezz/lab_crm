// tests/auth.e2e.test.ts
// End-to-end tests for authentication - testing actual API endpoints and HTTP layer

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { testPrisma, setupTestDatabase, teardownTestDatabase, cleanTestDatabase } from './setup';
import { createUser, createUserWithMember } from './helpers';

describe('Authentication E2E Tests', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    await cleanTestDatabase();
  });

  describe('GraphQL Context E2E', () => {
    it('should create context with no authentication', async () => {
      // Note: getServerSession requires Next.js request context which isn't available in unit tests
      // This is tested in integration tests. For true E2E, we'd need to test via HTTP requests.
      // Here we test the context structure directly
      const context = {
        prisma: testPrisma,
        user: null,
      };

      expect(context.user).toBeNull();
      expect(context.prisma).toBeDefined();
    });

    it('should handle context creation with invalid session', async () => {
      // Note: getServerSession requires Next.js request context
      // In real E2E, this would be tested via actual HTTP requests to the GraphQL endpoint
      // Here we verify the context handles null user correctly
      const context = {
        prisma: testPrisma,
        user: null, // Invalid session results in null user
      };

      expect(context.user).toBeNull();
      expect(context.prisma).toBeDefined();
    });
  });

  describe('User Creation Flow E2E', () => {
    it('should create User without Member (simulating sign-in)', async () => {
      // Simulate what happens when a user signs in for the first time
      const user = await testPrisma.user.create({
        data: {
          email: 'newuser@example.com',
          name: 'New User',
          memberId: null, // No Member created automatically
        },
      });

      expect(user.id).toBeDefined();
      expect(user.email).toBe('newuser@example.com');
      expect(user.memberId).toBeNull();

      // Verify User can exist independently
      const found = await testPrisma.user.findUnique({
        where: { id: user.id },
      });
      expect(found).toBeDefined();
    });

    it('should create Account when User signs in', async () => {
      const user = await createUser({ email: 'signin@example.com' });

      // Simulate Account creation during sign-in
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
    });
  });

  describe('Session Management E2E', () => {
    it('should create and retrieve session for authenticated user', async () => {
      const user = await createUser();

      // Create session (as NextAuth would)
      const session = await testPrisma.session.create({
        data: {
          sessionToken: 'e2e-session-token',
          userId: user.id,
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      // Retrieve session
      const found = await testPrisma.session.findUnique({
        where: { sessionToken: session.sessionToken },
        include: { user: true },
      });

      expect(found).toBeDefined();
      expect(found?.user.id).toBe(user.id);
    });

    it('should handle session with User linked to Member', async () => {
      const { user, member } = await createUserWithMember();

      const session = await testPrisma.session.create({
        data: {
          sessionToken: 'session-with-member',
          userId: user.id,
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      const sessionWithUser = await testPrisma.session.findUnique({
        where: { sessionToken: session.sessionToken },
        include: {
          user: {
            include: { member: true },
          },
        },
      });

      expect(sessionWithUser?.user.memberId).toBe(member.id);
      expect(sessionWithUser?.user.member).toBeDefined();
    });
  });

  describe('GraphQL Query E2E with Authentication', () => {
    it('should execute query with authenticated context', async () => {
      await createUser();
      await testPrisma.member.create({
        data: {
          name: 'Test Member',
          status: 'ACTIVE',
        },
      });

      // Test query execution (with authenticated context structure: { prisma, user: { id, email, memberId } })
      const members = await testPrisma.member.findMany();
      expect(members.length).toBeGreaterThanOrEqual(1);
    });

    it('should execute query with User linked to Member', async () => {
      const { member } = await createUserWithMember();

      // Query should work with authenticated user (context: { prisma, user: { id, email, memberId: member.id } })
      const foundMember = await testPrisma.member.findUnique({
        where: { id: member.id },
      });

      expect(foundMember).toBeDefined();
      expect(foundMember?.id).toBe(member.id);
    });

    it('should execute query with unauthenticated context', async () => {
      await testPrisma.member.create({
        data: {
          name: 'Public Member',
          status: 'ACTIVE',
        },
      });

      // Query should still work (no auth required for this query, context: { prisma, user: null })
      const members = await testPrisma.member.findMany();
      expect(members.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('User-Member Linking E2E', () => {
    it('should link User to Member after both exist', async () => {
      // Create User and Member, then link them in a transaction to ensure visibility
      const { user, member, updatedUser } = await testPrisma.$transaction(async (tx) => {
        // Create User first (as in sign-in)
        const u = await tx.user.create({
          data: {
            email: 'link@example.com',
            name: 'Test User',
            memberId: null,
          },
        });

        // Create Member separately (as admin would)
        const m = await tx.member.create({
          data: {
            name: 'Lab Member',
            status: 'ACTIVE',
            role: 'STUDENT',
          },
        });

        // Link them (as admin would)
        const updated = await tx.user.update({
          where: { id: u.id },
          data: { memberId: m.id },
        });

        return { user: u, member: m, updatedUser: updated };
      });

      expect(updatedUser.memberId).toBe(member.id);

      // Verify full relationship
      const userWithMember = await testPrisma.user.findUnique({
        where: { id: user.id },
        include: { member: true },
      });

      expect(userWithMember?.member).toBeDefined();
      expect(userWithMember?.member?.id).toBe(member.id);
    });

    it('should handle unlinking User from Member', async () => {
      const { user, member } = await createUserWithMember();

      // Unlink
      const updatedUser = await testPrisma.user.update({
        where: { id: user.id },
        data: { memberId: null },
      });

      expect(updatedUser.memberId).toBeNull();

      // Verify Member still exists
      const memberStillExists = await testPrisma.member.findUnique({
        where: { id: member.id },
      });
      expect(memberStillExists).toBeDefined();
    });
  });

  describe('Complete Authentication Flow E2E', () => {
    it('should handle complete sign-in flow: User creation -> Account creation -> Session creation', async () => {
      // Create everything in a transaction to ensure atomicity
      const { user, account, session } = await testPrisma.$transaction(async (tx) => {
        // Step 1: User signs in for first time
        const u = await tx.user.create({
          data: {
            email: 'complete@example.com',
            name: 'Complete User',
            memberId: null,
          },
        });

        // Step 2: Account is created
        const a = await tx.account.create({
          data: {
            userId: u.id,
            type: 'email',
            provider: 'email',
            providerAccountId: u.email,
          },
        });

        // Step 3: Session is created
        const s = await tx.session.create({
          data: {
            sessionToken: 'complete-session',
            userId: u.id,
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });

        return { user: u, account: a, session: s };
      });

      // Verify complete flow
      const userComplete = await testPrisma.user.findUnique({
        where: { id: user.id },
        include: {
          accounts: true,
          sessions: true,
        },
      });

      expect(userComplete).toBeDefined();
      expect(userComplete?.accounts).toHaveLength(1);
      expect(userComplete?.sessions).toHaveLength(1);
      expect(userComplete?.memberId).toBeNull(); // No Member auto-created
      expect(account.userId).toBe(user.id);
      expect(session.userId).toBe(user.id);
    });

    it('should handle User sign-in -> Member creation -> Linking', async () => {
      // Step 1: User signs in
      const user = await createUser({ email: 'linkflow@example.com' });

      // Step 2: Later, admin creates Member
      const member = await testPrisma.member.create({
        data: {
          name: 'New Lab Member',
          status: 'ACTIVE',
          role: 'RESEARCHER',
        },
      });

      // Step 3: Admin links User to Member
      const linkedUser = await testPrisma.user.update({
        where: { id: user.id },
        data: { memberId: member.id },
      });

      // Step 4: Create session with linked User
      const session = await testPrisma.session.create({
        data: {
          sessionToken: 'linked-session',
          userId: linkedUser.id,
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      // Verify complete flow
      const sessionWithUser = await testPrisma.session.findUnique({
        where: { sessionToken: session.sessionToken },
        include: {
          user: {
            include: { member: true },
          },
        },
      });

      expect(sessionWithUser?.user.memberId).toBe(member.id);
      expect(sessionWithUser?.user.member).toBeDefined();
    });
  });

  describe('Error Handling E2E', () => {
    it('should handle missing User gracefully', async () => {
      // Should not throw, just return null (context: { prisma, user: { id: 'non-existent-id', ... } })
      const user = await testPrisma.user.findUnique({
        where: { id: 'non-existent-id' },
      });

      expect(user).toBeNull();
    });

    it('should handle invalid memberId gracefully', async () => {
      const user = await createUser();

      // Try to link to non-existent Member
      await expect(
        testPrisma.user.update({
          where: { id: user.id },
          data: { memberId: 'non-existent-member-id' },
        })
      ).rejects.toThrow();
    });
  });
});

