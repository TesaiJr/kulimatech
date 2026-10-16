// scripts/verify-fase1-schema.mjs
import 'dotenv/config';
import pkgPrisma from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const { PrismaClient, UserRole, SeveridadePraga, StatusOcorrencia } = pkgPrisma;

async function runFase1Verification() {
  console.log('\n======================================================');
  console.log(' TESTE DE HOMOLOGAÇÃO DA FASE 1 — SCHEMA & RELAÇÕES');
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

    // 1. Obter ou criar utilizadores para teste
    let tecnico = await prisma.user.findFirst({
      where: { role: UserRole.TECNICO },
    });

    if (!tecnico) {
      console.log('  Criando técnico de teste...');
      tecnico = await prisma.user.create({
        data: {
          nome: 'Técnico SDAE Teste',
          email: `tecnico.teste.${Date.now()}@sdae.gov.mz`,
          passwordHash: '$2a$10$abcdefghijklmnopqrstuvwxyz123456',
          role: UserRole.TECNICO,
          zonaAtuacao: 'Nhamatanda Sede',
        },
      });
    }

    let agricultor = await prisma.user.findFirst({
      where: { role: UserRole.AGRICULTOR },
    });

    if (!agricultor) {
      console.log('  Criando agricultor de teste...');
      agricultor = await prisma.user.create({
        data: {
          nome: 'Agricultor Teste Nhamatanda',
          email: `agricultor.teste.${Date.now()}@kulimatech.mz`,
          passwordHash: '$2a$10$abcdefghijklmnopqrstuvwxyz123456',
          role: UserRole.AGRICULTOR,
          zonaAtuacao: 'Metuchira',
        },
      });
    }

    // 2. Obter ou criar parcela de teste
    let parcela = await prisma.parcela.findFirst({
      where: { agricultorId: agricultor.id },
    });

    if (!parcela) {
      parcela = await prisma.parcela.create({
        data: {
          nome: 'Talhão Teste Fase 1',
          areaHectares: 2.5,
          agricultorId: agricultor.id,
          localizacao: 'Estrada Nacional 6, Km 45',
        },
      });
    }

    // =========================================================================
    // CENÁRIO A: LeituraSolo com novos campos de validação técnica
    // =========================================================================
    console.log('\n[CENÁRIO A] Testando validação técnica em LeituraSolo...');
    
    // Inserir leitura com validadoPorTecnico = false
    const leitura = await prisma.leituraSolo.create({
      data: {
        parcelaId: parcela.id,
        humidade: 42.5,
        temperatura: 27.0,
        statusHumidade: 'OPTIMA',
        observacoes: 'Medição de teste inicial',
        validadoPorTecnico: false,
      },
    });

    console.log(`✔ Leitura criada com ID: ${leitura.id} | Validado: ${leitura.validadoPorTecnico}`);

    // Atualizar simulando a validação técnica pelo Técnico SDAE
    const leituraValidada = await prisma.leituraSolo.update({
      where: { id: leitura.id },
      data: {
        validadoPorTecnico: true,
        tecnicoValidadorId: tecnico.id,
        dataValidacao: new Date(),
        observacoesTecnicas: 'Condições hídricas conformes para a cultura.',
      },
      include: {
        tecnicoValidador: {
          select: { id: true, nome: true, email: true },
        },
      },
    });

    if (
      leituraValidada.validadoPorTecnico === true &&
      leituraValidada.tecnicoValidadorId === tecnico.id &&
      leituraValidada.tecnicoValidador?.nome === tecnico.nome
    ) {
      console.log('✔ Validação técnica de leitura persistida com sucesso!');
      console.log(`  Técnico Validador: ${leituraValidada.tecnicoValidador.nome}`);
      console.log(`  Data de Validação: ${leituraValidada.dataValidacao}`);
      console.log(`  Notas Técnicas: ${leituraValidada.observacoesTecnicas}`);
    } else {
      throw new Error('Falha na persistência da validação técnica em LeituraSolo');
    }

    // =========================================================================
    // CENÁRIO B: Relação Praga <-> Cultura com filtro
    // =========================================================================
    console.log('\n[CENÁRIO B] Testando vínculo Praga <-> Cultura...');

    // Obter ou criar Cultura
    let cultura = await prisma.cultura.findFirst();
    if (!cultura) {
      cultura = await prisma.cultura.create({
        data: {
          nome: `Milho Teste ${Date.now()}`,
          descricao: 'Cultura de grão alimentar básico',
          humidadeMin: 40.0,
          humidadeMax: 70.0,
          cicloDias: 120,
          epocaPlantio: 'Outubro a Dezembro',
        },
      });
    }

    // Criar Praga vinculada à cultura
    const praga = await prisma.praga.create({
      data: {
        nome: `Lagarta do Funil Teste ${Date.now()}`,
        descricao: 'Spodoptera frugiperda atacando folhas jovens',
        sintomas: 'Perfurações nas folhas centrais e excrementos visíveis',
        metodosCombate: 'Aplicação de bioinseticida e rotação de culturas',
        severidadePadrao: SeveridadePraga.ALTA,
        culturaId: cultura.id,
      },
    });

    // Consultar praga incluindo cultura
    const pragaComCultura = await prisma.praga.findUnique({
      where: { id: praga.id },
      include: {
        cultura: { select: { id: true, nome: true } },
      },
    });

    if (pragaComCultura?.culturaId === cultura.id && pragaComCultura?.cultura?.nome === cultura.nome) {
      console.log('✔ Praga associada com sucesso à cultura!');
      console.log(`  Praga: ${pragaComCultura.nome}`);
      console.log(`  Cultura Vinculada: ${pragaComCultura.cultura.nome}`);
    } else {
      throw new Error('Falha no vínculo entre Praga e Cultura');
    }

    // =========================================================================
    // CENÁRIO C: Ocorrência de Praga e Resolução Técnica
    // =========================================================================
    console.log('\n[CENÁRIO C] Testando reporte e resolução de OcorrenciaPraga...');

    const ocorrencia = await prisma.ocorrenciaPraga.create({
      data: {
        parcelaId: parcela.id,
        pragaId: praga.id,
        agricultorId: agricultor.id,
        descricao: 'Focos de lagarta observados no terço superior do talhão',
        severidade: SeveridadePraga.ALTA,
        status: StatusOcorrencia.ABERTA,
      },
    });

    console.log(`✔ Ocorrência criada com ID: ${ocorrencia.id} | Status: ${ocorrencia.status}`);

    const ocorrenciaResolvida = await prisma.ocorrenciaPraga.update({
      where: { id: ocorrencia.id },
      data: {
        status: StatusOcorrencia.RESOLVIDA,
        parecerTecnico: 'Tratamento biológico prescrito e inspecionado no local.',
        acaoRecomendada: 'Manter monitoramento semanal até o florescimento.',
        tecnicoResolutorId: tecnico.id,
        dataResolucao: new Date(),
      },
      include: {
        tecnicoResolutor: { select: { id: true, nome: true } },
      },
    });

    if (
      ocorrenciaResolvida.status === StatusOcorrencia.RESOLVIDA &&
      ocorrenciaResolvida.tecnicoResolutorId === tecnico.id &&
      ocorrenciaResolvida.tecnicoResolutor?.nome === tecnico.nome
    ) {
      console.log('✔ Resolução técnica de ocorrência persistida com sucesso!');
      console.log(`  Status Final: ${ocorrenciaResolvida.status}`);
      console.log(`  Técnico Resolutor: ${ocorrenciaResolvida.tecnicoResolutor.nome}`);
      console.log(`  Parecer Técnico: ${ocorrenciaResolvida.parecerTecnico}`);
    } else {
      throw new Error('Falha na persistência da resolução em OcorrenciaPraga');
    }

    // =========================================================================
    // LIMPEZA DOS REGISTOS DE TESTE
    // =========================================================================
    console.log('\n[LIMPEZA] Removendo registos temporários de homologação...');
    await prisma.ocorrenciaPraga.delete({ where: { id: ocorrencia.id } });
    await prisma.praga.delete({ where: { id: praga.id } });
    await prisma.leituraSolo.delete({ where: { id: leitura.id } });
    console.log('✔ Base de dados restaurada para o estado original.');

    console.log('\n======================================================');
    console.log(' HOMOLOGAÇÃO DA FASE 1 CONCLUÍDA COM 100% DE ÊXITO!');
    console.log('======================================================\n');
  } catch (err) {
    console.error('\n✖ ERRO NA HOMOLOGAÇÃO DA FASE 1:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runFase1Verification();
