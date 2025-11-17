import type { NextAuthOptions } from 'next-auth'
import EmailProvider from 'next-auth/providers/email'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './prisma'

export interface User {
  id: string
  email: string
  name: string
  role: 'PI' | 'POSTDOC' | 'PHD' | 'MASTER' | 'UNDERGRAD' | 'TECHNICIAN' | 'ADMIN'
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
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
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'database',
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        // Get the user with member relation
        const userRecord = await prisma.user.findUnique({
          where: { id: user.id },
          select: { memberId: true },
        })
        
        session.user.id = user.id
        if (userRecord?.memberId) {
          session.user.memberId = userRecord.memberId
        }
      }
      return session
    },
  },
}

export function setAuthToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth-token', token)
  }
}

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth-token')
  }
  return null
}

export function clearAuthToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth-token')
  }
}

export function isAuthenticated(): boolean {
  return getAuthToken() !== null
}
