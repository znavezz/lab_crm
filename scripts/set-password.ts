// scripts/set-password.ts
// Set a password for a user

import 'dotenv/config';
import { PrismaClient } from '@/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2] || 'admin@lab.com';
  const password = process.argv[3] || 'Admin123!';

  console.log('🔐 Setting password for user...\n');

  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      process.exit(1);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

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
  } finally {
    await prisma.$disconnect();
  }
}

main();

