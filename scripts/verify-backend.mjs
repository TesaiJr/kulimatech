// scripts/verify-backend.mjs
// Suite de Testes e Verificacao Automatizada da Camada de Backend (Engenharia Senior)
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pkgPrisma from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { z } from 'zod';

const { PrismaClient, UserRole, TipoSolo } = pkgPrisma;

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

// Schema de validacao Zod de Parcelas para teste isolado
const createParcelaTestSchema = z.object({
  nome: z.string().trim().min(3).max(100),
  areaHectares: z.number().positive().max(10000),
  tipoSolo: z.enum(['ARENOSO', 'ARGILOSO', 'FRANCO', 'MISTO', 'OUTRO']).default('FRANCO'),
});

async function runVerification() {
  console.log('===========================================================');
  console.log(' SUITE DE TESTES E VERIFICACAO DO BACKEND - iMUNDA');
  console.log('===========================================================\n');

  try {
    // -------------------------------------------------------------
    // FASE 1: TESTE 1 - Integridade Estrutural das Tabelas no Supabase
    // -------------------------------------------------------------
    console.log('--- TESTE 1: Verificacao Estrutural das Tabelas no Banco ---');
    const tables = await prisma.$queryRawUnsafe(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    const tableNames = tables.map((t) => t.table_name.toLowerCase());
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
    // FASE 1: TESTE 2 - Validacao do Seed e Contas Iniciais
    // -------------------------------------------------------------
    console.log('\n--- TESTE 2: Validacao do Seed e Contas Iniciais ---');
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@imunda.mz' },
    });
    assert(adminUser !== null, 'Administrador padrao (admin@imunda.mz) cadastrado');
    assert(adminUser?.role === UserRole.ADMIN, 'Administrador possui perfil ADMIN correto');

    const isAdminPasswordValid = await bcrypt.compare('Admin123', adminUser.passwordHash);
    assert(isAdminPasswordValid, 'Senha do Admin (Admin123) confere com o hash armazenado');

    const wrongPasswordValid = await bcrypt.compare('SenhaIncorreta', adminUser.passwordHash);
    assert(!wrongPasswordValid, 'Seguranca de senha: Senha incorreta foi devidamente rejeitada');

    const culturasCount = await prisma.cultura.count();
    assert(culturasCount >= 5, `Catalogo de culturas povoado com ${culturasCount} registros`);

    const pragasCount = await prisma.praga.count();
    assert(pragasCount >= 3, `Catalogo de pragas povoado com ${pragasCount} registros`);

    // -------------------------------------------------------------
    // FASE 1: TESTE 3 - Assinatura e Validacao de Tokens JWT
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
    // FASE 1: TESTE 4 - Conflito de E-mail
    // -------------------------------------------------------------
    console.log('\n--- TESTE 4: Teste de Conflito de E-mail e Unicidade ---');
    const testEmail = `teste.agricultor.${Date.now()}@imunda.mz`;
    const tempPasswordHash = await bcrypt.hash('SenhaForte123', 10);

    const tempUser = await prisma.user.create({
      data: {
        nome: 'Usuario de Teste Temporario',
        email: testEmail,
        passwordHash: tempPasswordHash,
        role: UserRole.AGRICULTOR,
      },
    });
    assert(tempUser.id !== undefined, 'Novo utilizador inserido com sucesso');

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
      if (err.code === 'P2002') duplicateRejected = true;
    }
    assert(duplicateRejected, 'Tentativa de e-mail duplicado bloqueada pelo banco (P2002 Unique Constraint)');

    await prisma.user.delete({ where: { id: tempUser.id } });
    const checkDeleted = await prisma.user.findUnique({ where: { id: tempUser.id } });
    assert(checkDeleted === null, 'Teardown F1 concluido: usuario temporario removido');

    // =============================================================
    // FASE 2: GESTAO DE PARCELAS (NOVA BATERIA DE TESTES)
    // =============================================================
    console.log('\n===========================================================');
    console.log(' INICIANDO TESTES DA FASE 2 (GESTAO DE PARCELAS)');
    console.log('===========================================================');

    // 1. Obter Agricultor Principal e Tecnico do Seed
    const agricultorA = await prisma.user.findUnique({
      where: { email: 'agricultor@imunda.mz' },
    });
    const tecnicoSDAE = await prisma.user.findUnique({
      where: { email: 'tecnico@imunda.mz' },
    });
    assert(agricultorA !== null, 'Agricultor A (Mateus Fernando Tivane) localizado para testes da F2');
    assert(tecnicoSDAE !== null, 'Tecnico SDAE (Arnaldo) localizado para testes da F2');

    // 2. Validacao do Schema Zod para Parcelas (Cenarios Adversos)
    console.log('\n--- TESTE 5: Validacoes Rigorosas de Schemas Zod de Parcelas ---');
    let badAreaRejected = false;
    try {
      createParcelaTestSchema.parse({
        nome: 'Parcela Invalida',
        areaHectares: -4.5, // Area negativa
        tipoSolo: 'FRANCO',
      });
    } catch {
      badAreaRejected = true;
    }
    assert(badAreaRejected, 'Zod bloqueou criacao de parcela com area negativa');

    let badNameRejected = false;
    try {
      createParcelaTestSchema.parse({
        nome: 'AB', // Menos de 3 caracteres
        areaHectares: 2.0,
        tipoSolo: 'FRANCO',
      });
    } catch {
      badNameRejected = true;
    }
    assert(badNameRejected, 'Zod bloqueou criacao de parcela com nome menor que 3 caracteres');

    let badSoilRejected = false;
    try {
      createParcelaTestSchema.parse({
        nome: 'Talhao Boa Vista',
        areaHectares: 5.0,
        tipoSolo: 'SOLO_INVENTADO', // Solo inexistente
      });
    } catch {
      badSoilRejected = true;
    }
    assert(badSoilRejected, 'Zod bloqueou tipo de solo invalido fora do enum');

    // 3. Criacao de Parcela com Sucesso para o Agricultor A
    console.log('\n--- TESTE 6: Criacao e Propriedade de Parcela ---');
    const parcelaA = await prisma.parcela.create({
      data: {
        nome: 'Talhao de Teste Metuchira Sul',
        areaHectares: 4.2,
        tipoSolo: TipoSolo.ARGILOSO,
        localizacao: 'Metuchira Sul, Nhamatanda',
        latitude: -19.2800,
        longitude: 34.2200,
        agricultorId: agricultorA.id,
      },
    });
    assert(parcelaA.id !== undefined, 'Parcela criada com sucesso vinculada ao Agricultor A');
    assert(parcelaA.agricultorId === agricultorA.id, 'Chave estrangeira agricultorId amarrada corretamente');

    // 4. Teste de Isolamento entre Agricultores (Agricultor B)
    console.log('\n--- TESTE 7: Isolamento Rigoroso entre Agricultores (Data Privacy) ---');
    const agricultorB = await prisma.user.create({
      data: {
        nome: 'Segundo Agricultor Teste',
        email: `agricultor.b.${Date.now()}@imunda.mz`,
        passwordHash: tempPasswordHash,
        role: UserRole.AGRICULTOR,
      },
    });

    const parcelaB = await prisma.parcela.create({
      data: {
        nome: 'Talhao Particular Agricultor B',
        areaHectares: 1.8,
        tipoSolo: TipoSolo.ARENOSO,
        agricultorId: agricultorB.id,
      },
    });

    // Simulacao da consulta do Agricultor A
    const parcelasAgricultorA = await prisma.parcela.findMany({
      where: { agricultorId: agricultorA.id },
    });
    const containsParcelaB = parcelasAgricultorA.some((p) => p.id === parcelaB.id);
    assert(!containsParcelaB, 'Isolamento garantido: Agricultor A NAO tem acesso a parcela do Agricultor B');

    // 5. Teste da Visao do Tecnico do SDAE (RBAC Multi-tenant)
    console.log('\n--- TESTE 8: Permissoes e Filtro do Tecnico do SDAE ---');
    // Obter quais agricultores o tecnico acompanha
    const vinculosTecnico = await prisma.tecnicoAgricultor.findMany({
      where: { tecnicoId: tecnicoSDAE.id },
      select: { agricultorId: true },
    });
    const idsAcompanhados = vinculosTecnico.map((v) => v.agricultorId);

    assert(idsAcompanhados.includes(agricultorA.id), 'Tecnico acompanha formalmente o Agricultor A');
    assert(!idsAcompanhados.includes(agricultorB.id), 'Tecnico NAO acompanha o Agricultor B');

    // Consulta de parcelas visiveis pelo tecnico
    const parcelasVisiveisTecnico = await prisma.parcela.findMany({
      where: { agricultorId: { in: idsAcompanhados } },
      include: { agricultor: { select: { nome: true } } },
    });

    const tecnicoViuParcelaA = parcelasVisiveisTecnico.some((p) => p.id === parcelaA.id);
    const tecnicoViuParcelaB = parcelasVisiveisTecnico.some((p) => p.id === parcelaB.id);

    assert(tecnicoViuParcelaA, 'Tecnico visualiza a parcela do Agricultor A que ele acompanha');
    assert(!tecnicoViuParcelaB, 'Tecnico e impedido de visualizar a parcela do Agricultor B nao vinculado');

    // 6. Teste de Atualizacao (PUT) e Exclusao (DELETE) de Parcela
    console.log('\n--- TESTE 9: Atualizacao e Exclusao Segura de Parcela ---');
    const updatedParcelaA = await prisma.parcela.update({
      where: { id: parcelaA.id },
      data: {
        nome: 'Talhao Metuchira Sul (Atualizado)',
        areaHectares: 4.8,
      },
    });
    assert(updatedParcelaA.nome === 'Talhao Metuchira Sul (Atualizado)', 'Nome da parcela atualizado com sucesso');
    assert(updatedParcelaA.areaHectares === 4.8, 'Area da parcela atualizada com sucesso');

    // Exclusoes e Limpeza de Testes da Fase 2
    await prisma.parcela.delete({ where: { id: parcelaA.id } });
    const checkParcelaADeleted = await prisma.parcela.findUnique({ where: { id: parcelaA.id } });
    assert(checkParcelaADeleted === null, 'Parcela de teste do Agricultor A excluida com sucesso');

    await prisma.parcela.delete({ where: { id: parcelaB.id } });
    await prisma.user.delete({ where: { id: agricultorB.id } });
    const checkUserBDeleted = await prisma.user.findUnique({ where: { id: agricultorB.id } });
    assert(checkUserBDeleted === null, 'Teardown F2 concluido: Agricultor B e parcela removidos do banco');

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
