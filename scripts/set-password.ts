// scripts/set-password.ts
// Set a password for a user
// Uses Hasura GraphQL mutations instead of Prisma

import 'dotenv/config';
import { hasuraQuery } from '../src/lib/hasura-client';
import bcrypt from 'bcryptjs';

interface User {
  id: string;
  email: string;
}

async function main() {
  const email = process.argv[2] || 'admin@lab.com';
  const password = process.argv[3] || 'Admin123!';

  console.log('🔐 Setting password for user...\n');

  try {
    // Find user
    const userData = await hasuraQuery<{ User: User[] }>(
      `query GetUserByEmail($email: String!) {
        User(where: { email: { _eq: $email } }, limit: 1) {
          id email
        }
      }`,
      { email }
    );

    const user = userData.User[0];

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      process.exit(1);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user
    await hasuraQuery(
      `mutation UpdateUserPassword($id: String!, $password: String!) {
        update_User_by_pk(pk_columns: { id: $id }, _set: { password: $password }) {
          id email
        }
      }`,
      { id: user.id, password: hashedPassword }
    );

    console.log(`✅ Password set successfully!`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}\n`);

    console.log('🔑 To sign in:');
    console.log('   1. Go to http://localhost:3000/auth/signin');
    console.log('   2. Click the "Password" tab');
    console.log(`   3. Enter email: ${email}`);
    console.log(`   4. Enter password: ${password}`);
    console.log('   5. Click "Sign In"\n');
  } catch (error) {
    console.error('❌ Error setting password:', error);
    process.exit(1);
  }
}

main();
