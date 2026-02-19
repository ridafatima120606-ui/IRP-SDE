import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient | null };

let prisma: PrismaClient | null = null;
let usesMockDatabase = false;

try {
  prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
      log: ['warn', 'error'],
    });

  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
} catch (error) {
  console.warn('⚠️  PostgreSQL connection failed. Using mock database for development.');
  usesMockDatabase = true;
  globalForPrisma.prisma = null;
}

export const getDatabaseClient = () => {
  if (usesMockDatabase || !prisma) {
    return require('../utils/mockDatabase').mockDatabase;
  }
  return prisma;
};

export const isUsingMockDatabase = () => usesMockDatabase || !prisma;

export { prisma };
export default prisma;

