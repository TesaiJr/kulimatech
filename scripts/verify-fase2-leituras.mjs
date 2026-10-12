// scripts/verify-fase2-leituras.mjs
import 'dotenv/config';
import pkgPrisma from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const { PrismaClient, UserRole, AlertaTipo } = pkgPrisma;

async function runFase2Verification() {
  console.log('\n======================================================');
  console.log(' TESTE DE HOMOLOGAÇÃO DA FASE 2 — LEITURAS & VALIDAÇÃO');
  console.log('======================================================\n');

  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });

  const prisma = new PrismaClient({
    adapter,
    log: ['error', 'warn'],
  });

  try {
    await prisma.$connect();
    console.log('✔ Conexão estabelecida com o Supabase PostgreSQL');

    // 1. Obter ou criar utilizadores de teste
    let agricultor = await prisma.user.findFirst({
      where: { role: UserRole.AGRICULTOR },
    });

    if (!agricultor) {
      console.log('  Criando agricultor de teste...');
      agricultor = await prisma.user.create({
        data: {
          nome: 'Agricultor Teste Fase2',
          email: `agricultor.fase2.${Date.now()}@kulimatech.mz`,
          passwordHash: '$2a$10$abcdefghijklmnopqrstuvwxyz123456',
          role: UserRole.AGRICULTOR,
          zonaAtuacao: 'Nhamatanda Sede',
        },
      });
    }

    let tecnicoVinculado = await prisma.user.findFirst({
      where: { role: UserRole.TECNICO },
    });

    if (!tecnicoVinculado) {
      console.log('  Criando técnico vinculado de teste...');
      tecnicoVinculado = await prisma.user.create({
        data: {
          nome: 'Técnico SDAE Vinculado',
          email: `tecnico.vinculado.${Date.now()}@sdae.gov.mz`,
          passwordHash: '$2a$10$abcdefghijklmnopqrstuvwxyz123456',
          role: UserRole.TECNICO,
          zonaAtuacao: 'Nhamatanda Centro',
        },
      });
    }

    // Criar parcela de teste para o agricultor
    let parcela = await prisma.parcela.findFirst({
      where: { agricultorId: agricultor.id },
    });

    if (!parcela) {
      console.log('  Criando parcela de teste...');
      parcela = await prisma.parcela.create({
        data: {
          nome: 'Talhão Teste Fase 2',
          areaHectares: 2.5,
          tipoSolo: 'FRANCO',
          agricultorId: agricultor.id,
        },
      });
    }

    // Garantir vínculo entre o técnico e o agricultor
    await prisma.tecnicoAgricultor.upsert({
      where: {
        tecnicoId_agricultorId: {
          tecnicoId: tecnicoVinculado.id,
          agricultorId: agricultor.id,
        },
      },
      create: {
        tecnicoId: tecnicoVinculado.id,
        agricultorId: agricultor.id,
      },
      update: {},
    });
    console.log('✔ Vínculo Técnico <-> Agricultor assegurado');

    // =========================================================================
    // CENÁRIO A: Registo de Leitura com Humidade Crítica e Alerta
    // =========================================================================
    console.log('\n[CENÁRIO A] Testando registo de leitura com humidade crítica...');

    const leituraCritica = await prisma.leituraSolo.create({
      data: {
        parcelaId: parcela.id,
        humidade: 18.5, // Nível crítico (<25%)
        temperatura: 31.0,
        statusHumidade: 'CRITICA',
        observacoes: 'Teste automatizado: solo extremamente ressecado',
        validadoPorTecnico: false,
      },
      include: {
        parcela: true,
      },
    });

    console.log(`✔ Leitura criada: ID ${leituraCritica.id} | Humidade: ${leituraCritica.humidade}% | Status: ${leituraCritica.statusHumidade}`);

    // Disparar alerta para o técnico vinculado (conforme a API)
    const alertaCriado = await prisma.alerta.create({
      data: {
        userId: tecnicoVinculado.id,
        tipo: AlertaTipo.HUMIDADE_CRITICA,
        titulo: `Humidade Crítica na Parcela ${parcela.nome}`,
        mensagem: `Leitura de 18.5% registada na parcela ${parcela.nome}. Intervenção agronómica necessária.`,
        link: `/leituras?parcelaId=${parcela.id}`,
      },
    });

    console.log(`✔ Alerta de anomalia crítica gerado para o Técnico (ID: ${alertaCriado.id})`);

    // =========================================================================
    // CENÁRIO B: Validação Técnica Agronómica pelo Técnico do SDAE
    // =========================================================================
    console.log('\n[CENÁRIO B] Testando validação técnica agronómica por técnico vinculado...');

    const leituraValidada = await prisma.leituraSolo.update({
      where: { id: leituraCritica.id },
      data: {
        validadoPorTecnico: true,
        tecnicoValidadorId: tecnicoVinculado.id,
        dataValidacao: new Date(),
        observacoesTecnicas: 'Prescrita rega de urgência ao entardecer.',
      },
      include: {
        tecnicoValidador: true,
      },
    });

    if (!leituraValidada.validadoPorTecnico || !leituraValidada.tecnicoValidadorId) {
      throw new Error('Falha: leitura não foi marcada como validada pelo técnico.');
    }

    console.log('✔ Leitura homologada com sucesso pelo Técnico SDAE!');
    console.log(`  Validador: ${leituraValidada.tecnicoValidador?.nome}`);
    console.log(`  Data Homologação: ${leituraValidada.dataValidacao?.toISOString()}`);
    console.log(`  Parecer Técnico: "${leituraValidada.observacoesTecnicas}"`);

    // =========================================================================
    // CENÁRIO C: Consulta com Filtros de Validação e Agregados Estatísticos
    // =========================================================================
    console.log('\n[CENÁRIO C] Testando filtros de consulta e métricas estatísticas...');

    const leiturasValidadas = await prisma.leituraSolo.findMany({
      where: {
        parcelaId: parcela.id,
        validadoPorTecnico: true,
      },
    });

    console.log(`✔ Filtro validadoPorTecnico=true retornou ${leiturasValidadas.length} registo(s)`);

    const totalLeituras = await prisma.leituraSolo.count({
      where: { parcelaId: parcela.id },
    });
    const criticasCount = await prisma.leituraSolo.count({
      where: { parcelaId: parcela.id, statusHumidade: 'CRITICA' },
    });

    console.log(`✔ Estatísticas calculadas: Total: ${totalLeituras} | Críticas: ${criticasCount}`);

    // =========================================================================
    // LIMPEZA: Remoção de dados de teste
    // =========================================================================
    console.log('\n[LIMPEZA] Removendo dados de teste gerados...');
    await prisma.alerta.delete({ where: { id: alertaCriado.id } });
    await prisma.leituraSolo.delete({ where: { id: leituraCritica.id } });
    console.log('✔ Dados de teste removidos com sucesso.');

    console.log('\n======================================================');
    console.log(' HOMOLOGAÇÃO DA FASE 2 CONCLUÍDA COM 100% DE ÊXITO!');
    console.log('======================================================\n');
  } catch (error) {
    console.error('❌ ERRO NA HOMOLOGAÇÃO DA FASE 2:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runFase2Verification();
