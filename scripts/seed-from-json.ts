// scripts/seed-from-json.ts
// Seed database from JSON file
// Uses Hasura GraphQL mutations instead of Prisma

import 'dotenv/config';
import { hasuraQuery, checkHasuraConnection } from '../src/lib/hasura-client';
import * as fs from 'fs';
import * as path from 'path';

interface AcademicInfoInput {
  degree: string;
  field?: string;
  institution?: string;
  graduationYear?: number;
}

interface MemberInput {
  name: string;
  rank?: 'PROFESSOR' | 'PhD' | 'POSTDOC' | 'MSc' | 'BSc' | 'Mr' | 'Mrs';
  status?: 'ACTIVE' | 'ALUMNI' | 'INACTIVE';
  role?: 'PI' | 'STUDENT' | 'LAB_MANAGER' | 'RESEARCHER' | 'ADVISOR' | 'INTERN' | 'CONTRACTOR' | 'GUEST' | 'ALUMNI' | 'OTHER';
  scholarship?: number | null;
  photoUrl?: string | null;
  academicInfo?: AcademicInfoInput[];
}

interface SeedData {
  members: MemberInput[];
}

interface Member {
  id: string;
  name: string;
  role?: string;
}

async function main() {
  const shouldReset = process.argv.includes('--reset');
  const jsonFile = process.argv.find(arg => arg.endsWith('.json')) || 'data/members-template.json';
  const jsonPath = path.resolve(process.cwd(), jsonFile);

  // Check if JSON file exists
  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ Error: JSON file not found: ${jsonPath}`);
    console.error('   Please create the file or specify a different path');
    console.error('   Example: npm run db:seed:json -- data/members-template.json');
    process.exit(1);
  }

  console.log('🌱 Starting database seed from JSON...\n');
  console.log(`📄 Reading from: ${jsonPath}\n`);

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

  // Read and parse JSON file
  let seedData: SeedData;
  try {
    const fileContent = fs.readFileSync(jsonPath, 'utf-8');
    seedData = JSON.parse(fileContent);
  } catch (error) {
    console.error('❌ Error reading JSON file:');
    console.error(`   ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }

  // Check if data exists
  const countData = await hasuraQuery<{ Member_aggregate: { aggregate: { count: number } } }>(
    `query { Member_aggregate { aggregate { count } } }`
  );
  const memberCount = countData.Member_aggregate.aggregate.count;

  if (memberCount > 0) {
    if (!shouldReset) {
      console.log('⚠️  Database already contains data!');
      console.log('   Use --reset flag to clear and reseed: npm run db:seed:json -- --reset');
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
      // Many-to-many junction tables
      'delete__EventToMember(where: {}) { affected_rows }',
      'delete__ProjectMembers(where: {}) { affected_rows }',
      'delete__MemberToPublication(where: {}) { affected_rows }',
      // Main tables
      'delete_Member(where: {}) { affected_rows }',
    ];

    for (const operation of deleteOperations) {
      try {
        await hasuraQuery(`mutation { ${operation} }`);
      } catch {
        // Ignore errors
      }
    }

    console.log('✅ Members cleared.\n');
  }

  // Seed members from JSON
  console.log('📦 Creating members from JSON data...\n');

  let createdCount = 0;
  let errorCount = 0;

  for (const memberData of seedData.members) {
    try {
      // Validate required fields
      if (!memberData.name) {
        console.error(`⚠️  Skipping member: missing required field 'name'`);
        errorCount++;
        continue;
      }

      // Create member
      const memberResult = await hasuraQuery<{ insert_Member_one: Member }>(
        `mutation CreateMember($object: Member_insert_input!) {
          insert_Member_one(object: $object) { id name role }
        }`,
        {
          object: {
            name: memberData.name,
            rank: memberData.rank || undefined,
            status: memberData.status || undefined,
            role: memberData.role || undefined,
            scholarship: memberData.scholarship ?? undefined,
            photoUrl: memberData.photoUrl || undefined,
          },
        }
      );

      const member = memberResult.insert_Member_one;

      // Create academic info if provided
      if (memberData.academicInfo && memberData.academicInfo.length > 0) {
        for (const academic of memberData.academicInfo) {
          await hasuraQuery(
            `mutation CreateAcademicInfo($object: AcademicInfo_insert_input!) {
              insert_AcademicInfo_one(object: $object) { id }
            }`,
            {
              object: {
                memberId: member.id,
                degree: academic.degree,
                field: academic.field || undefined,
                institution: academic.institution || undefined,
                graduationYear: academic.graduationYear || undefined,
              },
            }
          );
        }
        console.log(`✅ Created: ${member.name} (${member.role || 'No role'}) with ${memberData.academicInfo.length} degree(s)`);
      } else {
        console.log(`✅ Created: ${member.name} (${member.role || 'No role'})`);
      }

      createdCount++;
    } catch (error) {
      console.error(`❌ Error creating member "${memberData.name}":`);
      console.error(`   ${error instanceof Error ? error.message : String(error)}`);
      errorCount++;
    }
  }

  console.log('\n✅ Seed completed!\n');
  console.log('📊 Summary:');
  console.log(`   Created: ${createdCount} member(s)`);
  if (errorCount > 0) {
    console.log(`   Errors: ${errorCount} member(s)`);
  }

  // Final count
  const finalCountData = await hasuraQuery<{ Member_aggregate: { aggregate: { count: number } } }>(
    `query { Member_aggregate { aggregate { count } } }`
  );
  console.log(`   Total in database: ${finalCountData.Member_aggregate.aggregate.count} member(s)\n`);
}

main().catch((e) => {
  console.error('❌ Error seeding database:', e);
  process.exit(1);
});
