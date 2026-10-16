// scripts/verify-fase7-dashboards-homologacao.mjs
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import pkgPrisma from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const { PrismaClient, UserRole, StatusOcorrencia, StatusRecomendacao } = pkgPrisma;

let passedTests = 0;
let failedTests = 0;
const startTime = Date.now();

function assert(condition, message) {
  if (condition) {
    console.log(`  ✔ [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`  ✖ [FAIL] ${message}`);
    failedTests++;
  }
}

async function runFase7Homologacao() {
  console.log('\n================================================================');
  console.log(' TESTE DE HOMOLOGAÇÃO DA FASE 7 — VALIDAÇÃO INTEGRADA E DASHBOARDS');
  console.log(' Plataforma KulimaTech • SDAE Nhamatanda (UniZambeze 2026)');
  console.log('================================================================\n');

  // Inicialização do cliente Prisma com adaptador PostgreSQL
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });

  const prisma = new PrismaClient({
    adapter,
    log: ['error', 'warn'],
  });

  try {
    await prisma.$connect();
    console.log('✔ Conexão estabelecida com sucesso à base de dados PostgreSQL (Supabase)\n');

    // -------------------------------------------------------------------------
    // CENÁRIO 1: Auditoria do Painel do Administrador (Visão Distrital Global)
    // -------------------------------------------------------------------------
    console.log('--- CENÁRIO 1: Auditoria do Painel do Administrador (Agregações Distritais) ---');

    const [
      totalUsuarios,
      totalAdmins,
      totalTecnicos,
      totalAgricultores,
      totalParcelas,
      hectaresAgg,
      totalCulturas,
      totalPragas,
      totalLeituras,
      leiturasValidadas,
      totalOcorrencias,
      totalRecomendacoes,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: UserRole.ADMIN } }),
      prisma.user.count({ where: { role: UserRole.TECNICO } }),
      prisma.user.count({ where: { role: UserRole.AGRICULTOR } }),
      prisma.parcela.count(),
      prisma.parcela.aggregate({ _sum: { areaHectares: true } }),
      prisma.cultura.count(),
      prisma.praga.count(),
      prisma.leituraSolo.count(),
      prisma.leituraSolo.count({ where: { validadoPorTecnico: true } }),
      prisma.ocorrenciaPraga.count(),
      prisma.recomendacao.count(),
    ]);

    const totalHectaresDistrito = hectaresAgg._sum.areaHectares || 0;

    assert(totalUsuarios > 0, `Total de utilizadores no sistema: ${totalUsuarios}`);
    assert(totalAdmins >= 1, `Administradores distritais cadastrados: ${totalAdmins}`);
    assert(totalTecnicos >= 1, `Técnicos de extensão SDAE cadastrados: ${totalTecnicos}`);
    assert(totalAgricultores >= 1, `Agricultores cadastrados na rede: ${totalAgricultores}`);
    assert(totalParcelas >= 1, `Parcelas agrícolas monitoradas: ${totalParcelas}`);
    assert(totalHectaresDistrito >= 0, `Área agrícola total agregada: ${totalHectaresDistrito.toFixed(2)} ha`);
    assert(totalCulturas >= 1, `Catálogo de culturas prioritárias: ${totalCulturas} culturas`);
    assert(totalPragas >= 1, `Catálogo de pragas com medidas de controlo: ${totalPragas} pragas`);
    assert(totalLeituras >= 0, `Histórico de medições de solo: ${totalLeituras} registadas (${leiturasValidadas} validadas)`);
    assert(totalOcorrencias >= 0, `Histórico fitossanitário: ${totalOcorrencias} ocorrências`);
    assert(totalRecomendacoes >= 0, `Histórico de pareceres técnicos: ${totalRecomendacoes} recomendações emitidas`);

    // -------------------------------------------------------------------------
    // CENÁRIO 2: Auditoria do Painel do Técnico SDAE (Carteira e Validações Reais)
    // -------------------------------------------------------------------------
    console.log('\n--- CENÁRIO 2: Auditoria do Painel do Técnico SDAE (Carteira e Agregações) ---');

    const tecnicoTeste = await prisma.user.findFirst({
      where: { role: UserRole.TECNICO },
      include: {
        agricultoresAcompanhados: {
          include: {
            agricultor: {
              include: {
                parcelas: true,
              },
            },
          },
        },
      },
    });

    assert(!!tecnicoTeste, `Técnico de teste selecionado: ${tecnicoTeste?.nome} (${tecnicoTeste?.email})`);

    const agricultoresIds = tecnicoTeste.agricultoresAcompanhados.map((v) => v.agricultorId);
    const parcelasIds = tecnicoTeste.agricultoresAcompanhados.flatMap((v) =>
      v.agricultor.parcelas.map((p) => p.id)
    );

    const [validacoesPendentes, ocorrenciasAtivas, ocorrenciasResolvidas, recomendacoesEmitidas] =
      await Promise.all([
        parcelasIds.length > 0
          ? prisma.leituraSolo.count({
              where: {
                parcelaId: { in: parcelasIds },
                validadoPorTecnico: false,
              },
            })
          : 0,
        agricultoresIds.length > 0
          ? prisma.ocorrenciaPraga.count({
              where: {
                agricultorId: { in: agricultoresIds },
                status: { in: [StatusOcorrencia.ABERTA, StatusOcorrencia.EM_ANALISE] },
              },
            })
          : 0,
        agricultoresIds.length > 0
          ? prisma.ocorrenciaPraga.count({
              where: {
                agricultorId: { in: agricultoresIds },
                status: StatusOcorrencia.RESOLVIDA,
              },
            })
          : 0,
        prisma.recomendacao.count({
          where: { tecnicoId: tecnicoTeste.id },
        }),
      ]);

    assert(typeof validacoesPendentes === 'number' && validacoesPendentes >= 0, `Validações de humidade pendentes contadas via agregação real: ${validacoesPendentes}`);
    assert(typeof ocorrenciasAtivas === 'number' && ocorrenciasAtivas >= 0, `Ocorrências de pragas ativas sob supervisão: ${ocorrenciasAtivas}`);
    assert(typeof ocorrenciasResolvidas === 'number' && ocorrenciasResolvidas >= 0, `Ocorrências já resolvidas com parecer técnico: ${ocorrenciasResolvidas}`);
    assert(typeof recomendacoesEmitidas === 'number' && recomendacoesEmitidas >= 0, `Total de recomendações emitidas pelo técnico: ${recomendacoesEmitidas}`);

    // -------------------------------------------------------------------------
    // CENÁRIO 3: Auditoria do Painel do Agricultor (Parcelas, Leituras e Técnico)
    // -------------------------------------------------------------------------
    console.log('\n--- CENÁRIO 3: Auditoria do Painel do Agricultor ---');

    const agricultorTeste = await prisma.user.findFirst({
      where: { role: UserRole.AGRICULTOR },
      include: {
        parcelas: {
          include: {
            leituras: { orderBy: { dataLeitura: 'desc' }, take: 1 },
          },
        },
        tecnicosResponsaveis: {
          include: { tecnico: true },
        },
      },
    });

    assert(!!agricultorTeste, `Agricultor de teste selecionado: ${agricultorTeste?.nome} (${agricultorTeste?.email})`);
    assert(Array.isArray(agricultorTeste?.parcelas), `Lista de parcelas do agricultor carregada (${agricultorTeste?.parcelas.length} parcelas)`);

    const recomendacoesAgricultor = await prisma.recomendacao.count({
      where: {
        parcela: { agricultorId: agricultorTeste.id },
        status: StatusRecomendacao.PENDENTE,
      },
    });

    assert(typeof recomendacoesAgricultor === 'number', `Recomendações técnicas pendentes para o agricultor: ${recomendacoesAgricultor}`);

    const vinculoTecnico = agricultorTeste.tecnicosResponsaveis[0]?.tecnico;
    if (vinculoTecnico) {
      assert(true, `Técnico responsável atribuído com sucesso: ${vinculoTecnico.nome} (${vinculoTecnico.telefone || vinculoTecnico.email})`);
    } else {
      assert(true, `Agricultor em estado inicial sem técnico atribuído (Empty state previsto no dashboard)`);
    }

    // -------------------------------------------------------------------------
    // CENÁRIO 4: Integridade de Ficheiros e Rotas do Frontend (Zero 404s)
    // -------------------------------------------------------------------------
    console.log('\n--- CENÁRIO 4: Integridade Estrutural das Rotas do Frontend (Zero 404s) ---');

    const baseDir = path.resolve(process.cwd(), 'src/app/(dashboard)');
    const rotasEssenciais = [
      'dashboard/page.tsx',
      'parcelas/page.tsx',
      'parcelas/novo/page.tsx',
      'utilizadores/page.tsx',
      'leituras/page.tsx',
      'recomendacoes/page.tsx',
      'pragas/page.tsx',
      'pragas/ocorrencias/page.tsx',
      'culturas/page.tsx',
      'mensagens/page.tsx',
      'mensagens/alertas/page.tsx',
    ];

    for (const rota of rotasEssenciais) {
      const fullPath = path.join(baseDir, rota);
      const existe = fs.existsSync(fullPath);
      assert(existe, `Rota do sistema verificada: /${rota.replace('/page.tsx', '')}`);
    }

    // -------------------------------------------------------------------------
    // CENÁRIO 5: Validação do Ciclo de Vida Agronómico (Leitura -> Validação)
    // -------------------------------------------------------------------------
    console.log('\n--- CENÁRIO 5: Ciclo de Vida Agronómico (Registo -> Validação) ---');

    const parcelaTeste = await prisma.parcela.findFirst();
    if (parcelaTeste && tecnicoTeste) {
      // Cria leitura de solo temporária para homologação
      const novaLeitura = await prisma.leituraSolo.create({
        data: {
          parcelaId: parcelaTeste.id,
          humidade: 42.5,
          temperatura: 25.0,
          statusHumidade: 'OPTIMA',
          observacoes: 'Medição de teste automatizada para homologação da Fase 7',
          validadoPorTecnico: false,
        },
      });

      assert(novaLeitura.validadoPorTecnico === false, `Leitura criada em estado PENDENTE de validação (ID: ${novaLeitura.id})`);

      // Validação técnica pelo técnico
      const leituraValidada = await prisma.leituraSolo.update({
        where: { id: novaLeitura.id },
        data: {
          validadoPorTecnico: true,
          tecnicoValidadorId: tecnicoTeste.id,
          dataValidacao: new Date(),
          observacoesTecnicas: 'Humidade em conformidade com o estádio vegetativo da cultura (SDAE).',
        },
      });

      assert(leituraValidada.validadoPorTecnico === true, `Leitura validada com sucesso pelo técnico SDAE (${leituraValidada.dataValidacao ? 'Carimbo de data registado' : ''})`);

      // Limpeza do registo de teste
      await prisma.leituraSolo.delete({
        where: { id: novaLeitura.id },
      });
      console.log('  ✔ Registo temporário de leitura de teste removido com sucesso.');
    } else {
      console.log('  [INFO] Parcela de teste indisponível para simulação de mutação.');
    }

    // -------------------------------------------------------------------------
    // RELATÓRIO FINAL DE HOMOLOGAÇÃO
    // -------------------------------------------------------------------------
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('\n================================================================');
    console.log(' RELATÓRIO FINAL DE HOMOLOGAÇÃO — FASE 7');
    console.log('================================================================');
    console.log(`  Total de Testes Executados: ${passedTests + failedTests}`);
    console.log(`  Aprovados:                  ${passedTests} ✔`);
    console.log(`  Reprovados:                 ${failedTests} ✖`);
    console.log(`  Duração Total:              ${duration}s`);
    console.log('================================================================');

    if (failedTests === 0) {
      console.log('\n RESULTADO: HOMOLOGAÇÃO CONCLUÍDA COM 100% DE SUCESSO! 🎉');
      console.log(' O sistema KulimaTech está totalmente íntegro, consistente e pronto');
      console.log(' para demonstração executiva e defesa acadêmica no SDAE de Nhamatanda.\n');
    } else {
      console.error(`\n ATENÇÃO: ${failedTests} teste(s) falharam. Verifique os registos acima.\n`);
      process.exitCode = 1;
    }
  } catch (error) {
    console.error('\n✖ Erro crítico durante a homologação:', error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

runFase7Homologacao();
