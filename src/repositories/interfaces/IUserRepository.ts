/**
 * User Repository Interface
 * 
 * Abstract contract for user data access operations.
 * Implementations can use Prisma, REST API, MySQL, etc.
 */

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: Date | null;
  image: string | null;
  phone: string | null;
  phoneVerified: Date | null;
  password: string | null;
  memberId: string | null;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  memberId?: string;
  role?: 'admin' | 'user';
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  phoneVerified?: Date | null;
  image?: string | null;
  role?: 'admin' | 'user';
}

/**
 * User Repository Interface
 * 
 * SOLID Benefits:
 * - D (Dependency Inversion): API routes depend on interface, not implementation
 * - O (Open/Closed): Can add new implementations without changing existing code
 * - L (Liskov Substitution): Any implementation can be swapped transparently
 */
export interface IUserRepository {
  // ===== Query Operations =====
  
  /**
   * Find user by ID
   */
  findById(id: string): Promise<User | null>;
  
  /**
   * Find user by email (case-insensitive)
   */
  findByEmail(email: string): Promise<User | null>;
  
  /**
   * Find user by phone number
   */
  findByPhone(phone: string): Promise<User | null>;
  
  /**
   * Check if user exists by email
   */
  existsByEmail(email: string): Promise<boolean>;
  
  /**
   * Check if user exists by phone
   */
  existsByPhone(phone: string): Promise<boolean>;
  
  // ===== Mutation Operations =====
  
  /**
   * Create a new user
   */
  create(data: CreateUserData): Promise<User>;
  
  /**
   * Update user fields
   */
  update(id: string, data: UpdateUserData): Promise<User>;
  
  /**
   * Update user's password (hashed)
   */
  updatePassword(id: string, hashedPassword: string): Promise<void>;
  
  /**
   * Update user's phone and verification status
   */
  updatePhone(id: string, phone: string, verified: boolean): Promise<void>;
  
  /**
   * Delete user (for GDPR compliance)
   */
  delete(id: string): Promise<void>;
}

