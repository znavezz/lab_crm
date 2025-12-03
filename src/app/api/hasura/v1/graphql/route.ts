import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

const HASURA_ENDPOINT = process.env.HASURA_ENDPOINT || 'http://graphql-engine:8080';
const HASURA_ADMIN_SECRET = process.env.HASURA_GRAPHQL_ADMIN_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    // Get the session to extract JWT token
    const session = await auth();
    
    // Read the GraphQL request body
    const body = await request.json();
    
    // Prepare headers for Hasura
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // If user is authenticated, get the JWT token from the session
    // The JWT token contains Hasura claims we set up in auth.ts
    if (session?.user) {
      // For authenticated requests, we need to pass the actual JWT token
      // Since we're using JWT strategy, we can get the token from the request
      const authHeader = request.headers.get('authorization');
      if (authHeader) {
        headers['Authorization'] = authHeader;
      } else {
        // If no auth header but session exists, use admin secret for server-side operations
        headers['x-hasura-admin-secret'] = HASURA_ADMIN_SECRET;
        headers['x-hasura-role'] = 'user';
        headers['x-hasura-user-id'] = session.user.id;
        if (session.user.memberId) {
          headers['x-hasura-member-id'] = session.user.memberId;
        }
      }
    } else {
      // For unauthenticated requests, use anonymous role
      headers['x-hasura-role'] = 'anonymous';
    }
    
    // Forward the request to Hasura
    const hasuraResponse = await fetch(`${HASURA_ENDPOINT}/v1/graphql`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    
    // Get the response from Hasura
    const data = await hasuraResponse.json();
    
    // Return the response to the client
    return NextResponse.json(data, {
      status: hasuraResponse.status,
    });
  } catch (error) {
    console.error('Hasura proxy error:', error);
    console.error('HASURA_ENDPOINT:', HASURA_ENDPOINT);
    console.error('HASURA_ADMIN_SECRET:', HASURA_ADMIN_SECRET ? '[SET]' : '[NOT SET]');
    return NextResponse.json(
      {
        errors: [
          {
            message: 'Internal server error',
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              details: error instanceof Error ? error.message : 'Unknown error',
            },
          },
        ],
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Handle GET requests (for GraphQL introspection queries)
  return POST(request);
}

