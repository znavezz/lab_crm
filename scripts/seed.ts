// scripts/seed.ts
// Safe development seed script with --reset flag

import 'dotenv/config'; // Load environment variables from .env.local or .env
import { PrismaClient } from '@/generated/prisma';
import { DataFactory } from './factories';
import { TestFixtures } from './fixtures';

const prisma = new PrismaClient();
const factory = new DataFactory(prisma);
const fixtures = new TestFixtures(prisma, factory);

async function main() {
  const shouldReset = process.argv.includes('--reset');
  const useMinimal = process.argv.includes('--minimal');

  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('❌ Error: DATABASE_URL environment variable is not set!');
    console.error('   Please set it in your .env.local or .env file');
    console.error('   Example: DATABASE_URL="postgresql://user:password@localhost:5432/lab_crm"');
    process.exit(1);
  }

  console.log('🌱 Starting database seed...\n');

  // Test database connection
  try {
    await prisma.$connect();
    console.log('✅ Database connection established\n');
  } catch (error) {
    console.error('❌ Error connecting to database:');
    console.error(`   ${error instanceof Error ? error.message : String(error)}`);
    console.error('\n   Please check:');
    console.error('   1. Is your database running?');
    console.error('   2. Is DATABASE_URL correct?');
    console.error('   3. Are database credentials correct?');
    if (process.env.DATABASE_URL?.includes('localhost')) {
      console.error('   4. For Docker: Make sure containers are running (docker-compose up -d)');
    }
    process.exit(1);
  }

  // Check if data exists
  let memberCount: number;
  let projectCount: number;
  
  try {
    memberCount = await prisma.member.count();
    projectCount = await prisma.project.count();
  } catch (error) {
    console.error('❌ Error querying database:');
    console.error(`   ${error instanceof Error ? error.message : String(error)}`);
    console.error('\n   This might mean:');
    console.error('   1. Database tables don\'t exist - run migrations first: npx prisma migrate dev');
    console.error('   2. Database schema is out of sync - run: npx prisma migrate deploy');
    process.exit(1);
  }

  if (memberCount > 0 || projectCount > 0) {
    if (!shouldReset) {
      console.log('⚠️  Database already contains data!');
      console.log('   Use --reset flag to clear and reseed: npm run seed -- --reset');
      console.log('   Or use --minimal to add minimal test data: npm run seed -- --minimal\n');
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
    await prisma.protocol.deleteMany();
    
    // Disconnect many-to-many relations (ignore errors if tables don't exist)
    try {
      await prisma.$executeRaw`DELETE FROM "_EventToEquipment"`;
    } catch {}
    try {
      await prisma.$executeRaw`DELETE FROM "_EventToMember"`;
    } catch {}
    try {
      await prisma.$executeRaw`DELETE FROM "_EventToProject"`;
    } catch {}
    try {
      await prisma.$executeRaw`DELETE FROM "_ProjectMembers"`;
    } catch {}
    try {
      await prisma.$executeRaw`DELETE FROM "_ProjectToGrant"`;
    } catch {}
    try {
      await prisma.$executeRaw`DELETE FROM "_ProjectToPublication"`;
    } catch {}
    try {
      await prisma.$executeRaw`DELETE FROM "_ProjectToCollaborator"`;
    } catch {}
    try {
      await prisma.$executeRaw`DELETE FROM "_MemberToPublication"`;
    } catch {}
    
    await prisma.event.deleteMany();
    await prisma.equipment.deleteMany();
    await prisma.collaborator.deleteMany();
    await prisma.grant.deleteMany();
    await prisma.project.deleteMany();
    await prisma.member.deleteMany();
    await prisma.user.deleteMany();
    
    console.log('✅ Database cleared.\n');
  }

  // Seed data
  if (useMinimal) {
    console.log('📦 Creating minimal test data...\n');
    await fixtures.createMinimalSetup();
    console.log('✅ Minimal seed completed!');
    console.log(`   Created: 1 member, 1 project, 1 grant\n`);
  } else {
    console.log('📦 Creating complete lab setup...\n');
    await fixtures.createCompleteLabSetup();
    
    console.log('✅ Seed completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   Members: 20 total`);
    console.log(`   - 1 Professor (PI)`);
    console.log(`   - 5 Active Postdocs + 3 Alumni Postdocs`);
    console.log(`   - 3 Active PhD Students + 2 Alumni PhD Students`);
    console.log(`   - 3 Active MSc Students + 2 Alumni MSc Students`);
    console.log(`   - 1 Active BSc Student`);
    console.log(`   - 1 Lab Manager`);
    console.log(`   Status: 13 Active, 7 Alumni`);
    console.log(`\n   Projects: 30 (spanning multiple years with real member assignments)`);
    console.log(`   Grants: 18 (13 past/current, 5 future/pending - spanning ${new Date().getFullYear() - 5} to ${new Date().getFullYear() + 5})`);
    console.log(`   Equipment: 35 (with correct status logic and assignments)`);
    console.log(`   Publications: 45 (with proper author relationships)`);
    console.log(`   Protocols: 25 (linked to authors and projects)`);
    console.log(`   Events: 30 (with attendees and projects)`);
    console.log(`   Bookings: 20 (equipment reservations)`);
    console.log(`   Collaborators: 15 (external researchers)`);
    console.log(`   Documents: 20 (CVs and project documents)`);
    console.log(`   Expenses: 40 (linked to projects and grants)`);
    console.log(`   NoteTasks: 15 (project tasks)\n`);
    
    // Test computed fields
    console.log('🧪 Testing computed fields...');
    const grant = await prisma.grant.findFirst({
      include: { expenses: true },
    });
    
    if (grant) {
      const totalSpent = grant.expenses.reduce((sum, e) => sum + e.amount, 0);
      const remaining = grant.budget - totalSpent;
      console.log(`   Grant "${grant.name}":`);
      console.log(`     Budget: $${grant.budget.toLocaleString()}`);
      console.log(`     Spent: $${totalSpent.toLocaleString()}`);
      console.log(`     Remaining: $${remaining.toLocaleString()}\n`);
    }
  }

  // Final counts
  const finalCounts = {
    members: await prisma.member.count(),
    projects: await prisma.project.count(),
    grants: await prisma.grant.count(),
    equipment: await prisma.equipment.count(),
    bookings: await prisma.booking.count(),
    events: await prisma.event.count(),
    expenses: await prisma.expense.count(),
  };

  console.log('📈 Final database counts:');
  Object.entries(finalCounts).forEach(([key, count]) => {
    console.log(`   ${key}: ${count}`);
  });
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

