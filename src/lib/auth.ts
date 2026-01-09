import NextAuth, { type DefaultSession } from 'next-auth';
import { HasuraAdapter } from './auth/hasura-adapter';
import EmailProvider from 'next-auth/providers/email';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getUserRepository, getSmsCodeRepository } from '@/repositories/factory';
import { verifyPassword } from './auth/password-service';
import { verifySmsCode } from './auth/sms-service';

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      memberId: string | null;
      role: 'admin' | 'user';
    } & DefaultSession['user'];
  }

  interface User {
    memberId?: string | null;
    role?: 'admin' | 'user';
  }
}

// Extend JWT type to include custom fields
declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    memberId: string | null;
    role: 'admin' | 'user';
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: HasuraAdapter(),
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

        // Use repository instead of direct Prisma
        const userRepo = getUserRepository();
        const user = await userRepo.findByEmail(credentials.email);

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
          role: user.role || 'user',
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

        // Use repositories instead of direct Prisma
        const userRepo = getUserRepository();
        const smsRepo = getSmsCodeRepository();

        const user = await userRepo.findByPhone(credentials.phone);

        if (!user) {
          throw new Error('No user found with this phone number');
        }

        // Find the most recent unverified code for this user
        const smsCode = await smsRepo.findLatestByUserId(user.id);

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
        await smsRepo.markAsVerified(smsCode.id);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          memberId: user.memberId,
          role: user.role || 'user',
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
        token.role = user.role || 'user';
      }
      
      // Add Hasura-specific JWT claims
      // These claims are used by Hasura to determine user identity and roles
      const userRole = token.role || 'user';
      token['https://hasura.io/jwt/claims'] = {
        'x-hasura-allowed-roles': userRole === 'admin' ? ['admin', 'user', 'anonymous'] : ['user', 'anonymous'],
        'x-hasura-default-role': userRole,
        'x-hasura-user-id': token.id,
        'x-hasura-member-id': token.memberId || '',
      };
      
      return token;
    },
    async session({ session, token }) {
      // Add user info from JWT to session
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.memberId = token.memberId as string | null;
        session.user.role = (token.role as 'admin' | 'user') || 'user';
      }
      return session;
    },
  },
});
