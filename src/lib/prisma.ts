// Safe Prisma Client singleton with fallback for serverless & build environments

const globalForPrisma = globalThis as unknown as {
  prisma: any;
};

export const prisma: any = globalForPrisma.prisma ?? null;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
