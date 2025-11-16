'use client';

import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { getSession } from 'next-auth/react';

const httpLink = new HttpLink({
  uri: '/api/graphql',
  credentials: 'include', // Include cookies in requests
});

// Auth link to include session token in requests
const authLink = setContext(async (_, { headers }) => {
  // Get the session token from NextAuth
  const session = await getSession();
  
  return {
    headers: {
      ...headers,
      // Include session cookie automatically via credentials
      // NextAuth handles session via cookies, so we don't need to manually add tokens
      // The session cookie will be sent automatically with the request
    },
  };
});

export const apolloClient = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});

