import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

function getPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (connectionString) {
    try {
      const pool = globalForPrisma.pool ?? new Pool({
        connectionString,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      });
      globalForPrisma.pool = pool;
      const adapter = new PrismaPg(pool);
      return new PrismaClient({ adapter });
    } catch (e) {
      console.error('Failed to initialize PrismaPg adapter, using default client:', e);
    }
  }
  return new PrismaClient();
}

export const prisma = globalForPrisma.prisma ?? getPrismaClient();

globalForPrisma.prisma = prisma;
