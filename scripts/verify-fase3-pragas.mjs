// scripts/verify-fase3-pragas.mjs
import 'dotenv/config';
import pkgPrisma from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const { PrismaClient, UserRole, AlertaTipo, StatusOcorrencia, SeveridadePraga } = pkgPrisma;

async function runFase3Verification() {
  console.log('\n======================================================');
  console.log(' TESTE DE HOMOLOGAÇÃO DA FASE 3 — PRAGAS & OCORRÊNCIAS');
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

    // 1. Obter ou criar Cultura de teste
    let cultura = await prisma.cultura.findFirst({
      where: { nome: { contains: 'Milho' } },
    });

    if (!cultura) {
      console.log('  Criando cultura de teste...');
      cultura = await prisma.cultura.create({
        data: {
          nome: `Milho Teste ${Date.now()}`,
          descricao: 'Cultura de teste para validação de pragas',
          humidadeMin: 40,
          humidadeMax: 70,
        },
      });
    }

    // 2. Obter ou criar Agricultor e Parcela
    let agricultor = await prisma.user.findFirst({
      where: { role: UserRole.AGRICULTOR },
    });

    if (!agricultor) {
      agricultor = await prisma.user.create({
        data: {
          nome: 'Agricultor Teste Fase3',
          email: `agricultor.fase3.${Date.now()}@kulimatech.mz`,
          passwordHash: '$2a$10$abcdefghijklmnopqrstuvwxyz123456',
          role: UserRole.AGRICULTOR,
          zonaAtuacao: 'Nhamatanda',
        },
      });
    }

    let parcela = await prisma.parcela.findFirst({
      where: { agricultorId: agricultor.id },
    });

    if (!parcela) {
      parcela = await prisma.parcela.create({
        data: {
          nome: 'Talhão 03 - Milho',
          areaHectares: 3.0,
          tipoSolo: 'FRANCO',
          agricultorId: agricultor.id,
        },
      });
    }

    // 3. Obter ou criar Técnico vinculado
    let tecnico = await prisma.user.findFirst({
      where: { role: UserRole.TECNICO },
    });

    if (!tecnico) {
      tecnico = await prisma.user.create({
        data: {
          nome: 'Extensionista SDAE Fase3',
          email: `tecnico.fase3.${Date.now()}@sdae.gov.mz`,
          passwordHash: '$2a$10$abcdefghijklmnopqrstuvwxyz123456',
          role: UserRole.TECNICO,
          zonaAtuacao: 'Nhamatanda',
        },
      });
    }

    await prisma.tecnicoAgricultor.upsert({
      where: {
        tecnicoId_agricultorId: {
          tecnicoId: tecnico.id,
          agricultorId: agricultor.id,
        },
      },
      create: {
        tecnicoId: tecnico.id,
        agricultorId: agricultor.id,
      },
      update: {},
    });
    console.log('✔ Vínculo Técnico <-> Agricultor assegurado');

    // =========================================================================
    // CENÁRIO A: Catálogo de Pragas com Filtro por Cultura
    // =========================================================================
    console.log('\n[CENÁRIO A] Testando catálogo de pragas com vínculo à cultura...');

    const pragaTeste = await prisma.praga.create({
      data: {
        nome: `Lagarta Teste ${Date.now()}`,
        nomeCientifico: 'Spodoptera frugiperda',
        descricao: 'Praga devastadora que ataca o cartucho das plantas jovens.',
        sintomas: 'Furos nas folhas centrais e excrementos no interior do cartucho.',
        metodosCombate: 'Controlo biológico com Bacillus thuringiensis e rotação de culturas.',
        severidadePadrao: SeveridadePraga.ALTA,
        culturaId: cultura.id,
      },
      include: {
        cultura: true,
      },
    });

    console.log(`✔ Praga criada e vinculada à cultura: "${pragaTeste.nome}" -> Afeta: "${pragaTeste.cultura?.nome}"`);

    const pragasFiltradas = await prisma.praga.findMany({
      where: { culturaId: cultura.id },
    });
    console.log(`✔ Filtro por culturaId retornou ${pragasFiltradas.length} praga(s) associada(s)`);

    // =========================================================================
    // CENÁRIO B: Reporte de Ocorrência Fitossanitária e Alerta ao SDAE
    // =========================================================================
    console.log('\n[CENÁRIO B] Testando reporte de ocorrência e disparo de alerta ao técnico...');

    const ocorrencia = await prisma.ocorrenciaPraga.create({
      data: {
        parcelaId: parcela.id,
        pragaId: pragaTeste.id,
        agricultorId: agricultor.id,
        descricao: 'Presença acentuada de lagartas com danos visíveis em 20% das plantas.',
        severidade: SeveridadePraga.ALTA,
        status: StatusOcorrencia.ABERTA,
      },
      include: {
        parcela: true,
        praga: true,
      },
    });

    console.log(`✔ Ocorrência fitossanitária criada: ID ${ocorrencia.id} | Status: ${ocorrencia.status}`);

    const alertaTecnico = await prisma.alerta.create({
      data: {
        userId: tecnico.id,
        tipo: AlertaTipo.PRAGA_REPORTADA,
        titulo: `Ocorrência Fitossanitária: ${parcela.nome}`,
        mensagem: `Reporte de praga na parcela ${parcela.nome}. Severidade: ALTA.`,
        link: '/pragas/ocorrencias',
      },
    });

    console.log(`✔ Alerta PRAGA_REPORTADA disparado com sucesso para o Técnico (ID: ${alertaTecnico.id})`);

    // =========================================================================
    // CENÁRIO C: Parecer Técnico e Resolução da Ocorrência
    // =========================================================================
    console.log('\n[CENÁRIO C] Testando parecer técnico agronómico e resolução da ocorrência...');

    const ocorrenciaResolvida = await prisma.ocorrenciaPraga.update({
      where: { id: ocorrencia.id },
      data: {
        status: StatusOcorrencia.RESOLVIDA,
        parecerTecnico: 'Diagnóstico confirmado no campo. Infestação controlável com bioinseticida.',
        acaoRecomendada: 'Aplicação imediata de bioinseticida nas horas mais frescas do dia.',
        tecnicoResolutorId: tecnico.id,
        dataResolucao: new Date(),
      },
      include: {
        tecnicoResolutor: true,
      },
    });

    if (ocorrenciaResolvida.status !== StatusOcorrencia.RESOLVIDA || !ocorrenciaResolvida.tecnicoResolutorId) {
      throw new Error('Falha: ocorrência não foi marcada como resolvida com identificação do técnico.');
    }

    console.log('✔ Ocorrência resolvida com êxito pelo Técnico SDAE!');
    console.log(`  Extensionista Responsável: ${ocorrenciaResolvida.tecnicoResolutor?.nome}`);
    console.log(`  Data de Resolução: ${ocorrenciaResolvida.dataResolucao?.toISOString()}`);
    console.log(`  Parecer Técnico: "${ocorrenciaResolvida.parecerTecnico}"`);
    console.log(`  Ação Recomendada: "${ocorrenciaResolvida.acaoRecomendada}"`);

    // =========================================================================
    // CENÁRIO D: Estatísticas Agregadas
    // =========================================================================
    console.log('\n[CENÁRIO D] Testando métricas agregadas de ocorrências...');
    const totalOcorrencias = await prisma.ocorrenciaPraga.count({
      where: { parcelaId: parcela.id },
    });
    const resolvidasCount = await prisma.ocorrenciaPraga.count({
      where: { parcelaId: parcela.id, status: StatusOcorrencia.RESOLVIDA },
    });
    console.log(`✔ Estatísticas calculadas: Total: ${totalOcorrencias} | Resolvidas: ${resolvidasCount}`);

    // =========================================================================
    // LIMPEZA
    // =========================================================================
    console.log('\n[LIMPEZA] Removendo registos temporários de homologação...');
    await prisma.alerta.delete({ where: { id: alertaTecnico.id } });
    await prisma.ocorrenciaPraga.delete({ where: { id: ocorrencia.id } });
    await prisma.praga.delete({ where: { id: pragaTeste.id } });
    console.log('✔ Dados de teste removidos com sucesso.');

    console.log('\n======================================================');
    console.log(' HOMOLOGAÇÃO DA FASE 3 CONCLUÍDA COM 100% DE ÊXITO!');
    console.log('======================================================\n');
  } catch (error) {
    console.error('❌ ERRO NA HOMOLOGAÇÃO DA FASE 3:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runFase3Verification();
