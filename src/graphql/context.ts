import { prisma } from '@/lib/prisma';
import type { NextRequest } from 'next/server';

export interface GraphQLContext {
  prisma: typeof prisma;
  user: {
    id: string;
    email: string;
    memberId: string;
  } | null;
}

export async function createContext(request: NextRequest): Promise<GraphQLContext> {
  // TODO: Integrate with NextAuth when auth is set up
  // For now, user is null - you can add authentication later
  // Example integration:
  // const session = await getServerSession(authOptions);
  // const user = session?.user ? { id: session.user.id, email: session.user.email, memberId: session.user.memberId } : null;
  
  return {
    prisma,
    user: null,
  };
}

