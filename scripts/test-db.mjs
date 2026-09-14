import 'dotenv/config';
import pkgPrisma from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const { PrismaClient } = pkgPrisma;

async function testConnection() {
  console.log('\n--- Testando Conexão PostgreSQL (Supabase + Prisma 7) ---');
  console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? 'Configurada' : 'NÃO ENCONTRADA'}`);
  console.log(`DIRECT_URL:   ${process.env.DIRECT_URL ? 'Configurada' : 'NÃO ENCONTRADA'}`);

  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });

  const prisma = new PrismaClient({
    adapter,
    log: ['error', 'warn'],
  });

  try {
    console.log('\nConectando ao banco de dados no Supabase via PrismaPg adapter...');
    await prisma.$connect();
    console.log('✔ Conexão básica ($connect) realizada com sucesso!');

    console.log('\nExecutando query de validação no PostgreSQL...');
    const result = await prisma.$queryRawUnsafe(
      'SELECT 1 AS status, current_database() AS db_name, version() AS pg_version, NOW() AS server_time;'
    );
    console.log('✔ Resposta do Supabase PostgreSQL:');
    console.dir(result, { depth: null });

    console.log('\n======================================================');
    console.log(' CONEXÃO COM SUPABASE + PRISMA 100% OPERACIONAL!');
    console.log('======================================================\n');
  } catch (error) {
    console.error('\n✖ Falha na conexão com o banco de dados:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
