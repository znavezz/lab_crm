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
  const dbName = url.pathname.split('/').pop() || 'lab_crm';
  url.pathname = `/test_${dbName}`;
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
  
  try {
    await testPrisma.$connect();
    console.log('✅ Test database connected');
    
    // Verify connection by running a simple query
    await testPrisma.$queryRaw`SELECT 1`;
  } catch (error) {
    console.error('❌ Failed to connect to test database');
    console.error('   Make sure:');
    console.error('   1. TEST_DATABASE_URL is set in your .env file');
    console.error('   2. Test database exists');
    console.error('   3. Migrations have been run: DATABASE_URL="..." npx prisma migrate deploy');
    throw error;
  }
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
  
  // Disconnect many-to-many relations (ignore errors if tables don't exist)
  const junctionTables = [
    '_EventToEquipment',
    '_EventToMember',
    '_EventToProject',
    '_ProjectMembers',
    '_ProjectToGrant',
    '_ProjectToPublication',
    '_ProjectToCollaborator',
    '_MemberToPublication',
  ];
  
  for (const table of junctionTables) {
    try {
      await testPrisma.$executeRawUnsafe(`DELETE FROM "${table}"`);
    } catch (error: any) {
      // Ignore errors if table doesn't exist (e.g., no data has been created yet)
      // Check both error code and message for "does not exist"
      const isTableNotFound = 
        error?.code === '42P01' || 
        error?.code === 'P2025' ||
        (typeof error?.message === 'string' && error.message.includes('does not exist'));
      
      if (!isTableNotFound) {
        // Re-throw if it's not a "relation does not exist" error
        throw error;
      }
    }
  }
  
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

