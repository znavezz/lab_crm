import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import type { NextRequest } from 'next/server';

export interface GraphQLContext {
  prisma: typeof prisma;
  user: {
    id: string;
    email: string;
    memberId: string | null;
  } | null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function createContext(request: NextRequest): Promise<GraphQLContext> {
  // Get the session from NextAuth
  // In App Router API routes, getServerSession works with cookies automatically
  // Note: request parameter is required by the API signature but not used since getServerSession
  // automatically reads cookies from the request context
  const session = await getServerSession(authOptions);
  
  // Extract user info from session
  let user: GraphQLContext['user'] = null;
  
  if (session?.user) {
    // Fetch the user with member relation to get memberId
    const userRecord = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { 
        id: true,
        email: true,
        memberId: true,
      },
    });
    
    if (userRecord) {
      user = {
        id: userRecord.id,
        email: userRecord.email,
        memberId: userRecord.memberId,
      };
    }
  }
  
  return {
    prisma,
    user,
  };
}

