'use client';

import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

const httpLink = new HttpLink({
  uri: '/api/hasura/v1/graphql', // Point to Hasura via our Next.js proxy
  credentials: 'include', // Include cookies in requests
});

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
        extensions
      );
    });
  }
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

// Auth link to include any additional headers if needed
const authLink = setContext(async (_, { headers }) => {
  // The JWT token will be handled by the Next.js proxy route
  // which extracts it from the session and passes it to Hasura
  // We don't need to manually add it here since we're using cookie-based sessions
  
  return {
    headers: {
      ...headers,
    },
  };
});

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      // Configure type policies for better cache management
      Query: {
        fields: {
          // Add any query field policies here if needed
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-and-network',
    },
    query: {
      errorPolicy: 'all',
      fetchPolicy: 'network-only', // For now, always fetch from network to ensure fresh data
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

