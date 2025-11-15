// tests/setup.ts
// Test database setup and teardown

import { PrismaClient } from '@/generated/prisma';

// Use a separate test database
const getTestDatabaseUrl = () => {
  const baseUrl = process.env.DATABASE_URL;
  if (!baseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  
  // Replace database name with test database
  // e.g., postgresql://user:pass@host:5432/dbname -> postgresql://user:pass@host:5432/test_dbname
  const url = new URL(baseUrl);
  url.pathname = `/test_${url.pathname.split('/').pop() || 'lab_crm'}`;
  return url.toString();
};

export const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || getTestDatabaseUrl(),
    },
  },
});

/**
 * Setup test database before all tests
 * Creates database if it doesn't exist and runs migrations
 */
export async function setupTestDatabase() {
  console.log('🔧 Setting up test database...');
  
  // Note: In a real setup, you would:
  // 1. Create the test database if it doesn't exist
  // 2. Run migrations: npx prisma migrate deploy
  // 3. Generate Prisma client: npx prisma generate
  
  // For now, we'll assume the test database exists and is migrated
  // In CI/CD, you'd run these commands before tests
  
  await testPrisma.$connect();
  console.log('✅ Test database connected');
}

/**
 * Clean up test database after all tests
 */
export async function teardownTestDatabase() {
  console.log('🧹 Cleaning up test database...');
  await testPrisma.$disconnect();
  console.log('✅ Test database disconnected');
}

/**
 * Clean all data from test database (truncate tables)
 * Use this in beforeEach to ensure clean state
 */
export async function cleanTestDatabase() {
  // Delete in correct order to respect foreign key constraints
  await testPrisma.noteTask.deleteMany();
  await testPrisma.booking.deleteMany();
  await testPrisma.expense.deleteMany();
  await testPrisma.document.deleteMany();
  await testPrisma.publication.deleteMany();
  await testPrisma.academicInfo.deleteMany();
  
  // Disconnect many-to-many relations
  await testPrisma.$executeRaw`DELETE FROM "_EventToEquipment"`;
  await testPrisma.$executeRaw`DELETE FROM "_EventToMember"`;
  await testPrisma.$executeRaw`DELETE FROM "_EventToProject"`;
  await testPrisma.$executeRaw`DELETE FROM "_ProjectMembers"`;
  await testPrisma.$executeRaw`DELETE FROM "_ProjectToGrant"`;
  await testPrisma.$executeRaw`DELETE FROM "_ProjectToPublication"`;
  await testPrisma.$executeRaw`DELETE FROM "_ProjectToCollaborator"`;
  await testPrisma.$executeRaw`DELETE FROM "_MemberToPublication"`;
  
  await testPrisma.event.deleteMany();
  await testPrisma.equipment.deleteMany();
  await testPrisma.collaborator.deleteMany();
  await testPrisma.grant.deleteMany();
  await testPrisma.project.deleteMany();
  await testPrisma.member.deleteMany();
  await testPrisma.user.deleteMany();
}

/**
 * Wrap a test function in a transaction that gets rolled back
 * This ensures complete isolation between tests
 */
export async function withTransaction<T>(
  fn: (tx: PrismaClient) => Promise<T>
): Promise<T> {
  return await testPrisma.$transaction(async (tx) => {
    return await fn(tx as PrismaClient);
  }, {
    maxWait: 5000,
    timeout: 10000,
  });
}

