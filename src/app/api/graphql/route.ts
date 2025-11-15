import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { readFileSync } from 'fs';
import { join } from 'path';
import { resolvers } from '@/graphql/resolvers';
import { createContext } from '@/graphql/context';
import { makeExecutableSchema } from '@graphql-tools/schema';
import type { NextRequest } from 'next/server';

// Load the GraphQL schema from file
const typeDefs = readFileSync(
  join(process.cwd(), 'src/graphql/schema.graphql'),
  'utf-8'
);

// Create executable schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// Create Apollo Server instance
const server = new ApolloServer({
  schema,
  introspection: true, // Enable GraphQL Playground in development
});

// Create Next.js handler
const handler = startServerAndCreateNextHandler<NextRequest>(server, {
  context: async (req) => createContext(req),
});

export { handler as GET, handler as POST };

