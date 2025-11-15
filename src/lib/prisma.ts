// lib/prisma.ts
import { PrismaClient } from '@/generated/prisma';

// This is a common pattern for Next.js with Prisma
// It prevents creating new connections on every hot reload in development

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ['query'], // Optional: log all queries to the console
  });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;