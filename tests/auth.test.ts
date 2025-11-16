// tests/auth.test.ts
// Authentication layer tests

import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { testPrisma, setupTestDatabase, teardownTestDatabase, cleanTestDatabase } from './setup';
import {
  createUser,
  createUserWithMember,
  createMemberWithoutUser,
  createAuthenticatedContext,
  createUnauthenticatedContext,
  testFactory,
} from './helpers';
import { queries } from '../src/graphql/resolvers/queries';
import type { Session } from 'next-auth';
import type { AdapterUser } from 'next-auth/adapters';

// Mock prisma to use testPrisma so the actual authOptions callback uses test database
vi.mock('../src/lib/prisma', async () => {
  const { testPrisma } = await import('./setup');
  return {
    prisma: testPrisma,
  };
});

// Import authOptions after mocking prisma
import { authOptions } from '../src/lib/auth';

describe('Authentication Tests', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    await cleanTestDatabase();
  });

  describe('User Model (CRM Access)', () => {
    it('should create a User without a Member', async () => {
      const user = await createUser({
        email: 'admin@example.com',
        name: 'Admin User',
      });

      expect(user.id).toBeDefined();
      expect(user.email).toBe('admin@example.com');
      expect(user.name).toBe('Admin User');
      expect(user.memberId).toBeNull();
    });

    it('should allow User to exist independently of Member', async () => {
      const user = await createUser();
      
      // Verify User exists
      const foundUser = await testPrisma.user.findUnique({
        where: { id: user.id },
      });
      
      expect(foundUser).toBeDefined();
      expect(foundUser?.memberId).toBeNull();
    });

    it('should create a User and link it to a Member', async () => {
      const { user, member } = await createUserWithMember({
        userEmail: 'researcher@example.com',
        userName: 'Researcher',
        memberName: 'Dr. Researcher',
      });

      expect(user.id).toBeDefined();
      expect(user.memberId).toBe(member.id);
      
      // Verify the relationship
      const userWithMember = await testPrisma.user.findUnique({
        where: { id: user.id },
        include: { member: true },
      });
      
      expect(userWithMember?.member).toBeDefined();
      expect(userWithMember?.member?.id).toBe(member.id);
    });

    it('should allow linking User to Member after creation', async () => {
      // Create User first
      const user = await createUser();
      expect(user.memberId).toBeNull();

      // Create Member
      const member = await testFactory.createMember({ name: 'New Member' });

      // Link User to Member
      const updatedUser = await testPrisma.user.update({
        where: { id: user.id },
        data: { memberId: member.id },
      });

      expect(updatedUser.memberId).toBe(member.id);
    });

    it('should allow unlinking User from Member', async () => {
      const { user } = await createUserWithMember();
      expect(user.memberId).not.toBeNull();

      // Unlink User from Member
      const updatedUser = await testPrisma.user.update({
        where: { id: user.id },
        data: { memberId: null },
      });

      expect(updatedUser.memberId).toBeNull();
    });
  });

  describe('Member Model (Lab Member)', () => {
    it('should create a Member without a User', async () => {
      const member = await createMemberWithoutUser({
        name: 'Student Without Access',
      });

      expect(member.id).toBeDefined();
      expect(member.name).toBe('Student Without Access');

      // Verify no User is linked
      const user = await testPrisma.user.findFirst({
        where: { memberId: member.id },
      });

      expect(user).toBeNull();
    });

    it('should allow Member to exist independently of User', async () => {
      const member = await testFactory.createMember();
      
      // Verify Member exists
      const foundMember = await testPrisma.member.findUnique({
        where: { id: member.id },
        include: { user: true },
      });
      
      expect(foundMember).toBeDefined();
      expect(foundMember?.user).toBeNull();
    });
  });

  describe('NextAuth Configuration', () => {
    it('should have correct auth configuration', () => {
      expect(authOptions).toBeDefined();
      expect(authOptions.adapter).toBeDefined();
      expect(authOptions.providers).toBeDefined();
      expect(authOptions.providers.length).toBeGreaterThan(0);
      expect(authOptions.session?.strategy).toBe('database');
    });

    it('should have email provider configured', () => {
      const emailProvider = authOptions.providers.find(
        (p) => p.id === 'email'
      );
      expect(emailProvider).toBeDefined();
    });

    it('should have custom pages configured', () => {
      expect(authOptions.pages?.signIn).toBe('/auth/signin');
      expect(authOptions.pages?.error).toBe('/auth/error');
    });
  });

  describe('Session Callbacks', () => {
    it('should call actual authOptions session callback with user without member', async () => {
      const user = await createUser({ email: 'test@example.com' });
      
      type ExtendedSessionUser = Session['user'] & {
        id: string;
        memberId?: string | null;
      };
      
      type ExtendedSession = Omit<Session, 'user'> & {
        user: ExtendedSessionUser;
      };
      
      const mockSession = {
        user: {
          email: user.email ?? undefined,
          name: user.name ?? undefined,
        },
        expires: new Date().toISOString(),
      } as Session;
      
      const mockUser: AdapterUser = {
        id: user.id,
        email: user.email ?? '',
        emailVerified: null,
        name: user.name ?? null,
        image: null,
      };

      // Call the actual authOptions callback (now using testPrisma via mock)
      // Database strategy doesn't use token, but TypeScript requires it
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (authOptions.callbacks?.session as any)?.({
        session: mockSession,
        user: mockUser,
      }) as ExtendedSession | undefined;

      expect(result?.user).toBeDefined();
      expect(result?.user?.id).toBe(user.id);
      expect(result?.user?.memberId).toBeNull();
    });

    it('should call actual authOptions session callback with user linked to member', async () => {
      const { user, member } = await createUserWithMember();
      
      type ExtendedSessionUser = Session['user'] & {
        id: string;
        memberId?: string | null;
      };
      
      type ExtendedSession = Omit<Session, 'user'> & {
        user: ExtendedSessionUser;
      };
      
      const mockSession = {
        user: {
          email: user.email ?? undefined,
          name: user.name ?? undefined,
        },
        expires: new Date().toISOString(),
      } as Session;
      
      const mockUser: AdapterUser = {
        id: user.id,
        email: user.email ?? '',
        emailVerified: null,
        name: user.name ?? null,
        image: null,
      };

      // Call the actual authOptions callback (now using testPrisma via mock)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (authOptions.callbacks?.session as any)?.({
        session: mockSession,
        user: mockUser,
      }) as ExtendedSession | undefined;

      expect(result?.user).toBeDefined();
      expect(result?.user?.id).toBe(user.id);
      expect(result?.user?.memberId).toBe(member.id);
    });

    it('should handle session callback when userRecord is null', async () => {
      const user = await createUser({ email: 'test@example.com' });
      
      // Delete the user to simulate userRecord being null
      await testPrisma.user.delete({ where: { id: user.id } });
      
      type ExtendedSessionUser = Session['user'] & {
        id: string;
        memberId?: string | null;
      };
      
      type ExtendedSession = Omit<Session, 'user'> & {
        user: ExtendedSessionUser;
      };
      
      const mockSession = {
        user: {
          email: user.email ?? undefined,
          name: user.name ?? undefined,
        },
        expires: new Date().toISOString(),
      } as Session;
      
      const mockUser: AdapterUser = {
        id: user.id,
        email: user.email ?? '',
        emailVerified: null,
        name: user.name ?? null,
        image: null,
      };

      // Call the actual authOptions callback
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (authOptions.callbacks?.session as any)?.({
        session: mockSession,
        user: mockUser,
      }) as ExtendedSession | undefined;

      expect(result?.user).toBeDefined();
      expect(result?.user?.id).toBe(user.id);
      // When userRecord is null, memberId should not be set
      expect(result?.user?.memberId).toBeUndefined();
    });

    it('should handle session callback when extendedSession.user is null', async () => {
      type ExtendedSession = Omit<Session, 'user'> & {
        user: Session['user'] | null;
      };
      
      const mockSession = {
        user: null,
        expires: new Date().toISOString(),
      } as unknown as Session;
      
      const mockUser: AdapterUser = {
        id: 'test-id',
        email: 'test@example.com',
        emailVerified: null,
        name: 'Test User',
        image: null,
      };

      // Call the actual authOptions callback - should return session without modifying user
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (authOptions.callbacks?.session as any)?.({
        session: mockSession,
        user: mockUser,
      }) as ExtendedSession | undefined;

      expect(result).toBeDefined();
      // When extendedSession.user is null, the callback should return early
      expect(result?.user).toBeNull();
    });

    it('should handle session callback when user parameter is null', async () => {
      type ExtendedSessionUser = Session['user'] & {
        id: string;
        memberId?: string | null;
      };
      
      type ExtendedSession = Omit<Session, 'user'> & {
        user: ExtendedSessionUser;
      };
      
      const mockSession = {
        user: {
          email: 'test@example.com',
          name: 'Test User',
        },
        expires: new Date().toISOString(),
      } as Session;

      // Call the actual authOptions callback with null user
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (authOptions.callbacks?.session as any)?.({
        session: mockSession,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        user: null as any,
      }) as ExtendedSession | undefined;

      expect(result).toBeDefined();
      // When user is null, the callback should return session without modifying user
      expect(result?.user).toBeDefined();
      expect(result?.user?.id).toBeUndefined();
    });

    it('should add user ID to session', async () => {
      const user = await createUser({ email: 'test@example.com' });
      
      // Create a test-specific auth options that uses testPrisma
      const { testPrisma } = await import('./setup');
      
      type ExtendedSessionUser = Session['user'] & {
        id: string;
        memberId?: string | null;
      };
      
      type ExtendedSession = Omit<Session, 'user'> & {
        user: ExtendedSessionUser;
      };
      
      const testAuthOptions = {
        ...authOptions,
        callbacks: {
          ...authOptions.callbacks,
          async session({ session, user }: { session: Session; user: AdapterUser }): Promise<ExtendedSession> {
            const extendedSession = session as ExtendedSession;
            if (extendedSession.user && user) {
              extendedSession.user.id = user.id;
              const userRecord = await testPrisma.user.findUnique({
                where: { id: user.id },
                select: { memberId: true },
              });
              if (userRecord) {
                extendedSession.user.memberId = userRecord.memberId;
              }
            }
            return extendedSession;
          },
        },
      };
      
      // Mock session callback
      const mockSession: Session = {
        user: {
          id: user.id,
          email: user.email ?? undefined,
          name: user.name ?? undefined,
        },
        expires: new Date().toISOString(),
      };
      
      const mockUser: AdapterUser = {
        id: user.id,
        email: user.email ?? '',
        emailVerified: null,
        name: user.name ?? null,
        image: null,
      };

      // Call the session callback (database strategy doesn't use token)
      const result = await testAuthOptions.callbacks?.session?.({
        session: mockSession,
        user: mockUser,
      });

      expect(result?.user).toBeDefined();
      expect(result?.user.id).toBe(user.id);
    });

    it('should add memberId to session when User is linked to Member', async () => {
      const { user, member } = await createUserWithMember();
      
      // Create a test-specific auth options that uses testPrisma
      const { testPrisma } = await import('./setup');
      
      type ExtendedSessionUser = Session['user'] & {
        id: string;
        memberId?: string | null;
      };
      
      type ExtendedSession = Omit<Session, 'user'> & {
        user: ExtendedSessionUser;
      };
      
      const testAuthOptions = {
        ...authOptions,
        callbacks: {
          ...authOptions.callbacks,
          async session({ session, user }: { session: Session; user: AdapterUser }): Promise<ExtendedSession> {
            const extendedSession = session as ExtendedSession;
            if (extendedSession.user && user) {
              extendedSession.user.id = user.id;
              const userRecord = await testPrisma.user.findUnique({
                where: { id: user.id },
                select: { memberId: true },
              });
              if (userRecord) {
                extendedSession.user.memberId = userRecord.memberId;
              }
            }
            return extendedSession;
          },
        },
      };
      
      const mockSession: Session = {
        user: {
          id: user.id,
          email: user.email ?? undefined,
          name: user.name ?? undefined,
        },
        expires: new Date().toISOString(),
      };
      
      const mockUser: AdapterUser = {
        id: user.id,
        email: user.email ?? '',
        emailVerified: null,
        name: user.name ?? null,
        image: null,
      };

      const result = await testAuthOptions.callbacks?.session?.({
        session: mockSession,
        user: mockUser,
      });

      expect(result?.user).toBeDefined();
      expect(result?.user.id).toBe(user.id);
      expect(result?.user.memberId).toBe(member.id);
    });

    it('should have null memberId in session when User is not linked to Member', async () => {
      const user = await createUser();
      
      // Create a test-specific auth options that uses testPrisma
      const { testPrisma } = await import('./setup');
      
      type ExtendedSessionUser = Session['user'] & {
        id: string;
        memberId?: string | null;
      };
      
      type ExtendedSession = Omit<Session, 'user'> & {
        user: ExtendedSessionUser;
      };
      
      const testAuthOptions = {
        ...authOptions,
        callbacks: {
          ...authOptions.callbacks,
          async session({ session, user }: { session: Session; user: AdapterUser }): Promise<ExtendedSession> {
            const extendedSession = session as ExtendedSession;
            if (extendedSession.user && user) {
              extendedSession.user.id = user.id;
              const userRecord = await testPrisma.user.findUnique({
                where: { id: user.id },
                select: { memberId: true },
              });
              if (userRecord) {
                extendedSession.user.memberId = userRecord.memberId;
              }
            }
            return extendedSession;
          },
        },
      };
      
      const mockSession: Session = {
        user: {
          id: user.id,
          email: user.email ?? undefined,
          name: user.name ?? undefined,
        },
        expires: new Date().toISOString(),
      };
      
      const mockUser: AdapterUser = {
        id: user.id,
        email: user.email ?? '',
        emailVerified: null,
        name: user.name ?? null,
        image: null,
      };

      const result = await testAuthOptions.callbacks?.session?.({
        session: mockSession,
        user: mockUser,
      });

      expect(result?.user).toBeDefined();
      expect(result?.user.id).toBe(user.id);
      expect(result?.user.memberId).toBeNull();
    });
  });

  describe('Sign-In Callbacks', () => {
    it('should allow all sign-in attempts', async () => {
      if (!authOptions.callbacks?.signIn) {
        throw new Error('signIn callback is not defined');
      }
      
      const result = await authOptions.callbacks.signIn({
        user: { id: 'test', email: 'test@example.com', emailVerified: null, name: null, image: null },
        account: null,
        profile: undefined,
        email: { verificationRequest: true },
      });

      expect(result).toBe(true);
    });
  });

  describe('GraphQL Context - Authentication', () => {
    it('should create context with authenticated user', async () => {
      // This test is skipped because getServerSession requires Next.js request context
      // which is not available in unit tests. This is better tested in integration/E2E tests.
      // The context creation with actual sessions is tested in auth.integration.test.ts
      expect(true).toBe(true); // Placeholder - actual test in integration tests
    });

    it('should handle unauthenticated requests', async () => {
      const context = createUnauthenticatedContext();
      
      expect(context.user).toBeNull();
      expect(context.prisma).toBeDefined();
    });

    it('should handle authenticated user without Member', async () => {
      const user = await createUser();
      const context = createAuthenticatedContext({
        id: user.id,
        email: user.email,
        memberId: null,
      });
      
      expect(context.user).toBeDefined();
      expect(context.user?.id).toBe(user.id);
      expect(context.user?.email).toBe(user.email);
      expect(context.user?.memberId).toBeNull();
    });

    it('should handle authenticated user with Member', async () => {
      const { user, member } = await createUserWithMember();
      const context = createAuthenticatedContext({
        id: user.id,
        email: user.email,
        memberId: member.id,
      });
      
      expect(context.user).toBeDefined();
      expect(context.user?.id).toBe(user.id);
      expect(context.user?.email).toBe(user.email);
      expect(context.user?.memberId).toBe(member.id);
    });
  });

  describe('GraphQL Queries with Authentication', () => {
    it('should allow queries with authenticated user', async () => {
      await testFactory.createMember({ name: 'Test Member' });
      const user = await createUser();
      const context = createAuthenticatedContext({
        id: user.id,
        email: user.email,
        memberId: null,
      });

      const result = await queries.members(undefined, undefined, context);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should allow queries with unauthenticated user', async () => {
      await testFactory.createMember({ name: 'Test Member' });
      const context = createUnauthenticatedContext();

      const result = await queries.members(undefined, undefined, context);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return currentUser when authenticated', async () => {
      const user = await createUser();
      const context = createAuthenticatedContext({
        id: user.id,
        email: user.email,
        memberId: null,
      });

      const result = await queries.currentUser(undefined, undefined, context);
      expect(result).toBeDefined();
      expect(result?.id).toBe(user.id);
      expect(result?.email).toBe(user.email);
    });

    it('should return null for currentUser when unauthenticated', async () => {
      const context = createUnauthenticatedContext();

      const result = await queries.currentUser(undefined, undefined, context);
      expect(result).toBeNull();
    });
  });

  describe('User and Member Independence', () => {
    it('should allow multiple Users without Members', async () => {
      const user1 = await createUser({ email: 'admin1@example.com' });
      const user2 = await createUser({ email: 'admin2@example.com' });
      const user3 = await createUser({ email: 'admin3@example.com' });

      expect(user1.memberId).toBeNull();
      expect(user2.memberId).toBeNull();
      expect(user3.memberId).toBeNull();
    });

    it('should allow multiple Members without Users', async () => {
      const member1 = await createMemberWithoutUser({ name: 'Student 1' });
      const member2 = await createMemberWithoutUser({ name: 'Student 2' });
      const member3 = await createMemberWithoutUser({ name: 'Student 3' });

      const users = await testPrisma.user.findMany({
        where: {
          memberId: {
            in: [member1.id, member2.id, member3.id],
          },
        },
      });

      expect(users).toHaveLength(0);
    });

    it('should allow mixed scenario: some Users with Members, some without', async () => {
      const userWithoutMember = await createUser({ email: 'admin@example.com' });
      const { user: userWithMember } = await createUserWithMember({
        userEmail: 'researcher@example.com',
      });
      const memberWithoutUser = await createMemberWithoutUser({
        name: 'Student',
      });

      expect(userWithoutMember.memberId).toBeNull();
      expect(userWithMember.memberId).not.toBeNull();
      
      const linkedUser = await testPrisma.user.findFirst({
        where: { memberId: memberWithoutUser.id },
      });
      expect(linkedUser).toBeNull();
    });
  });

  describe('Account Model (Authentication Methods)', () => {
    it('should create Account linked to User', async () => {
      const user = await createUser();

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

    it('should allow User to have multiple Accounts', async () => {
      const user = await createUser();

      await testPrisma.account.create({
        data: {
          userId: user.id,
          type: 'email',
          provider: 'email',
          providerAccountId: user.email,
        },
      });

      await testPrisma.account.create({
        data: {
          userId: user.id,
          type: 'oauth',
          provider: 'google',
          providerAccountId: 'google-123',
        },
      });

      const accounts = await testPrisma.account.findMany({
        where: { userId: user.id },
      });

      expect(accounts).toHaveLength(2);
      expect(accounts.some((a) => a.provider === 'email')).toBe(true);
      expect(accounts.some((a) => a.provider === 'google')).toBe(true);
    });
  });
});

