import NextAuth, { type DefaultSession } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import EmailProvider from 'next-auth/providers/email';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import { verifyPassword } from './auth/password-service';
import { verifySmsCode } from './auth/sms-service';

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      memberId: string | null;
    } & DefaultSession['user'];
  }

  interface User {
    memberId?: string | null;
  }
}

// Extend JWT type to include custom fields
declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    memberId: string | null;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt', // Changed from 'database' to 'jwt' for Credentials providers
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  providers: [
    // Email Magic Link (existing functionality)
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT) || 587,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM || 'noreply@example.com',
    }),

    // Password Authentication
    CredentialsProvider({
      id: 'password',
      name: 'Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });

        if (!user || !user.password) {
          throw new Error('Invalid email or password');
        }

        const isValidPassword = await verifyPassword(
          credentials.password as string,
          user.password
        );

        if (!isValidPassword) {
          throw new Error('Invalid email or password');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          memberId: user.memberId,
        };
      },
    }),

    // SMS Authentication
    CredentialsProvider({
      id: 'sms',
      name: 'SMS',
      credentials: {
        phone: { label: 'Phone', type: 'tel' },
        code: { label: 'Code', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.code) {
          throw new Error('Phone number and verification code are required');
        }

        const user = await prisma.user.findFirst({
          where: { phone: credentials.phone },
        });

        if (!user) {
          throw new Error('No user found with this phone number');
        }

        // Find the most recent unverified code for this user
        const smsCode = await prisma.smsVerificationCode.findFirst({
          where: {
            userId: user.id,
            verified: false,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        if (!smsCode) {
          throw new Error('No verification code found');
        }

        const verification = verifySmsCode(
          smsCode.code,
          credentials.code as string,
          smsCode.expiresAt
        );

        if (!verification.isValid) {
          throw new Error(verification.error || 'Invalid verification code');
        }

        // Mark code as verified
        await prisma.smsVerificationCode.update({
          where: { id: smsCode.id },
          data: { verified: true },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          memberId: user.memberId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Add user info to JWT when they first sign in
      if (user) {
        token.id = user.id;
        token.memberId = user.memberId || null;
      }
      return token;
    },
    async session({ session, token }) {
      // Add user info from JWT to session
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.memberId = token.memberId as string | null;
      }
      return session;
    },
  },
});
