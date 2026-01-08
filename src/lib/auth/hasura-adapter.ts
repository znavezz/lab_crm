/**
 * Custom NextAuth Hasura Adapter
 * 
 * Implements the NextAuth Adapter interface using Hasura GraphQL.
 * Replaces PrismaAdapter for database operations.
 */

import type { Adapter, AdapterAccount, AdapterSession, AdapterUser, VerificationToken } from 'next-auth/adapters';
import { hasuraQuery } from '../hasura-client';

// User type from Hasura
interface HasuraUser {
  id: string;
  name: string;
  email: string;
  emailVerified: string | null;
  image: string | null;
  memberId: string | null;
}

// Convert Hasura user to AdapterUser
function toAdapterUser(user: HasuraUser): AdapterUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
    image: user.image,
  };
}

export function HasuraAdapter(): Adapter {
  return {
    // ==================== USER ====================
    
    async createUser(data) {
      const result = await hasuraQuery<{ insert_User_one: HasuraUser }>(
        `mutation CreateUser($object: User_insert_input!) {
          insert_User_one(object: $object) {
            id name email emailVerified image memberId
          }
        }`,
        {
          object: {
            name: data.name || data.email?.split('@')[0] || 'User',
            email: data.email,
            emailVerified: data.emailVerified?.toISOString() || null,
            image: data.image || null,
          },
        }
      );
      return toAdapterUser(result.insert_User_one);
    },

    async getUser(id) {
      const data = await hasuraQuery<{ User: HasuraUser | null }>(
        `query GetUserById($id: String!) {
          User(id: $id) {
            id name email emailVerified image memberId
          }
        }`,
        { id }
      );
      return data.User ? toAdapterUser(data.User) : null;
    },

    async getUserByEmail(email) {
      const data = await hasuraQuery<{ User: HasuraUser[] }>(
        `query GetUserByEmail($email: String!) {
          User(where: { email: { _eq: $email } }, limit: 1) {
            id name email emailVerified image memberId
          }
        }`,
        { email: email.toLowerCase() }
      );
      return data.User[0] ? toAdapterUser(data.User[0]) : null;
    },

    async getUserByAccount({ providerAccountId, provider }) {
      const data = await hasuraQuery<{ Account: Array<{ user: HasuraUser }> }>(
        `query GetUserByAccount($provider: String!, $providerAccountId: String!) {
          Account(where: { provider: { _eq: $provider }, providerAccountId: { _eq: $providerAccountId } }, limit: 1) {
            user {
              id name email emailVerified image memberId
            }
          }
        }`,
        { provider, providerAccountId }
      );
      return data.Account[0]?.user ? toAdapterUser(data.Account[0].user) : null;
    },

    async updateUser(data) {
      const result = await hasuraQuery<{ update_User_by_pk: HasuraUser }>(
        `mutation UpdateUser($id: String!, $set: User_set_input!) {
          update_User_by_pk(pk_columns: { id: $id }, _set: $set) {
            id name email emailVerified image memberId
          }
        }`,
        {
          id: data.id,
          set: {
            name: data.name,
            email: data.email,
            emailVerified: data.emailVerified?.toISOString(),
            image: data.image,
          },
        }
      );
      return toAdapterUser(result.update_User_by_pk);
    },

    async deleteUser(userId) {
      await hasuraQuery(
        `mutation DeleteUser($id: String!) {
          delete_User_by_pk(id: $id) { id }
        }`,
        { id: userId }
      );
    },

    // ==================== ACCOUNT ====================

    async linkAccount(data) {
      await hasuraQuery(
        `mutation CreateAccount($object: Account_insert_input!) {
          insert_Account_one(object: $object) { id }
        }`,
        {
          object: {
            userId: data.userId,
            type: data.type,
            provider: data.provider,
            providerAccountId: data.providerAccountId,
            refreshToken: data.refresh_token,
            accessToken: data.access_token,
            expiresAt: data.expires_at,
            tokenType: data.token_type,
            scope: data.scope,
            idToken: data.id_token,
            sessionState: data.session_state,
          },
        }
      );
      return data as AdapterAccount;
    },

    async unlinkAccount({ providerAccountId, provider }) {
      await hasuraQuery(
        `mutation DeleteAccountByProvider($provider: String!, $providerAccountId: String!) {
          delete_Account(where: { provider: { _eq: $provider }, providerAccountId: { _eq: $providerAccountId } }) {
            affected_rows
          }
        }`,
        { provider, providerAccountId }
      );
    },

    // ==================== SESSION ====================

    async createSession(data) {
      const result = await hasuraQuery<{ insert_Session_one: { id: string; sessionToken: string; userId: string; expires: string } }>(
        `mutation CreateSession($object: Session_insert_input!) {
          insert_Session_one(object: $object) {
            id sessionToken userId expires
          }
        }`,
        {
          object: {
            sessionToken: data.sessionToken,
            userId: data.userId,
            expires: data.expires.toISOString(),
          },
        }
      );
      return {
        id: result.insert_Session_one.id,
        sessionToken: result.insert_Session_one.sessionToken,
        userId: result.insert_Session_one.userId,
        expires: new Date(result.insert_Session_one.expires),
      };
    },

    async getSessionAndUser(sessionToken) {
      const data = await hasuraQuery<{
        Session: Array<{
          id: string;
          sessionToken: string;
          userId: string;
          expires: string;
          User: HasuraUser;
        }>;
      }>(
        `query GetSessionByToken($sessionToken: String!) {
          Session(where: { sessionToken: { _eq: $sessionToken } }, limit: 1) {
            id sessionToken userId expires
            User {
              id name email emailVerified image memberId
            }
          }
        }`,
        { sessionToken }
      );

      if (!data.Session[0]) return null;

      const session = data.Session[0];
      return {
        session: {
          id: session.id,
          sessionToken: session.sessionToken,
          userId: session.userId,
          expires: new Date(session.expires),
        } as AdapterSession,
        user: toAdapterUser(session.User),
      };
    },

    async updateSession(data) {
      const result = await hasuraQuery<{
        update_Session: {
          returning: Array<{ id: string; sessionToken: string; userId: string; expires: string }>;
        };
      }>(
        `mutation UpdateSession($sessionToken: String!, $set: Session_set_input!) {
          update_Session(where: { sessionToken: { _eq: $sessionToken } }, _set: $set) {
            returning { id sessionToken userId expires }
          }
        }`,
        {
          sessionToken: data.sessionToken,
          set: {
            expires: data.expires?.toISOString(),
          },
        }
      );

      const updated = result.update_Session.returning[0];
      if (!updated) return null;

      return {
        id: updated.id,
        sessionToken: updated.sessionToken,
        userId: updated.userId,
        expires: new Date(updated.expires),
      };
    },

    async deleteSession(sessionToken) {
      await hasuraQuery(
        `mutation DeleteSessionByToken($sessionToken: String!) {
          delete_Session(where: { sessionToken: { _eq: $sessionToken } }) {
            affected_rows
          }
        }`,
        { sessionToken }
      );
    },

    // ==================== VERIFICATION TOKEN ====================

    async createVerificationToken(data) {
      const result = await hasuraQuery<{
        insert_VerificationToken_one: { identifier: string; token: string; expires: string };
      }>(
        `mutation CreateVerificationToken($object: VerificationToken_insert_input!) {
          insert_VerificationToken_one(object: $object) {
            identifier token expires
          }
        }`,
        {
          object: {
            identifier: data.identifier,
            token: data.token,
            expires: data.expires.toISOString(),
          },
        }
      );

      return {
        identifier: result.insert_VerificationToken_one.identifier,
        token: result.insert_VerificationToken_one.token,
        expires: new Date(result.insert_VerificationToken_one.expires),
      };
    },

    async useVerificationToken({ identifier, token }) {
      // First get the token
      const getData = await hasuraQuery<{
        VerificationToken: Array<{ id: string; identifier: string; token: string; expires: string }>;
      }>(
        `query GetVerificationToken($identifier: String!, $token: String!) {
          VerificationToken(where: { identifier: { _eq: $identifier }, token: { _eq: $token } }, limit: 1) {
            id identifier token expires
          }
        }`,
        { identifier, token }
      );

      if (!getData.VerificationToken[0]) return null;

      const verificationToken = getData.VerificationToken[0];

      // Delete the token
      await hasuraQuery(
        `mutation DeleteVerificationToken($identifier: String!, $token: String!) {
          delete_VerificationToken(where: { identifier: { _eq: $identifier }, token: { _eq: $token } }) {
            affected_rows
          }
        }`,
        { identifier, token }
      );

      return {
        identifier: verificationToken.identifier,
        token: verificationToken.token,
        expires: new Date(verificationToken.expires),
      } as VerificationToken;
    },
  };
}

