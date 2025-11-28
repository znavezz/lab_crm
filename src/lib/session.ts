import { auth } from './auth';
import type { NextRequest } from 'next/server';

/**
 * Get the current session on the server side
 * Use this in Server Components, API routes, and Server Actions
 * 
 * Note: In NextAuth v5, the auth() function automatically handles request context
 * The req parameter is kept for backwards compatibility but is not used
 * 
 * @param req Optional NextRequest for API routes (not used in v5)
 */
export async function getSession(req?: NextRequest) {
  // In NextAuth v5, auth() automatically reads from the request context
  return await auth();
}

/**
 * Get the current user from the session
 * Returns null if not authenticated
 * 
 * @param req Optional NextRequest for API routes (not used in v5)
 */
export async function getCurrentUser(req?: NextRequest) {
  const session = await getSession(req);
  return session?.user ?? null;
}

