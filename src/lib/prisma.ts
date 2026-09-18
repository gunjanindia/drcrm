import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

function getPrismaClient(): PrismaClient | null {
  const connectionString = process.env.DATABASE_URL;
  if (connectionString) {
    try {
      const isNeonOrSsl =
        connectionString.includes('sslmode=') ||
        connectionString.includes('neon.tech') ||
        process.env.NODE_ENV === 'production';

      const pool = globalForPrisma.pool ?? new Pool({
        connectionString,
        max: process.env.NODE_ENV === 'production' ? 3 : 5,
        idleTimeoutMillis: 10000,
        connectionTimeoutMillis: 5000,
        ssl: isNeonOrSsl ? { rejectUnauthorized: false } : undefined,
      });

      // Prevent unhandled errors from crashing serverless worker
      pool.on('error', (err) => {
        console.warn('[PostgreSQL Pool Warning]', err?.message || err);
      });

      globalForPrisma.pool = pool;
      const adapter = new PrismaPg(pool);
      return new PrismaClient({ adapter });
    } catch (e) {
      console.warn('Failed to initialize PrismaPg adapter, falling back to default PrismaClient:', e);
    }
  }
  try {
    return new PrismaClient();
  } catch (e) {
    return null as any;
  }
}

export const prisma = (globalForPrisma.prisma ?? getPrismaClient()) as PrismaClient;

if (process.env.NODE_ENV !== 'production' && prisma) {
  globalForPrisma.prisma = prisma;
}
