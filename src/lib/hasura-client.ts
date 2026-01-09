/**
 * Server-side Hasura GraphQL Client
 * 
 * Used for direct database operations from API routes with admin privileges.
 * This replaces Prisma for auth operations.
 */

const HASURA_ENDPOINT_BASE = process.env.HASURA_ENDPOINT || 'http://localhost:8080';
const HASURA_ENDPOINT = HASURA_ENDPOINT_BASE.endsWith('/v1/graphql') 
  ? HASURA_ENDPOINT_BASE 
  : `${HASURA_ENDPOINT_BASE}/v1/graphql`;
const HASURA_ADMIN_SECRET = process.env.HASURA_GRAPHQL_ADMIN_SECRET || '';

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
    extensions?: Record<string, unknown>;
  }>;
}

/**
 * Execute a GraphQL query/mutation against Hasura with admin privileges
 */
export async function hasuraQuery<T = unknown, V = Record<string, unknown>>(
  query: string,
  variables?: V
): Promise<T> {
  const response = await fetch(HASURA_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const result: GraphQLResponse<T> = await response.json();

  if (result.errors) {
    const errorMessage = result.errors.map(e => e.message).join(', ');
    throw new Error(`Hasura GraphQL Error: ${errorMessage}`);
  }

  if (!result.data) {
    throw new Error('No data returned from Hasura');
  }

  return result.data;
}

/**
 * Helper to check if Hasura is available
 */
export async function checkHasuraConnection(): Promise<boolean> {
  try {
    await hasuraQuery<{ __typename: string }>(`query { __typename }`);
    return true;
  } catch {
    return false;
  }
}

