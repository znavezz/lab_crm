import { PrismaClient } from '@/generated/prisma';
import { 
  IUserRepository, 
  User, 
  CreateUserData, 
  UpdateUserData 
} from '../interfaces/IUserRepository';

/**
 * Prisma Implementation of User Repository
 * 
 * Wraps Prisma calls for user data access.
 * Can be swapped with any other implementation (REST API, MySQL, etc.)
 */
export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  // ===== Query Operations =====

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ 
      where: { id } 
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { phone },
    });
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { email: email.toLowerCase().trim() },
    });
    return count > 0;
  }

  async existsByPhone(phone: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { phone },
    });
    return count > 0;
  }

  // ===== Mutation Operations =====

  async create(data: CreateUserData): Promise<User> {
    return this.prisma.user.create({
      data: {
        ...data,
        email: data.email.toLowerCase().trim(),
      },
    });
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }

  async updatePhone(id: string, phone: string, verified: boolean): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: {
        phone,
        phoneVerified: verified ? new Date() : null,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }
}

