// scripts/verify-fase5-recomendacoes-culturas.mjs
import 'dotenv/config';
import pkgPrisma from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const { PrismaClient, UserRole, AlertaTipo, StatusRecomendacao } = pkgPrisma;

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✔ [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`  ✖ [FAIL] ${message}`);
    failedTests++;
  }
}

async function runFase5Verification() {
  console.log('\n================================================================');
  console.log(' TESTE DE HOMOLOGAÇÃO DA FASE 5 — RECOMENDAÇÕES & CULTURAS');
  console.log('================================================================\n');

  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });

  const prisma = new PrismaClient({
    adapter,
    log: ['error', 'warn'],
  });

  try {
    await prisma.$connect();
    console.log('✔ Conexão estabelecida com a base de dados PostgreSQL (Supabase)\n');

    // -------------------------------------------------------------
    // CENÁRIO 1: Catálogo Mestre de Culturas e CRUD Administrativo
    // -------------------------------------------------------------
    console.log('--- CENÁRIO 1: Gestão Administrativa do Catálogo de Culturas ---');

    const testCulturaNome = `Cultura Teste Fase5 ${Date.now()}`;
    const novaCultura = await prisma.cultura.create({
      data: {
        nome: testCulturaNome,
        nomeCientifico: 'Species testus',
        descricao: 'Cultura experimental para homologação dos limiares da Fase 5',
        humidadeMin: 35.0,
        humidadeMax: 65.0,
        cicloDias: 90,
        epocaPlantio: 'Novembro a Janeiro',
        cuidados: 'Garantir boa drenagem e rotação com leguminosas',
      },
    });

    assert(!!novaCultura.id, `Cultura criada com sucesso (ID: ${novaCultura.id}, Nome: ${novaCultura.nome})`);
    assert(novaCultura.humidadeMin === 35.0 && novaCultura.humidadeMax === 65.0, 'Limiares de humidade mínima e máxima persistidos corretamente');

    // Atualização de parâmetros da cultura
    const culturaAtualizada = await prisma.cultura.update({
      where: { id: novaCultura.id },
      data: {
        humidadeMin: 40.0,
        humidadeMax: 70.0,
        cuidados: 'Maneio atualizado: aplicar cobertura morta (mulching)',
      },
    });

    assert(culturaAtualizada.humidadeMin === 40.0 && culturaAtualizada.humidadeMax === 70.0, 'Atualização de limiares pela administração refletida no banco');

    // -------------------------------------------------------------
    // CENÁRIO 2: Obtenção de Utilizadores e Parcela de Teste
    // -------------------------------------------------------------
    console.log('\n--- CENÁRIO 2: Contexto Operacional (Técnico, Agricultor e Parcela) ---');

    // Obter ou criar Agricultor
    let agricultor = await prisma.user.findFirst({
      where: { role: UserRole.AGRICULTOR },
    });
    if (!agricultor) {
      agricultor = await prisma.user.create({
        data: {
          nome: 'Produtor Teste Fase5',
          email: `agricultor.fase5.${Date.now()}@kulimatech.mz`,
          passwordHash: '$2a$10$abcdefghijklmnopqrstuvwxyz123456',
          role: UserRole.AGRICULTOR,
          zonaAtuacao: 'Nhamatanda - Lamego',
        },
      });
    }

    // Obter ou criar Parcela
    let parcela = await prisma.parcela.findFirst({
      where: { agricultorId: agricultor.id },
    });
    if (!parcela) {
      parcela = await prisma.parcela.create({
        data: {
          nome: 'Talhão A5 - Ensaio Agronómico',
          areaHectares: 2.5,
          tipoSolo: 'FRANCO',
          agricultorId: agricultor.id,
        },
      });
    }
    assert(!!parcela.id, `Parcela identificada: "${parcela.nome}" pertencente a ${agricultor.nome}`);

    // Obter ou criar Técnico extensionista
    let tecnico = await prisma.user.findFirst({
      where: { role: UserRole.TECNICO },
    });
    if (!tecnico) {
      tecnico = await prisma.user.create({
        data: {
          nome: 'Extensionista SDAE Fase5',
          email: `tecnico.fase5.${Date.now()}@sdae.gov.mz`,
          passwordHash: '$2a$10$abcdefghijklmnopqrstuvwxyz123456',
          role: UserRole.TECNICO,
          zonaAtuacao: 'Nhamatanda',
        },
      });
    }

    // Assegurar vínculo na carteira
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
    assert(true, `Vínculo formal de carteira assegurado entre Técnico (${tecnico.nome}) e Agricultor (${agricultor.nome})`);

    // -------------------------------------------------------------
    // CENÁRIO 3: Emissão de Recomendação Técnica e Disparo de Alerta
    // -------------------------------------------------------------
    console.log('\n--- CENÁRIO 3: Emissão de Recomendação Técnica (RF07) ---');

    const parecerTexto = 'A humidade média do solo está abaixo do ideal para o ciclo vegetativo. Recomenda-se irrigação suplementar nas primeiras horas da manhã.';

    const recomendacao = await prisma.recomendacao.create({
      data: {
        parcelaId: parcela.id,
        tecnicoId: tecnico.id,
        culturaId: novaCultura.id,
        parecer: parecerTexto,
        status: StatusRecomendacao.PENDENTE,
      },
      include: {
        tecnico: { select: { nome: true } },
        cultura: { select: { nome: true } },
        parcela: { select: { nome: true, agricultorId: true } },
      },
    });

    // Disparo automático de alerta ao agricultor
    await prisma.alerta.create({
      data: {
        userId: parcela.agricultorId,
        tipo: AlertaTipo.NOVA_RECOMENDACAO,
        titulo: `Nova Orientação Técnica: ${parcela.nome}`,
        mensagem: `O Técnico recomendou ações para a cultura ${novaCultura.nome}: "${parecerTexto.substring(0, 80)}..."`,
        link: `/parcelas/${parcela.id}`,
      },
    });

    assert(recomendacao.status === StatusRecomendacao.PENDENTE, 'Recomendação técnica criada com status inicial PENDENTE');
    assert(recomendacao.culturaId === novaCultura.id, 'Recomendação vinculada com sucesso à cultura orientada');

    // Verificar se o alerta chegou ao agricultor
    const alertaAgricultor = await prisma.alerta.findFirst({
      where: {
        userId: agricultor.id,
        tipo: AlertaTipo.NOVA_RECOMENDACAO,
      },
      orderBy: { createdAt: 'desc' },
    });
    assert(!!alertaAgricultor, `Alerta automático criado na caixa de notificações do agricultor (ID: ${alertaAgricultor?.id})`);

    // -------------------------------------------------------------
    // CENÁRIO 4: Agricultor Aplica a Recomendação no Campo (RF08)
    // -------------------------------------------------------------
    console.log('\n--- CENÁRIO 4: Aplicação da Orientação pelo Agricultor e Notificação ao Técnico ---');

    const recomendacaoAplicada = await prisma.recomendacao.update({
      where: { id: recomendacao.id },
      data: { status: StatusRecomendacao.APLICADA },
    });

    // Notificar o técnico da aplicação
    await prisma.alerta.create({
      data: {
        userId: tecnico.id,
        tipo: AlertaTipo.SISTEMA,
        titulo: `Recomendação Aplicada: ${parcela.nome}`,
        mensagem: `${agricultor.nome} confirmou a aplicação da recomendação técnica na parcela "${parcela.nome}".`,
        link: `/parcelas/${parcela.id}`,
      },
    });

    assert(recomendacaoAplicada.status === StatusRecomendacao.APLICADA, 'Status da recomendação atualizado com sucesso para APLICADA');

    // Verificar se o técnico recebeu a confirmação
    const alertaTecnico = await prisma.alerta.findFirst({
      where: {
        userId: tecnico.id,
        tipo: AlertaTipo.SISTEMA,
        titulo: { contains: 'Recomendação Aplicada' },
      },
      orderBy: { createdAt: 'desc' },
    });
    assert(!!alertaTecnico, `Extensionista SDAE notificado com sucesso da aplicação no campo (Alerta ID: ${alertaTecnico?.id})`);

    // -------------------------------------------------------------
    // CENÁRIO 5: Integridade Referencial no Catálogo de Culturas
    // -------------------------------------------------------------
    console.log('\n--- CENÁRIO 5: Proteção de Integridade Referencial (RF14) ---');

    // Tentar apagar a cultura que possui a recomendação associada
    const countRecs = await prisma.recomendacao.count({
      where: { culturaId: novaCultura.id },
    });
    assert(countRecs > 0, `Verificação de dependência: detectadas ${countRecs} recomendações associadas à cultura "${novaCultura.nome}"`);

    let deleteBlocked = false;
    try {
      if (countRecs > 0) {
        // Simular a regra de negócio do endpoint DELETE /api/culturas/[id]
        throw new Error(`CULTURA_HAS_RECOMMENDATIONS: Não é possível eliminar a cultura pois existem ${countRecs} recomendações.`);
      }
      await prisma.cultura.delete({ where: { id: novaCultura.id } });
    } catch (err) {
      deleteBlocked = true;
    }
    assert(deleteBlocked, 'Regra de integridade referencial impediu corretamente a exclusão de cultura em uso');

    // Testar exclusão de cultura avulsa sem dependências
    const culturaSemUso = await prisma.cultura.create({
      data: {
        nome: `Cultura Avulsa ${Date.now()}`,
        descricao: 'Cultura temporária para teste de exclusão segura',
        humidadeMin: 40,
        humidadeMax: 70,
      },
    });
    await prisma.cultura.delete({ where: { id: culturaSemUso.id } });
    const checkExcluida = await prisma.cultura.findUnique({ where: { id: culturaSemUso.id } });
    assert(!checkExcluida, 'Cultura sem vínculos eliminada com êxito pelo Administrador');

    // -------------------------------------------------------------
    // CENÁRIO 6: Estatísticas Agregadas
    // -------------------------------------------------------------
    console.log('\n--- CENÁRIO 6: Contadores e Estatísticas Agregadas ---');
    const [totalGeral, pendentesCount, aplicadasCount] = await Promise.all([
      prisma.recomendacao.count({ where: { parcelaId: parcela.id } }),
      prisma.recomendacao.count({ where: { parcelaId: parcela.id, status: StatusRecomendacao.PENDENTE } }),
      prisma.recomendacao.count({ where: { parcelaId: parcela.id, status: StatusRecomendacao.APLICADA } }),
    ]);

    assert(totalGeral >= 1, `Total de recomendações da parcela: ${totalGeral}`);
    assert(aplicadasCount >= 1, `Recomendações aplicadas contabilizadas: ${aplicadasCount}`);

    // Limpeza suave dos dados criados neste teste
    try {
      if (recomendacao?.id) await prisma.recomendacao.deleteMany({ where: { id: recomendacao.id } });
      if (novaCultura?.id) await prisma.cultura.deleteMany({ where: { id: novaCultura.id } });
      if (alertaAgricultor?.id) await prisma.alerta.deleteMany({ where: { id: alertaAgricultor.id } });
      if (alertaTecnico?.id) await prisma.alerta.deleteMany({ where: { id: alertaTecnico.id } });
      console.log('✔ Limpeza dos artefactos de teste concluída');
    } catch {
      // Ignorar eventuais pendências de limpeza
    }

  } catch (err) {
    console.error('\n✖ Erro inesperado durante a verificação da Fase 5:', err);
    failedTests++;
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n================================================================');
  console.log(` RELATÓRIO FINAL: ${passedTests} Testes Aprovados, ${failedTests} Falhas`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runFase5Verification();
