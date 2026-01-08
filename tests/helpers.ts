// tests/helpers.ts
// Test utilities and helpers using Hasura GraphQL

import { DataFactory } from '../scripts/factories';
import { TestFixtures } from '../scripts/fixtures';
import { hasuraQuery } from '../src/lib/hasura-client';

// Type definitions
type MemberStatus = 'ACTIVE' | 'ALUMNI' | 'INACTIVE';
type MemberRole = 'PI' | 'STUDENT' | 'LAB_MANAGER' | 'RESEARCHER' | 'ADVISOR' | 'INTERN' | 'CONTRACTOR' | 'GUEST' | 'ALUMNI' | 'OTHER';

interface User {
  id: string;
  email: string;
  name?: string;
  memberId?: string | null;
}

interface Member {
  id: string;
  name: string;
  role?: string;
  status?: string;
}

// Export test instances
export const testFactory = new DataFactory();
export const testFixtures = new TestFixtures(testFactory);

/**
 * Helper to create a test context for GraphQL resolvers
 */
export function createTestContext() {
  return {
    user: null, // Add auth user here when testing authenticated endpoints
  };
}

/**
 * Helper to wait for async operations
 */
export function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Helper to create a date in the future
 */
export function futureDate(days: number = 7): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

/**
 * Helper to create a date in the past
 */
export function pastDate(days: number = 7): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

/**
 * Helper to assert that two dates are approximately equal (within 1 second)
 */
export function datesAreClose(date1: Date, date2: Date, toleranceMs: number = 1000): boolean {
  return Math.abs(date1.getTime() - date2.getTime()) <= toleranceMs;
}

/**
 * Helper to create a booking time range
 */
export function createBookingTimeRange(
  startHoursFromNow: number = 1,
  durationHours: number = 3
) {
  const start = new Date();
  start.setHours(start.getHours() + startHoursFromNow);
  
  const end = new Date(start);
  end.setHours(end.getHours() + durationHours);
  
  return { startTime: start, endTime: end };
}

/**
 * Helper to calculate sum of expenses
 */
export function sumExpenses(expenses: Array<{ amount: number }>): number {
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
}

/**
 * Helper to create test data for budget testing
 */
export async function createBudgetTestData() {
  const grant = await testFactory.createGrant({ budget: 100000 });
  const project = await testFactory.createProject();
  
  // Link grant to project
  await hasuraQuery(
    `mutation LinkGrantToProject($grantId: String!, $projectId: String!) {
      insert__GrantToProject_one(object: { A: $grantId, B: $projectId }) { A B }
    }`,
    { grantId: grant.id, projectId: project.id }
  ).catch(() => {});
  
  const expenses = await Promise.all([
    testFactory.createExpense({ amount: 10000, grantId: grant.id, projectId: project.id }),
    testFactory.createExpense({ amount: 5000, grantId: grant.id, projectId: project.id }),
    testFactory.createExpense({ amount: 3000, grantId: grant.id, projectId: project.id }),
  ]);
  
  return { grant, project, expenses };
}

/**
 * Authentication test helpers
 */

/**
 * Create a User (CRM access) without a Member
 */
export async function createUser(overrides?: {
  email?: string;
  name?: string;
  emailVerified?: Date;
}): Promise<User> {
  const email = overrides?.email || `test-${Date.now()}@example.com`;
  const name = overrides?.name || 'Test User';
  
  const result = await hasuraQuery<{ insert_User_one: User }>(
    `mutation CreateUser($object: User_insert_input!) {
      insert_User_one(object: $object) { id email name memberId }
    }`,
    {
      object: {
        email,
        name,
        emailVerified: overrides?.emailVerified?.toISOString() || null,
        memberId: null,
      },
    }
  );
  
  return result.insert_User_one;
}

/**
 * Create a User and link it to a Member
 */
export async function createUserWithMember(overrides?: {
  userEmail?: string;
  userName?: string;
  memberName?: string;
  memberRole?: MemberRole | string;
  memberStatus?: MemberStatus | string;
}): Promise<{ user: User; member: Member }> {
  // Create Member first
  const member = await testFactory.createMember({
    name: overrides?.memberName || 'Test Member',
    rank: 'MSc',
    status: (overrides?.memberStatus as MemberStatus) || 'ACTIVE',
    role: (overrides?.memberRole as MemberRole) || 'STUDENT',
    scholarship: 30000,
  });
  
  // Create User and link to Member
  const userResult = await hasuraQuery<{ insert_User_one: User }>(
    `mutation CreateUser($object: User_insert_input!) {
      insert_User_one(object: $object) { id email name memberId }
    }`,
    {
      object: {
        email: overrides?.userEmail || `test-${Date.now()}@example.com`,
        name: overrides?.userName || 'Test User',
        memberId: member.id,
      },
    }
  );
  
  return { user: userResult.insert_User_one, member };
}

/**
 * Create a Member without a User (no CRM access)
 */
export async function createMemberWithoutUser(overrides?: {
  name?: string;
  role?: MemberRole | string;
  status?: MemberStatus | string;
}): Promise<Member> {
  return await testFactory.createMember({
    name: overrides?.name || 'Member Without Access',
    role: overrides?.role as MemberRole | undefined,
    status: overrides?.status as MemberStatus | undefined,
  });
}

/**
 * Create a test context with an authenticated user
 */
export function createAuthenticatedContext(user: {
  id: string;
  email: string;
  memberId: string | null;
}) {
  return {
    user: {
      id: user.id,
      email: user.email,
      memberId: user.memberId,
    },
  };
}

/**
 * Create a test context with an unauthenticated user
 */
export function createUnauthenticatedContext() {
  return {
    user: null,
  };
}
