// scripts/create-test-user.ts
// Creates a test user for authentication
// Uses Hasura GraphQL mutations instead of Prisma

import 'dotenv/config';
import { hasuraQuery } from '../src/lib/hasura-client';

interface User {
  id: string;
  name: string;
  email: string;
  memberId?: string;
}

interface Member {
  id: string;
  name: string;
  role?: string;
  status?: string;
}

async function main() {
  const email = process.env.TEST_USER_EMAIL || 'admin@lab.com';
  const name = process.env.TEST_USER_NAME || 'Admin User';

  console.log('🔐 Creating test user for authentication...\n');

  try {
    // Check if user already exists
    const existingData = await hasuraQuery<{ User: User[] }>(
      `query GetUserByEmail($email: String!) {
        User(where: { email: { _eq: $email } }, limit: 1) {
          id name email memberId
        }
      }`,
      { email }
    );

    const existingUser = existingData.User[0];

    if (existingUser) {
      console.log(`✅ User already exists: ${email}`);
      console.log(`   User ID: ${existingUser.id}`);
      console.log(`   Name: ${existingUser.name}\n`);

      // Check if they have a member profile
      if (existingUser.memberId) {
        const memberData = await hasuraQuery<{ Member_by_pk: Member | null }>(
          `query GetMember($id: String!) {
            Member_by_pk(id: $id) { id name role status }
          }`,
          { id: existingUser.memberId }
        );

        if (memberData.Member_by_pk) {
          console.log(`✅ Linked to member: ${memberData.Member_by_pk.name}`);
          console.log(`   Role: ${memberData.Member_by_pk.role}`);
          console.log(`   Status: ${memberData.Member_by_pk.status}\n`);
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
    const memberSearchData = await hasuraQuery<{ Member: Member[] }>(
      `query GetMemberByName($name: String!) {
        Member(where: { name: { _ilike: $name } }, limit: 1) {
          id name role status
        }
      }`,
      { name: '%Cohen%' }
    );

    let member = memberSearchData.Member[0];

    if (!member) {
      // Create a simple admin member
      const createMemberData = await hasuraQuery<{ insert_Member_one: Member }>(
        `mutation CreateMember($object: Member_insert_input!) {
          insert_Member_one(object: $object) { id name role status }
        }`,
        {
          object: {
            name: name,
            rank: 'PROFESSOR',
            status: 'ACTIVE',
            role: 'PI',
            joinedDate: new Date().toISOString(),
          },
        }
      );
      member = createMemberData.insert_Member_one;
      console.log(`✅ Created member: ${member.name}`);
    } else {
      console.log(`✅ Found existing member: ${member.name}`);
    }

    // Create user
    const createUserData = await hasuraQuery<{ insert_User_one: User }>(
      `mutation CreateUser($object: User_insert_input!) {
        insert_User_one(object: $object) { id name email memberId }
      }`,
      {
        object: {
          email,
          name: member.name,
          emailVerified: new Date().toISOString(),
          memberId: member.id,
        },
      }
    );

    const user = createUserData.insert_User_one;

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
  }
}

main();
