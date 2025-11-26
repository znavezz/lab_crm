// scripts/seed-from-json.ts
// Seed database from JSON file

import 'dotenv/config';
import { PrismaClient } from '@/generated/prisma';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

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

async function main() {
  const shouldReset = process.argv.includes('--reset');
  const jsonFile = process.argv.find(arg => arg.endsWith('.json')) || 'data/members-template.json';
  const jsonPath = path.resolve(process.cwd(), jsonFile);

  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('❌ Error: DATABASE_URL environment variable is not set!');
    console.error('   Please set it in your .env.local or .env file');
    process.exit(1);
  }

  // Check if JSON file exists
  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ Error: JSON file not found: ${jsonPath}`);
    console.error('   Please create the file or specify a different path');
    console.error('   Example: npm run seed:json -- data/members-template.json');
    process.exit(1);
  }

  console.log('🌱 Starting database seed from JSON...\n');
  console.log(`📄 Reading from: ${jsonPath}\n`);

  // Test database connection
  try {
    await prisma.$connect();
    console.log('✅ Database connection established\n');
  } catch (error) {
    console.error('❌ Error connecting to database:');
    console.error(`   ${error instanceof Error ? error.message : String(error)}`);
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
  const memberCount = await prisma.member.count();

  if (memberCount > 0) {
    if (!shouldReset) {
      console.log('⚠️  Database already contains data!');
      console.log('   Use --reset flag to clear and reseed: npm run seed:json -- --reset');
      process.exit(0);
    }

    console.log('🧹 Clearing existing data (--reset flag detected)...\n');
    
    // Delete in correct order to respect foreign key constraints
    await prisma.noteTask.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.expense.deleteMany();
    await prisma.document.deleteMany();
    await prisma.publication.deleteMany();
    await prisma.academicInfo.deleteMany();
    
    // Disconnect many-to-many relations (ignore errors if tables don't exist)
    const relationTables = [
      '_EventToEquipment',
      '_EventToMember',
      '_EventToProject',
      '_ProjectMembers',
      '_ProjectToGrant',
      '_ProjectToPublication',
      '_ProjectToCollaborator',
      '_MemberToPublication',
    ];
    
    for (const table of relationTables) {
      try {
        await prisma.$executeRawUnsafe(`DELETE FROM "${table}"`);
      } catch (error: unknown) {
        // Ignore errors if table doesn't exist (error code 42P01)
        const err = error as { meta?: { code?: string }; code?: string };
        const errorCode = err?.meta?.code || err?.code;
        if (errorCode !== '42P01' && errorCode !== 'P2010') {
          throw error;
        }
        // Silently continue if table doesn't exist
      }
    }
    
    await prisma.event.deleteMany();
    await prisma.equipment.deleteMany();
    await prisma.collaborator.deleteMany();
    await prisma.grant.deleteMany();
    await prisma.project.deleteMany();
    await prisma.member.deleteMany();
    await prisma.user.deleteMany();
    
    console.log('✅ Database cleared.\n');
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
      const member = await prisma.member.create({
        data: {
          name: memberData.name,
          rank: memberData.rank || undefined,
          status: memberData.status || undefined,
          role: memberData.role || undefined,
          scholarship: memberData.scholarship ?? undefined,
          photoUrl: memberData.photoUrl || undefined,
          academicInfo: memberData.academicInfo
            ? {
                create: memberData.academicInfo.map(academic => ({
                  degree: academic.degree,
                  field: academic.field || undefined,
                  institution: academic.institution || undefined,
                  graduationYear: academic.graduationYear || undefined,
                })),
              }
            : undefined,
        },
        include: {
          academicInfo: true,
        },
      });

      console.log(`✅ Created: ${member.name} (${member.role || 'No role'})`);
      if (member.academicInfo.length > 0) {
        console.log(`   Academic Info: ${member.academicInfo.length} degree(s)`);
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
  const finalCount = await prisma.member.count();
  console.log(`   Total in database: ${finalCount} member(s)\n`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

