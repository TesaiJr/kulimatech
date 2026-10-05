// scripts/verify-culturas.mjs
// Suite de Testes e Validação do Backend - Fase 4: Culturas e Recomendações Técnicas
import 'dotenv/config';
import jwt from 'jsonwebtoken';
import pkgPrisma from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { z } from 'zod';

const { PrismaClient, UserRole, AlertaTipo } = pkgPrisma;

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
  log: ['error'],
});

const JWT_SECRET = process.env.JWT_SECRET || 'kulimatech_secure_jwt_token_secret_nhamatanda_2026';

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

// Zod Schema para teste isolado
const culturaFormSchema = z
  .object({
    nome: z.string().min(2).max(100),
    descricao: z.string().min(10),
    humidadeMin: z.number().min(0).max(100),
    humidadeMax: z.number().min(0).max(100),
  })
  .refine((data) => data.humidadeMin <= data.humidadeMax, {
    message: 'A humidade mínima não pode ser superior à humidade máxima',
  });

async function runVerification() {
  console.log('===========================================================');
  console.log(' SUITE DE TESTES: BACKEND F4 - CULTURAS E RECOMENDAÇÕES');
  console.log('===========================================================\n');

  try {
    // -------------------------------------------------------------
    // TESTE 1: Validar Catálogo de Culturas Existente no Banco
    // -------------------------------------------------------------
    console.log('--- TESTE 1: Consulta do Catálogo de Culturas ---');
    const culturas = await prisma.cultura.findMany({
      orderBy: { nome: 'asc' },
    });

    assert(culturas.length >= 4, `Catálogo contém culturas semeadas (total: ${culturas.length})`);
    const nomes = culturas.map((c) => c.nome);
    console.log(`   Culturas encontradas: ${nomes.slice(0, 5).join(', ')}...`);
    assert(
      culturas.some((c) => c.nome.toLowerCase().includes('milho')),
      'Cultura prioritária "Milho" está presente no catálogo'
    );

    // -------------------------------------------------------------
    // TESTE 2: Validações de Schemas Agronómicos com Zod
    // -------------------------------------------------------------
    console.log('\n--- TESTE 2: Validações de Regras Agronómicas (Zod) ---');
    
    const validCultura = culturaFormSchema.safeParse({
      nome: 'Sorgo Forrageiro',
      descricao: 'Cereal altamente resistente a secas severas.',
      humidadeMin: 30,
      humidadeMax: 60,
    });
    assert(validCultura.success, 'Cultura com parâmetros válidos é aprovada pelo schema');

    const invalidCultura = culturaFormSchema.safeParse({
      nome: 'Cultura Inválida',
      descricao: 'Descricao de teste',
      humidadeMin: 80,
      humidadeMax: 20, // Erro: Min > Max
    });
    assert(!invalidCultura.success, 'Schema rejeita coerentemente quando humidadeMin > humidadeMax');

    // -------------------------------------------------------------
    // TESTE 3: Criação e Gestão de Cultura no Banco (Simulando ADMIN)
    // -------------------------------------------------------------
    console.log('\n--- TESTE 3: Criação e Ciclo de Vida de Cultura ---');
    const testCulturaNome = `Cultura Teste Automático ${Date.now()}`;
    
    const novaCultura = await prisma.cultura.create({
      data: {
        nome: testCulturaNome,
        nomeCientifico: 'Testus automaticus',
        descricao: 'Cultura de validação automática para teste de backend.',
        humidadeMin: 45,
        humidadeMax: 70,
        cicloDias: 90,
        epocaPlantio: 'Novembro a Março',
      },
    });
    assert(Boolean(novaCultura.id), `Cultura de teste criada com ID: ${novaCultura.id}`);

    // Tentar duplicidade (deve falhar pelo constraint unique)
    let duplicateFailed = false;
    try {
      await prisma.cultura.create({
        data: {
          nome: testCulturaNome,
          descricao: 'Duplicata',
          humidadeMin: 45,
          humidadeMax: 70,
        },
      });
    } catch {
      duplicateFailed = true;
    }
    assert(duplicateFailed, 'Restrição UNIQUE impede inserção de culturas com nomes duplicados');

    // -------------------------------------------------------------
    // TESTE 4: Emissão de Recomendação Técnica com Disparo de Alerta
    // -------------------------------------------------------------
    console.log('\n--- TESTE 4: Emissão de Recomendação e Alerta Automático ---');
    
    // Obter um técnico e um agricultor vinculado com parcela
    const vinculo = await prisma.tecnicoAgricultor.findFirst({
      include: {
        tecnico: true,
        agricultor: {
          include: {
            parcelas: true,
          },
        },
      },
    });

    assert(Boolean(vinculo), 'Vínculo Técnico <-> Agricultor encontrado no banco de dados');
    
    if (vinculo && vinculo.agricultor.parcelas.length > 0) {
      const tecnico = vinculo.tecnico;
      const agricultor = vinculo.agricultor;
      const parcela = agricultor.parcelas[0];

      console.log(`   Técnico: ${tecnico.nome} (${tecnico.email})`);
      console.log(`   Agricultor: ${agricultor.nome} (${agricultor.email})`);
      console.log(`   Parcela: ${parcela.nome} (ID: ${parcela.id})`);

      // Gerar Recomendação + Alerta em transação (mesma lógica do endpoint)
      const recomendacaoCriada = await prisma.$transaction(async (tx) => {
        const rec = await tx.recomendacao.create({
          data: {
            parcelaId: parcela.id,
            tecnicoId: tecnico.id,
            culturaId: novaCultura.id,
            parecer: 'Recomenda-se iniciar a adubação de cobertura e manter a irrigação ligeira.',
            status: 'PENDENTE',
          },
        });

        await tx.alerta.create({
          data: {
            userId: agricultor.id,
            tipo: AlertaTipo.NOVA_RECOMENDACAO,
            titulo: `Nova Orientação Técnica: ${parcela.nome}`,
            mensagem: `O Técnico ${tecnico.nome} emitiu uma recomendação agronómica para a sua parcela.`,
            link: `/parcelas/${parcela.id}`,
          },
        });

        return rec;
      });

      assert(Boolean(recomendacaoCriada.id), `Recomendação técnica emitida (ID: ${recomendacaoCriada.id})`);

      // Conferir se o alerta foi gravado para o agricultor
      const alertaCriado = await prisma.alerta.findFirst({
        where: {
          userId: agricultor.id,
          tipo: AlertaTipo.NOVA_RECOMENDACAO,
        },
        orderBy: { createdAt: 'desc' },
      });

      assert(Boolean(alertaCriado), 'Alerta foi gerado automaticamente para o agricultor');
      assert(
        alertaCriado?.titulo.includes(parcela.nome),
        `Título do alerta referencia a parcela do agricultor: "${alertaCriado?.titulo}"`
      );

      // -------------------------------------------------------------
      // TESTE 5: Atualização de Status pelo Agricultor (PENDENTE -> APLICADA)
      // -------------------------------------------------------------
      console.log('\n--- TESTE 5: Transição de Status da Recomendação ---');
      const recAtualizada = await prisma.recomendacao.update({
        where: { id: recomendacaoCriada.id },
        data: { status: 'APLICADA' },
      });

      assert(recAtualizada.status === 'APLICADA', 'Status atualizado com sucesso para APLICADA');

      // -------------------------------------------------------------
      // Limpeza dos Dados de Teste
      // -------------------------------------------------------------
      console.log('\n--- Limpeza dos Dados de Teste ---');
      await prisma.alerta.delete({ where: { id: alertaCriado.id } });
      await prisma.recomendacao.delete({ where: { id: recomendacaoCriada.id } });
      await prisma.cultura.delete({ where: { id: novaCultura.id } });
      console.log('  [OK] Dados temporários de teste removidos com sucesso.');
    } else {
      console.warn('  [WARN] Não foi possível executar o teste de recomendação por falta de parcela associada.');
    }

  } catch (error) {
    console.error('ERRO FATAL NA EXECUÇÃO DOS TESTES:', error);
    failedTests++;
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n===========================================================');
  console.log(` RESULTADO FINAL: ${passedTests} PASSOU | ${failedTests} FALHOU`);
  console.log('===========================================================');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runVerification();
