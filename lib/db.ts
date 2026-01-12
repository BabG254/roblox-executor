import { PrismaClient } from '@prisma/client'

// Get DATABASE_URL from environment, with fallback for Vercel Postgres
const getDatabaseUrl = () => {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL
  }
  if (process.env.POSTGRES_PRISMA_URL) {
    return process.env.POSTGRES_PRISMA_URL
  }
  if (process.env.POSTGRES_URL) {
    return process.env.POSTGRES_URL
  }
  throw new Error('DATABASE_URL environment variable is not set')
}

// PrismaClient singleton for serverless environments
// This prevents multiple instances in development with hot reload
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
