import { hasuraQuery } from '@/lib/hasura-client';
import {
  IWebAuthnRepository,
  WebAuthnChallenge,
  Authenticator,
  CreateChallengeData,
  CreateAuthenticatorData,
} from '../interfaces/IWebAuthnRepository';

/**
 * Hasura Implementation of WebAuthn Repository
 * 
 * Handles biometric authentication challenges and registered devices via Hasura GraphQL.
 */
export class HasuraWebAuthnRepository implements IWebAuthnRepository {
  // ===== Challenge Operations =====

  async createChallenge(data: CreateChallengeData): Promise<WebAuthnChallenge> {
    const result = await hasuraQuery<{ insert_WebAuthnChallenge_one: WebAuthnChallenge }>(
      `mutation CreateWebAuthnChallenge($object: WebAuthnChallenge_insert_input!) {
        insert_WebAuthnChallenge_one(object: $object) {
          id userId challenge expiresAt type createdAt
        }
      }`,
      { object: data }
    );
    return result.insert_WebAuthnChallenge_one;
  }

  async findLatestChallenge(userId: string, type: string): Promise<WebAuthnChallenge | null> {
    const data = await hasuraQuery<{ WebAuthnChallenge: WebAuthnChallenge[] }>(
      `query GetLatestWebAuthnChallenge($userId: String!, $type: String!, $now: timestamptz!) {
        WebAuthnChallenge(
          where: { userId: { _eq: $userId }, type: { _eq: $type }, expiresAt: { _gt: $now } },
          order_by: { createdAt: desc },
          limit: 1
        ) {
          id userId challenge expiresAt type createdAt
        }
      }`,
      { userId, type, now: new Date().toISOString() }
    );
    return data.WebAuthnChallenge[0] || null;
  }

  async deleteChallenge(id: string): Promise<void> {
    await hasuraQuery(
      `mutation DeleteWebAuthnChallenge($id: String!) {
        delete_WebAuthnChallenge_by_pk(id: $id) { id }
      }`,
      { id }
    );
  }

  async deleteUserChallenges(userId: string, type: string): Promise<void> {
    await hasuraQuery(
      `mutation DeleteWebAuthnChallengesByUserAndType($userId: String!, $type: String!) {
        delete_WebAuthnChallenge(where: { userId: { _eq: $userId }, type: { _eq: $type } }) {
          affected_rows
        }
      }`,
      { userId, type }
    );
  }

  async deleteExpiredChallenges(): Promise<number> {
    const result = await hasuraQuery<{ delete_WebAuthnChallenge: { affected_rows: number } }>(
      `mutation DeleteExpiredWebAuthnChallenges($now: timestamptz!) {
        delete_WebAuthnChallenge(where: { expiresAt: { _lt: $now } }) {
          affected_rows
        }
      }`,
      { now: new Date().toISOString() }
    );
    return result.delete_WebAuthnChallenge.affected_rows;
  }

  // ===== Authenticator Operations =====

  async createAuthenticator(data: CreateAuthenticatorData): Promise<Authenticator> {
    const result = await hasuraQuery<{ insert_Authenticator_one: Authenticator }>(
      `mutation CreateAuthenticator($object: Authenticator_insert_input!) {
        insert_Authenticator_one(object: $object) {
          credentialID userId providerAccountId credentialPublicKey counter credentialDeviceType credentialBackedUp transports
        }
      }`,
      { object: data }
    );
    return result.insert_Authenticator_one;
  }

  async findAuthenticatorsByUserId(userId: string): Promise<Authenticator[]> {
    const data = await hasuraQuery<{ Authenticator: Authenticator[] }>(
      `query GetAuthenticatorsByUserId($userId: String!) {
        Authenticator(where: { userId: { _eq: $userId } }) {
          credentialID userId providerAccountId credentialPublicKey counter credentialDeviceType credentialBackedUp transports
        }
      }`,
      { userId }
    );
    return data.Authenticator;
  }

  async findAuthenticatorByCredentialId(
    userId: string,
    credentialId: string
  ): Promise<Authenticator | null> {
    const data = await hasuraQuery<{ Authenticator: Authenticator[] }>(
      `query GetAuthenticatorByCredentialId($userId: String!, $credentialID: String!) {
        Authenticator(where: { userId: { _eq: $userId }, credentialID: { _eq: $credentialID } }, limit: 1) {
          credentialID userId providerAccountId credentialPublicKey counter credentialDeviceType credentialBackedUp transports
        }
      }`,
      { userId, credentialID: credentialId }
    );
    return data.Authenticator[0] || null;
  }

  async updateAuthenticatorCounter(
    userId: string,
    credentialId: string,
    counter: number
  ): Promise<void> {
    await hasuraQuery(
      `mutation UpdateAuthenticatorCounter($userId: String!, $credentialID: String!, $counter: Int!) {
        update_Authenticator(
          where: { userId: { _eq: $userId }, credentialID: { _eq: $credentialID } },
          _set: { counter: $counter }
        ) { affected_rows }
      }`,
      { userId, credentialID: credentialId, counter }
    );
  }

  async deleteAuthenticator(userId: string, credentialId: string): Promise<void> {
    await hasuraQuery(
      `mutation DeleteAuthenticator($userId: String!, $credentialID: String!) {
        delete_Authenticator(where: { userId: { _eq: $userId }, credentialID: { _eq: $credentialID } }) {
          affected_rows
        }
      }`,
      { userId, credentialID: credentialId }
    );
  }

  async deleteUserAuthenticators(userId: string): Promise<void> {
    await hasuraQuery(
      `mutation DeleteAuthenticatorsByUserId($userId: String!) {
        delete_Authenticator(where: { userId: { _eq: $userId } }) {
          affected_rows
        }
      }`,
      { userId }
    );
  }
}

