import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import type { NextRequest } from 'next/server';

/**
 * Get the current session on the server side
 * Use this in Server Components, API routes, and Server Actions
 * 
 * @param req Optional NextRequest for API routes
 */
export async function getSession(req?: NextRequest) {
  if (req) {
    // For API routes, we need to pass headers
    const session = await getServerSession(authOptions);
    return session;
  }
  return await getServerSession(authOptions);
}

/**
 * Get the current user from the session
 * Returns null if not authenticated
 * 
 * @param req Optional NextRequest for API routes
 */
export async function getCurrentUser(req?: NextRequest) {
  const session = await getSession(req);
  return session?.user ?? null;
}

