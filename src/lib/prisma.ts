// Safe Prisma Client singleton with fallback for serverless & build environments

let PrismaClientClass: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  PrismaClientClass = require('@prisma/client').PrismaClient;
} catch {
  // Fallback for environments where prisma generate hasn't executed yet
  PrismaClientClass = null;
}

const globalForPrisma = globalThis as unknown as {
  prisma: any;
};

export const prisma =
  globalForPrisma.prisma ??
  (PrismaClientClass
    ? new PrismaClientClass({
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      })
    : null);

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
