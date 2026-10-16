import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const POOL_VERSION = 2;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
  poolVersion: number | undefined;
};

const createPrismaClient = () => {
  // Se o pool em memória for de versão anterior (ex: com timeout de 5s), fechar e recriar
  if (globalForPrisma.pool && globalForPrisma.poolVersion !== POOL_VERSION) {
    try {
      globalForPrisma.pool.end().catch(() => {});
    } catch {}
    globalForPrisma.pool = undefined;
    globalForPrisma.prisma = undefined;
  }

  const pool =
    globalForPrisma.pool ??
    new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 20000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
    });

  globalForPrisma.poolVersion = POOL_VERSION;

  // Tratar erros silenciosos em conexões ociosas fechadas pelo pooler do Supabase (PgBouncer)
  pool.on('error', (err) => {
    console.warn('[Prisma PG Pool Warning]: Conexão reajustada pelo pooler:', err.message);
  });

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.pool = pool;
  }

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
