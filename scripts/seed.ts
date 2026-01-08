// scripts/seed.ts
// Safe development seed script with --reset flag
// Uses Hasura GraphQL mutations instead of Prisma

import 'dotenv/config';
import { hasuraQuery, checkHasuraConnection } from '../src/lib/hasura-client';
import { DataFactory } from './factories';
import { TestFixtures } from './fixtures';

const factory = new DataFactory();
const fixtures = new TestFixtures(factory);

async function main() {
  const shouldReset = process.argv.includes('--reset');
  const useMinimal = process.argv.includes('--minimal');

  console.log('🌱 Starting database seed...\n');

  // Test Hasura connection
  try {
    const connected = await checkHasuraConnection();
    if (!connected) {
      throw new Error('Could not connect to Hasura');
    }
    console.log('✅ Hasura connection established\n');
  } catch (error) {
    console.error('❌ Error connecting to Hasura:');
    console.error(`   ${error instanceof Error ? error.message : String(error)}`);
    console.error('\n   Please check:');
    console.error('   1. Is Hasura running? (docker-compose up -d)');
    console.error('   2. Is HASURA_ENDPOINT correct?');
    console.error('   3. Is HASURA_GRAPHQL_ADMIN_SECRET correct?');
    process.exit(1);
  }

  // Check if data exists
  let counts: { Member_aggregate: { aggregate: { count: number } }; Project_aggregate: { aggregate: { count: number } } };
  try {
    counts = await hasuraQuery<typeof counts>(
      `query GetCounts {
        Member_aggregate { aggregate { count } }
        Project_aggregate { aggregate { count } }
      }`
    );
  } catch (error) {
    console.error('❌ Error querying database:');
    console.error(`   ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }

  const memberCount = counts.Member_aggregate.aggregate.count;
  const projectCount = counts.Project_aggregate.aggregate.count;

  if (memberCount > 0 || projectCount > 0) {
    if (!shouldReset) {
      console.log('⚠️  Database already contains data!');
      console.log(`   Members: ${memberCount}, Projects: ${projectCount}`);
      console.log('   Use --reset flag to clear and reseed: npm run db:seed -- --reset');
      console.log('   Or use --minimal to add minimal test data: npm run db:seed -- --minimal\n');
      process.exit(0);
    }

    console.log('🧹 Clearing existing data (--reset flag detected)...\n');

    // Delete in correct order to respect foreign key constraints
    const deleteOperations = [
      'delete_NoteTask(where: {}) { affected_rows }',
      'delete_Booking(where: {}) { affected_rows }',
      'delete_Expense(where: {}) { affected_rows }',
      'delete_Document(where: {}) { affected_rows }',
      'delete_AcademicInfo(where: {}) { affected_rows }',
      'delete_Protocol(where: {}) { affected_rows }',
      // Many-to-many junction tables
      'delete__EquipmentToEvent(where: {}) { affected_rows }',
      'delete__EventToMember(where: {}) { affected_rows }',
      'delete__EventToProject(where: {}) { affected_rows }',
      'delete__ProjectMembers(where: {}) { affected_rows }',
      'delete__GrantToProject(where: {}) { affected_rows }',
      'delete__ProjectToPublication(where: {}) { affected_rows }',
      'delete__CollaboratorToProject(where: {}) { affected_rows }',
      'delete__MemberToPublication(where: {}) { affected_rows }',
      // Main tables
      'delete_Publication(where: {}) { affected_rows }',
      'delete_Event(where: {}) { affected_rows }',
      'delete_Equipment(where: {}) { affected_rows }',
      'delete_Grant(where: {}) { affected_rows }',
      'delete_Collaborator(where: {}) { affected_rows }',
      'delete_Project(where: {}) { affected_rows }',
      'delete_Member(where: {}) { affected_rows }',
    ];

    for (const operation of deleteOperations) {
      try {
        await hasuraQuery(`mutation { ${operation} }`);
      } catch {
        // Ignore errors (table might not exist or be empty)
      }
    }

    console.log('✅ Database cleared\n');
  }

  // Seed the database
  console.log('📦 Creating seed data...\n');

  try {
    if (useMinimal) {
      console.log('Creating minimal test data...');
      const { member, project, grant } = await fixtures.createMinimalSetup();
      console.log(`\n✅ Minimal seed data created:`);
      console.log(`   • 1 Member: ${member.name}`);
      console.log(`   • 1 Project: ${project.title}`);
      console.log(`   • 1 Grant: ${grant.name}`);
    } else {
      console.log('Creating comprehensive lab data...');
      console.log('This may take a moment...\n');
      
      const result = await fixtures.createCompleteLabSetup();
      
      console.log(`\n✅ Comprehensive seed data created:`);
      console.log(`   • ${result.members.length} Members`);
      console.log(`   • ${result.projects.length} Projects`);
      console.log(`   • ${result.grants.length} Grants`);
      console.log(`   • ${result.equipment.length} Equipment items`);
      console.log(`   • ${result.events.length} Events`);
      console.log(`   • ${result.publications.length} Publications`);
      console.log(`   • ${result.protocols.length} Protocols`);
      console.log(`   • ${result.collaborators.length} Collaborators`);
    }

    console.log('\n🎉 Database seeding complete!\n');
    console.log('📝 Next steps:');
    console.log('   1. Start the app: npm run dev');
    console.log('   2. Open http://localhost:3000');
    console.log('   3. Create a test user: npx tsx scripts/create-test-user.ts');
  } catch (error) {
    console.error('\n❌ Error seeding database:');
    console.error(`   ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

main();
