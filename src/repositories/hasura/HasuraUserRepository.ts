import { hasuraQuery } from '@/lib/hasura-client';
import {
  IUserRepository,
  User,
  CreateUserData,
  UpdateUserData,
} from '../interfaces/IUserRepository';

/**
 * Hasura Implementation of User Repository
 * 
 * Uses GraphQL mutations/queries to Hasura for user data access.
 * Replaces PrismaUserRepository.
 */
export class HasuraUserRepository implements IUserRepository {
  // ===== Query Operations =====

  async findById(id: string): Promise<User | null> {
    const data = await hasuraQuery<{ User: User | null }>(
      `query GetUserById($id: String!) {
        User(id: $id) {
          id name email emailVerified image phone phoneVerified password memberId role createdAt updatedAt
        }
      }`,
      { id }
    );
    return data.User;
  }

  async findByEmail(email: string): Promise<User | null> {
    const normalizedEmail = email.toLowerCase().trim();
    const data = await hasuraQuery<{ User: User[] }>(
      `query GetUserByEmail($email: String!) {
        User(where: { email: { _eq: $email } }, limit: 1) {
          id name email emailVerified image phone phoneVerified password memberId role createdAt updatedAt
        }
      }`,
      { email: normalizedEmail }
    );
    return data.User[0] || null;
  }

  async findByPhone(phone: string): Promise<User | null> {
    const data = await hasuraQuery<{ User: User[] }>(
      `query GetUserByPhone($phone: String!) {
        User(where: { phone: { _eq: $phone } }, limit: 1) {
          id name email emailVerified image phone phoneVerified password memberId role createdAt updatedAt
        }
      }`,
      { phone }
    );
    return data.User[0] || null;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const normalizedEmail = email.toLowerCase().trim();
    const data = await hasuraQuery<{ User_aggregate: { aggregate: { count: number } } }>(
      `query CountUsersByEmail($email: String!) {
        User_aggregate(where: { email: { _eq: $email } }) {
          aggregate { count }
        }
      }`,
      { email: normalizedEmail }
    );
    return data.User_aggregate.aggregate.count > 0;
  }

  async existsByPhone(phone: string): Promise<boolean> {
    const data = await hasuraQuery<{ User_aggregate: { aggregate: { count: number } } }>(
      `query CountUsersByPhone($phone: String!) {
        User_aggregate(where: { phone: { _eq: $phone } }) {
          aggregate { count }
        }
      }`,
      { phone }
    );
    return data.User_aggregate.aggregate.count > 0;
  }

  // ===== Mutation Operations =====

  async create(data: CreateUserData): Promise<User> {
    const result = await hasuraQuery<{ insert_User_one: User }>(
      `mutation CreateUser($object: User_insert_input!) {
        insert_User_one(object: $object) {
          id name email emailVerified image phone phoneVerified password memberId role createdAt updatedAt
        }
      }`,
      {
        object: {
          ...data,
          email: data.email.toLowerCase().trim(),
        },
      }
    );
    return result.insert_User_one;
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    const result = await hasuraQuery<{ update_User_by_pk: User }>(
      `mutation UpdateUser($id: String!, $set: User_set_input!) {
        update_User_by_pk(pk_columns: { id: $id }, _set: $set) {
          id name email emailVerified image phone phoneVerified password memberId role createdAt updatedAt
        }
      }`,
      { id, set: data }
    );
    return result.update_User_by_pk;
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    await hasuraQuery(
      `mutation UpdateUser($id: String!, $set: User_set_input!) {
        update_User_by_pk(pk_columns: { id: $id }, _set: $set) { id }
      }`,
      { id, set: { password: hashedPassword } }
    );
  }

  async updatePhone(id: string, phone: string, verified: boolean): Promise<void> {
    await hasuraQuery(
      `mutation UpdateUser($id: String!, $set: User_set_input!) {
        update_User_by_pk(pk_columns: { id: $id }, _set: $set) { id }
      }`,
      {
        id,
        set: {
          phone,
          phoneVerified: verified ? new Date().toISOString() : null,
        },
      }
    );
  }

  async delete(id: string): Promise<void> {
    await hasuraQuery(
      `mutation DeleteUser($id: String!) {
        delete_User_by_pk(id: $id) { id }
      }`,
      { id }
    );
  }
}

