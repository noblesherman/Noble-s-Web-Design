import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

// Fix: Use globalThis instead of global to avoid 'Cannot find name global' error
export const prisma = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  // Fix: Use globalThis instead of global
  globalThis.prisma = prisma;
}