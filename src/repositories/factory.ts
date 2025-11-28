/**
 * Repository Factory
 * 
 * Dependency Injection container for repositories.
 * Returns the correct repository implementation based on environment configuration.
 * 
 * SOLID Benefits:
 * - D (Dependency Inversion): API routes depend on abstract interfaces
 * - O (Open/Closed): Add new implementations without modifying existing code
 * - S (Single Responsibility): Factory's only job is creating repositories
 */

import { prisma } from '@/lib/prisma';
import { IUserRepository } from './interfaces/IUserRepository';
import { ISmsCodeRepository } from './interfaces/ISmsCodeRepository';
import { IWebAuthnRepository } from './interfaces/IWebAuthnRepository';

// Prisma implementations (current/default)
import { PrismaUserRepository } from './prisma/PrismaUserRepository';
import { PrismaSmsCodeRepository } from './prisma/PrismaSmsCodeRepository';
import { PrismaWebAuthnRepository } from './prisma/PrismaWebAuthnRepository';

// Future implementations (add when deploying to lab server)
// import { LabApiUserRepository } from './lab/LabApiUserRepository';
// import { LabApiSmsCodeRepository } from './lab/LabApiSmsCodeRepository';
// import { LabApiWebAuthnRepository } from './lab/LabApiWebAuthnRepository';

/**
 * Repository configuration type
 * Determines which implementation to use
 */
type DatabaseType = 'prisma' | 'lab-api' | 'mysql' | 'custom';

/**
 * Get the configured database type from environment
 */
function getDatabaseType(): DatabaseType {
  const dbType = process.env.DATABASE_TYPE || 'prisma';
  return dbType as DatabaseType;
}

/**
 * Get User Repository instance
 * 
 * @returns IUserRepository implementation based on DATABASE_TYPE env var
 * 
 * @example
 * ```typescript
 * // In API route
 * import { getUserRepository } from '@/repositories/factory';
 * 
 * const userRepo = getUserRepository();
 * const user = await userRepo.findById(id);
 * ```
 */
export function getUserRepository(): IUserRepository {
  const dbType = getDatabaseType();

  switch (dbType) {
    case 'prisma':
      return new PrismaUserRepository(prisma);

    // Add when deploying to lab server:
    // case 'lab-api':
    //   return new LabApiUserRepository(
    //     process.env.LAB_API_URL!,
    //     process.env.LAB_API_KEY!
    //   );

    // case 'mysql':
    //   return new MySQLUserRepository(mysqlConnection);

    default:
      // Fallback to Prisma
      console.warn(`Unknown DATABASE_TYPE: ${dbType}, falling back to Prisma`);
      return new PrismaUserRepository(prisma);
  }
}

/**
 * Get SMS Code Repository instance
 * 
 * @returns ISmsCodeRepository implementation based on DATABASE_TYPE env var
 */
export function getSmsCodeRepository(): ISmsCodeRepository {
  const dbType = getDatabaseType();

  switch (dbType) {
    case 'prisma':
      return new PrismaSmsCodeRepository(prisma);

    // Add when deploying to lab server:
    // case 'lab-api':
    //   return new LabApiSmsCodeRepository(
    //     process.env.LAB_API_URL!,
    //     process.env.LAB_API_KEY!
    //   );

    default:
      console.warn(`Unknown DATABASE_TYPE: ${dbType}, falling back to Prisma`);
      return new PrismaSmsCodeRepository(prisma);
  }
}

/**
 * Get WebAuthn Repository instance
 * 
 * @returns IWebAuthnRepository implementation based on DATABASE_TYPE env var
 */
export function getWebAuthnRepository(): IWebAuthnRepository {
  const dbType = getDatabaseType();

  switch (dbType) {
    case 'prisma':
      return new PrismaWebAuthnRepository(prisma);

    // Add when deploying to lab server:
    // case 'lab-api':
    //   return new LabApiWebAuthnRepository(
    //     process.env.LAB_API_URL!,
    //     process.env.LAB_API_KEY!
    //   );

    default:
      console.warn(`Unknown DATABASE_TYPE: ${dbType}, falling back to Prisma`);
      return new PrismaWebAuthnRepository(prisma);
  }
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
 * Check if using Prisma (for backwards compatibility checks)
 */
export function isPrismaDatabase(): boolean {
  return getDatabaseType() === 'prisma';
}

/**
 * Example: How to add a new database implementation
 * 
 * 1. Create new repository files:
 *    - src/repositories/lab/LabApiUserRepository.ts
 *    - src/repositories/lab/LabApiSmsCodeRepository.ts
 *    - src/repositories/lab/LabApiWebAuthnRepository.ts
 * 
 * 2. Implement the interfaces:
 *    ```typescript
 *    export class LabApiUserRepository implements IUserRepository {
 *      constructor(private apiUrl: string, private apiKey: string) {}
 *      
 *      async findById(id: string): Promise<User | null> {
 *        const response = await fetch(`${this.apiUrl}/users/${id}`, {
 *          headers: { 'X-API-Key': this.apiKey }
 *        });
 *        return response.json();
 *      }
 *      
 *      // ... implement all other methods
 *    }
 *    ```
 * 
 * 3. Uncomment the import statements at the top
 * 
 * 4. Uncomment the case statements in each factory function
 * 
 * 5. Set environment variables:
 *    ```bash
 *    DATABASE_TYPE=lab-api
 *    LAB_API_URL=https://lab-server.edu/api
 *    LAB_API_KEY=your-api-key
 *    ```
 * 
 * 6. Done! Zero changes to API routes needed! ✅
 */

