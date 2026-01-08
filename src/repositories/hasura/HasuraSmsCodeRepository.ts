import { hasuraQuery } from '@/lib/hasura-client';
import {
  ISmsCodeRepository,
  SmsCode,
  CreateSmsCodeData,
} from '../interfaces/ISmsCodeRepository';

/**
 * Hasura Implementation of SMS Code Repository
 * 
 * Handles temporary SMS verification codes for 2FA via Hasura GraphQL.
 */
export class HasuraSmsCodeRepository implements ISmsCodeRepository {
  // ===== Query Operations =====

  async findLatestByUserId(userId: string): Promise<SmsCode | null> {
    const data = await hasuraQuery<{ SmsVerificationCode: SmsCode[] }>(
      `query GetLatestSmsCode($userId: String!) {
        SmsVerificationCode(
          where: { userId: { _eq: $userId }, verified: { _eq: false } },
          order_by: { createdAt: desc },
          limit: 1
        ) {
          id userId code expiresAt verified createdAt
        }
      }`,
      { userId }
    );
    return data.SmsVerificationCode[0] || null;
  }

  async findById(id: string): Promise<SmsCode | null> {
    const data = await hasuraQuery<{ SmsVerificationCode_by_pk: SmsCode | null }>(
      `query GetSmsCodeById($id: String!) {
        SmsVerificationCode_by_pk(id: $id) {
          id userId code expiresAt verified createdAt
        }
      }`,
      { id }
    );
    return data.SmsVerificationCode_by_pk;
  }

  // ===== Mutation Operations =====

  async create(data: CreateSmsCodeData): Promise<SmsCode> {
    const result = await hasuraQuery<{ insert_SmsVerificationCode_one: SmsCode }>(
      `mutation CreateSmsCode($object: SmsVerificationCode_insert_input!) {
        insert_SmsVerificationCode_one(object: $object) {
          id userId code expiresAt verified createdAt
        }
      }`,
      { object: data }
    );
    return result.insert_SmsVerificationCode_one;
  }

  async markAsVerified(id: string): Promise<void> {
    await hasuraQuery(
      `mutation MarkSmsCodeAsVerified($id: String!) {
        update_SmsVerificationCode_by_pk(pk_columns: { id: $id }, _set: { verified: true }) {
          id
        }
      }`,
      { id }
    );
  }

  async deleteByUserId(userId: string): Promise<void> {
    await hasuraQuery(
      `mutation DeleteSmsCodesByUserId($userId: String!) {
        delete_SmsVerificationCode(where: { userId: { _eq: $userId } }) {
          affected_rows
        }
      }`,
      { userId }
    );
  }

  // ===== Cleanup Operations =====

  async deleteExpired(): Promise<number> {
    const result = await hasuraQuery<{ delete_SmsVerificationCode: { affected_rows: number } }>(
      `mutation DeleteExpiredSmsCodes($now: timestamptz!) {
        delete_SmsVerificationCode(where: { expiresAt: { _lt: $now } }) {
          affected_rows
        }
      }`,
      { now: new Date().toISOString() }
    );
    return result.delete_SmsVerificationCode.affected_rows;
  }

  async deleteVerifiedOlderThan(date: Date): Promise<number> {
    const result = await hasuraQuery<{ delete_SmsVerificationCode: { affected_rows: number } }>(
      `mutation DeleteOldVerifiedSmsCodes($date: timestamptz!) {
        delete_SmsVerificationCode(where: { verified: { _eq: true }, createdAt: { _lt: $date } }) {
          affected_rows
        }
      }`,
      { date: date.toISOString() }
    );
    return result.delete_SmsVerificationCode.affected_rows;
  }
}

