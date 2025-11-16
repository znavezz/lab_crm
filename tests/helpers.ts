// tests/helpers.ts
// Test utilities and helpers

import { DataFactory } from '../scripts/factories';
import { TestFixtures } from '../scripts/fixtures';
import { testPrisma } from './setup';

// Export test instances
export const testFactory = new DataFactory(testPrisma);
export const testFixtures = new TestFixtures(testPrisma, testFactory);

/**
 * Helper to create a test context for GraphQL resolvers
 */
export function createTestContext() {
  return {
    prisma: testPrisma,
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
  
  await testPrisma.project.update({
    where: { id: project.id },
    data: {
      grants: { connect: [{ id: grant.id }] },
    },
  });
  
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
}) {
  const email = overrides?.email || `test-${Date.now()}@example.com`;
  const name = overrides?.name || 'Test User';
  
  return await testPrisma.user.create({
    data: {
      email,
      name,
      emailVerified: overrides?.emailVerified || null,
      // Create a Member first to satisfy the relation, then unlink if needed
      // Actually, memberId is nullable, so we can create User without Member
      memberId: null,
    },
  });
}

/**
 * Create a User and link it to a Member
 */
export async function createUserWithMember(overrides?: {
  userEmail?: string;
  userName?: string;
  memberName?: string;
  memberRole?: string;
  memberStatus?: string;
}) {
  // Create Member first
  const member = await testFactory.createMember({
    name: overrides?.memberName || 'Test Member',
    role: overrides?.memberRole as any,
    status: overrides?.memberStatus as any,
  });
  
  // Create User and link to Member
  const user = await testPrisma.user.create({
    data: {
      email: overrides?.userEmail || `test-${Date.now()}@example.com`,
      name: overrides?.userName || 'Test User',
      memberId: member.id,
    },
  });
  
  return { user, member };
}

/**
 * Create a Member without a User (no CRM access)
 */
export async function createMemberWithoutUser(overrides?: {
  name?: string;
  role?: string;
  status?: string;
}) {
  return await testFactory.createMember({
    name: overrides?.name || 'Member Without Access',
    role: overrides?.role as any,
    status: overrides?.status as any,
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
    prisma: testPrisma,
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
    prisma: testPrisma,
    user: null,
  };
}

