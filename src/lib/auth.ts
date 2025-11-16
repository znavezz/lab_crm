import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import EmailProvider from 'next-auth/providers/email';
import { prisma } from './prisma';
import type { Session } from 'next-auth';

// Extend the session user type to include id and memberId
type ExtendedSessionUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  id: string;
  memberId?: string | null;
};

type ExtendedSession = Omit<Session, 'user'> & {
  user: ExtendedSessionUser;
};

declare module 'next-auth' {
  interface Session {
    user: ExtendedSessionUser;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async session({ session, user }): Promise<ExtendedSession> {
      const extendedSession = session as ExtendedSession;
      if (extendedSession.user && user) {
        // Add user ID and memberId to session
        extendedSession.user.id = user.id;
        
        // Fetch the user with member relation to get memberId (may be null)
        const userRecord = await prisma.user.findUnique({
          where: { id: user.id },
          select: { memberId: true },
        });
        
        // memberId is optional - User can exist without being a lab Member
        if (userRecord) {
          extendedSession.user.memberId = userRecord.memberId;
        }
      }
      return extendedSession;
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async signIn({ user: _user, email: _email }) {
      // Allow all sign-in attempts
      // Users are created without Members - they can be linked later if needed
      return true;
    },
  },
  session: {
    strategy: 'database',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

