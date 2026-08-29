import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

export let prisma: PrismaClient | null = null;
export let isPostgresConnected = false;
export let dbConnectionError: string | null = null;

// Initialize Prisma
export async function initPrisma() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || dbUrl.trim() === '' || dbUrl.includes('localhost:5432/mydb')) {
    console.log('[Database] No PostgreSQL DATABASE_URL provided yet. Running in ready memory mode.');
    return null;
  }

  try {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: dbUrl.trim(),
        },
      },
    });

    await prisma.$connect();
    isPostgresConnected = true;
    dbConnectionError = null;
    console.log('[Database] Successfully connected to PostgreSQL via Prisma!');
    return prisma;
  } catch (err: any) {
    console.error('[Database] Failed to connect to PostgreSQL:', err?.message || err);
    dbConnectionError = err?.message || 'Connection failed';
    isPostgresConnected = false;
    prisma = null;
    return null;
  }
}
