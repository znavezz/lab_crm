/**
 * Repository Factory
 * 
 * Dependency Injection container for repositories.
 * Now uses Hasura GraphQL for all database operations.
 * 
 * SOLID Benefits:
 * - D (Dependency Inversion): API routes depend on abstract interfaces
 * - O (Open/Closed): Add new implementations without modifying existing code
 * - S (Single Responsibility): Factory's only job is creating repositories
 */

import { IUserRepository } from './interfaces/IUserRepository';
import { ISmsCodeRepository } from './interfaces/ISmsCodeRepository';
import { IWebAuthnRepository } from './interfaces/IWebAuthnRepository';

// Hasura implementations (default)
import { HasuraUserRepository } from './hasura/HasuraUserRepository';
import { HasuraSmsCodeRepository } from './hasura/HasuraSmsCodeRepository';
import { HasuraWebAuthnRepository } from './hasura/HasuraWebAuthnRepository';

// Singleton instances (created once, reused)
let userRepository: IUserRepository | null = null;
let smsCodeRepository: ISmsCodeRepository | null = null;
let webAuthnRepository: IWebAuthnRepository | null = null;

/**
 * Get User Repository instance
 * 
 * @returns IUserRepository implementation
 * 
 * @example
 * ```typescript
 * import { getUserRepository } from '@/repositories/factory';
 * 
 * const userRepo = getUserRepository();
 * const user = await userRepo.findById(id);
 * ```
 */
export function getUserRepository(): IUserRepository {
  if (!userRepository) {
    userRepository = new HasuraUserRepository();
  }
  return userRepository;
}

/**
 * Get SMS Code Repository instance
 * 
 * @returns ISmsCodeRepository implementation
 */
export function getSmsCodeRepository(): ISmsCodeRepository {
  if (!smsCodeRepository) {
    smsCodeRepository = new HasuraSmsCodeRepository();
  }
  return smsCodeRepository;
}

/**
 * Get WebAuthn Repository instance
 * 
 * @returns IWebAuthnRepository implementation
 */
export function getWebAuthnRepository(): IWebAuthnRepository {
  if (!webAuthnRepository) {
    webAuthnRepository = new HasuraWebAuthnRepository();
  }
  return webAuthnRepository;
}

/**
 * Get all repositories at once
 * Convenience function for routes that need multiple repositories
 * 
 * @example
 * ```typescript
 * const repos = getRepositories();
 * const user = await repos.user.findById(id);
 * const codes = await repos.smsCode.findLatestByUserId(id);
 * ```
 */
export function getRepositories() {
  return {
    user: getUserRepository(),
    smsCode: getSmsCodeRepository(),
    webauthn: getWebAuthnRepository(),
  };
}

/**
 * Reset all repository instances (useful for testing)
 */
export function resetRepositories(): void {
  userRepository = null;
  smsCodeRepository = null;
  webAuthnRepository = null;
}
