// tests/setup.ts
// Test database setup and teardown using Hasura GraphQL

import { hasuraQuery, checkHasuraConnection } from '../src/lib/hasura-client';

/**
 * Setup test database before all tests
 * Verifies Hasura connection
 */
export async function setupTestDatabase() {
  console.log('🔧 Setting up test database...');
  
  try {
    const connected = await checkHasuraConnection();
    if (!connected) {
      throw new Error('Could not connect to Hasura');
    }
    console.log('✅ Hasura connection established');
  } catch (error) {
    console.error('❌ Failed to connect to Hasura');
    console.error('   Make sure:');
    console.error('   1. Hasura is running (docker-compose up -d)');
    console.error('   2. HASURA_ENDPOINT is correct');
    console.error('   3. HASURA_GRAPHQL_ADMIN_SECRET is correct');
    throw error;
  }
}

/**
 * Clean up test database after all tests
 */
export async function teardownTestDatabase() {
  console.log('🧹 Cleaning up test database...');
  // No explicit disconnect needed for Hasura HTTP client
  console.log('✅ Test database cleanup complete');
}

/**
 * Clean all data from test database (truncate tables)
 * Use this in beforeEach to ensure clean state
 */
export async function cleanTestDatabase() {
  // Delete in correct order to respect foreign key constraints
  const deleteOperations = [
    // Auth-related tables first
    'delete_Session(where: {}) { affected_rows }',
    'delete_Account(where: {}) { affected_rows }',
    'delete_VerificationToken(where: {}) { affected_rows }',
    'delete_SmsVerificationCode(where: {}) { affected_rows }',
    'delete_WebAuthnChallenge(where: {}) { affected_rows }',
    'delete_Authenticator(where: {}) { affected_rows }',
    
    // Main tables with dependencies
    'delete_NoteTask(where: {}) { affected_rows }',
    'delete_Booking(where: {}) { affected_rows }',
    'delete_Expense(where: {}) { affected_rows }',
    'delete_Document(where: {}) { affected_rows }',
    'delete_Protocol(where: {}) { affected_rows }',
    'delete_Publication(where: {}) { affected_rows }',
    'delete_AcademicInfo(where: {}) { affected_rows }',
    
    // Junction tables (many-to-many)
    'delete__EquipmentToEvent(where: {}) { affected_rows }',
    'delete__EventToMember(where: {}) { affected_rows }',
    'delete__EventToProject(where: {}) { affected_rows }',
    'delete__ProjectMembers(where: {}) { affected_rows }',
    'delete__GrantToProject(where: {}) { affected_rows }',
    'delete__ProjectToPublication(where: {}) { affected_rows }',
    'delete__CollaboratorToProject(where: {}) { affected_rows }',
    'delete__MemberToPublication(where: {}) { affected_rows }',
    
    // Main tables
    'delete_Event(where: {}) { affected_rows }',
    'delete_Equipment(where: {}) { affected_rows }',
    'delete_Collaborator(where: {}) { affected_rows }',
    'delete_Grant(where: {}) { affected_rows }',
    'delete_Project(where: {}) { affected_rows }',
    'delete_User(where: {}) { affected_rows }',
    'delete_Member(where: {}) { affected_rows }',
  ];

  for (const operation of deleteOperations) {
    try {
      await hasuraQuery(`mutation { ${operation} }`);
    } catch {
      // Ignore errors (table might not exist or be empty)
    }
  }
}

/**
 * Execute a GraphQL query for tests
 */
export async function testQuery<T = unknown>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  return hasuraQuery<T>(query, variables);
}

/**
 * Helper to wrap test operations (no transaction support in Hasura HTTP API)
 * Tests should use cleanTestDatabase() in beforeEach instead
 */
export async function withTestContext<T>(
  fn: () => Promise<T>
): Promise<T> {
  return fn();
}
