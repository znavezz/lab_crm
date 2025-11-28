// scripts/create-test-user.ts
// Creates a test user for authentication

import 'dotenv/config';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.TEST_USER_EMAIL || 'admin@lab.com';
  const name = process.env.TEST_USER_NAME || 'Admin User';

  console.log('🔐 Creating test user for authentication...\n');

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log(`✅ User already exists: ${email}`);
      console.log(`   User ID: ${existingUser.id}`);
      console.log(`   Name: ${existingUser.name}\n`);
      
      // Check if they have a member profile
      if (existingUser.memberId) {
        const member = await prisma.member.findUnique({
          where: { id: existingUser.memberId },
        });
        if (member) {
          console.log(`✅ Linked to member: ${member.name}`);
          console.log(`   Role: ${member.role}`);
          console.log(`   Status: ${member.status}\n`);
        }
      } else {
        console.log('⚠️  User does not have a linked member profile\n');
      }
      
      console.log('📧 To sign in, use email magic link:');
      console.log(`   1. Go to http://localhost:3000/auth/signin`);
      console.log(`   2. Enter email: ${email}`);
      console.log(`   3. Check your email for the magic link\n`);
      console.log('💡 Or use Docker logs to see the magic link token:');
      console.log(`   docker-compose logs app | grep "signin"`);
      
      return;
    }

    // Find or create a member to link to
    let member = await prisma.member.findFirst({
      where: { 
        name: { contains: 'Cohen', mode: 'insensitive' }
      },
    });

    if (!member) {
      // Create a simple admin member
      member = await prisma.member.create({
        data: {
          name: name,
          rank: 'PROFESSOR',
          status: 'ACTIVE',
          role: 'PI',
          joinedDate: new Date(),
        },
      });
      console.log(`✅ Created member: ${member.name}`);
    } else {
      console.log(`✅ Found existing member: ${member.name}`);
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name: member.name,
        emailVerified: new Date(), // Mark as verified for easier testing
        memberId: member.id,
      },
    });

    console.log(`\n✅ Test user created successfully!`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   User ID: ${user.id}`);
    console.log(`   Member ID: ${member.id}\n`);

    console.log('📧 To sign in with email magic link:');
    console.log(`   1. Go to http://localhost:3000/auth/signin`);
    console.log(`   2. Select "Email" tab`);
    console.log(`   3. Enter email: ${email}`);
    console.log(`   4. Click "Send Magic Link"`);
    console.log(`   5. Check Docker logs for the magic link:`);
    console.log(`      docker-compose logs app --tail=50 | grep signin\n`);

    console.log('🔑 To set up other authentication methods:');
    console.log(`   1. Sign in with email magic link`);
    console.log(`   2. Go to http://localhost:3000/dashboard/settings/authentication`);
    console.log(`   3. Set up password, SMS, or biometric authentication\n`);

  } catch (error) {
    console.error('❌ Error creating user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

