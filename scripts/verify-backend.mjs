// scripts/verify-backend.mjs
// Suite de Testes e Verificacao Automatizada da Camada de Backend (Engenharia Senior)
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pkgPrisma from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const { PrismaClient, UserRole } = pkgPrisma;

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
  log: ['error'],
});

const JWT_SECRET = process.env.JWT_SECRET || 'imunda_secure_jwt_token_secret_nhamatanda_2026';

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failedTests++;
  }
}

async function runVerification() {
  console.log('===========================================================');
  console.log(' SUITE DE TESTES E VERIFICACAO DO BACKEND - iMUNDA');
  console.log('===========================================================\n');

  try {
    // -------------------------------------------------------------
    // TESTE 1: Integridade Estrutural das Tabelas no Supabase
    // -------------------------------------------------------------
    console.log('--- TESTE 1: Verificacao Estrutural das Tabelas no Banco ---');
    const tables = await prisma.$queryRawUnsafe(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    const tableNames = tables.map(t => t.table_name.toLowerCase());
    assert(tableNames.includes('user'), 'Tabela "User" confirmada no Supabase');
    assert(tableNames.includes('parcela'), 'Tabela "Parcela" confirmada no Supabase');
    assert(tableNames.includes('leiturasolo'), 'Tabela "LeituraSolo" confirmada no Supabase');
    assert(tableNames.includes('cultura'), 'Tabela "Cultura" confirmada no Supabase');
    assert(tableNames.includes('recomendacao'), 'Tabela "Recomendacao" confirmada no Supabase');
    assert(tableNames.includes('praga'), 'Tabela "Praga" confirmada no Supabase');
    assert(tableNames.includes('ocorrenciapraga'), 'Tabela "OcorrenciaPraga" confirmada no Supabase');
    assert(tableNames.includes('mensagem'), 'Tabela "Mensagem" confirmada no Supabase');
    assert(tableNames.includes('alerta'), 'Tabela "Alerta" confirmada no Supabase');
    assert(tableNames.includes('tecnicoagricultor'), 'Tabela de associacao "TecnicoAgricultor" confirmada');

    // -------------------------------------------------------------
    // TESTE 2: Validacao dos Dados do Seed (Admin, Tecnico, Agricultor)
    // -------------------------------------------------------------
    console.log('\n--- TESTE 2: Validacao do Seed e Contas Iniciais ---');
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@imunda.mz' },
    });
    assert(adminUser !== null, 'Administrador padrao (admin@imunda.mz) cadastrado');
    assert(adminUser?.role === UserRole.ADMIN, 'Administrador possui perfil ADMIN correto');

    // Testar hash da senha do Admin
    const isAdminPasswordValid = await bcrypt.compare('Admin123', adminUser.passwordHash);
    assert(isAdminPasswordValid, 'Senha do Admin (Admin123) confere com o hash armazenado');

    const wrongPasswordValid = await bcrypt.compare('SenhaIncorreta', adminUser.passwordHash);
    assert(!wrongPasswordValid, 'Seguranca de senha: Senha incorreta foi devidamente rejeitada');

    const culturasCount = await prisma.cultura.count();
    assert(culturasCount >= 5, `Catalogo de culturas povoado com ${culturasCount} registros`);

    const pragasCount = await prisma.praga.count();
    assert(pragasCount >= 3, `Catalogo de pragas povoado com ${pragasCount} registros`);

    // -------------------------------------------------------------
    // TESTE 3: Assinatura e Validacao de Tokens JWT
    // -------------------------------------------------------------
    console.log('\n--- TESTE 3: Mecanismo de Autenticacao JWT ---');
    const mockPayload = {
      userId: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
      nome: adminUser.nome,
    };

    const token = jwt.sign(mockPayload, JWT_SECRET, { expiresIn: '1h' });
    assert(typeof token === 'string' && token.length > 20, 'Token JWT gerado com sucesso');

    const decoded = jwt.verify(token, JWT_SECRET);
    assert(decoded.userId === adminUser.id && decoded.role === 'ADMIN', 'Payload decodificado com integridade');

    let tokenInvalidRejected = false;
    try {
      jwt.verify(token + '_corrompido', JWT_SECRET);
    } catch {
      tokenInvalidRejected = true;
    }
    assert(tokenInvalidRejected, 'Token adulterado e rejeitado com seguranca');

    // -------------------------------------------------------------
    // TESTE 4: Teste Transacional de Integridade (Criacao & Delete)
    // -------------------------------------------------------------
    console.log('\n--- TESTE 4: Teste de Conflito de E-mail e Sanitizacao ---');
    const testEmail = `teste.agricultor.${Date.now()}@imunda.mz`;
    const tempPasswordHash = await bcrypt.hash('SenhaForte123', 10);

    // Criar temporario
    const tempUser = await prisma.user.create({
      data: {
        nome: 'Usuario de Teste Temporario',
        email: testEmail,
        passwordHash: tempPasswordHash,
        role: UserRole.AGRICULTOR,
      },
    });
    assert(tempUser.id !== undefined, 'Novo utilizador inserido com sucesso');

    // Tentar duplicar o mesmo e-mail (deve disparar erro P2002)
    let duplicateRejected = false;
    try {
      await prisma.user.create({
        data: {
          nome: 'Tentativa Duplicada',
          email: testEmail,
          passwordHash: tempPasswordHash,
          role: UserRole.AGRICULTOR,
        },
      });
    } catch (err) {
      if (err.code === 'P2002') {
        duplicateRejected = true;
      }
    }
    assert(duplicateRejected, 'Tentativa de e-mail duplicado bloqueada pelo banco (P2002 Unique Constraint)');

    // Limpeza (Teardown)
    await prisma.user.delete({ where: { id: tempUser.id } });
    const checkDeleted = await prisma.user.findUnique({ where: { id: tempUser.id } });
    assert(checkDeleted === null, 'Teardown concluido: usuario temporario removido sem deixar lixo no banco');

    // -------------------------------------------------------------
    // RESUMO FINAL
    // -------------------------------------------------------------
    console.log('\n===========================================================');
    console.log(` RESULTADO FINAL: ${passedTests} TESTES PASSARAM, ${failedTests} FALHARAM`);
    console.log('===========================================================');

    if (failedTests > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('\n✖ Erro fatal durante a verificacao:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runVerification();
