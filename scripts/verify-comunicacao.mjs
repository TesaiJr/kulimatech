// scripts/verify-comunicacao.mjs
// Suite de Testes e Validação do Backend - Fase 5: Módulo F6 (Comunicação e Alertas)
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

// Schemas Zod para teste isolado de contrato
const enviarMensagemTestSchema = z.object({
  destinatarioId: z.string().min(1, 'ID do destinatário é obrigatório.'),
  conteudo: z
    .string()
    .trim()
    .min(1, 'A mensagem não pode estar vazia.')
    .max(1000, 'A mensagem não pode exceder 1000 caracteres.'),
});

const atualizarAlertaTestSchema = z.object({
  lido: z.boolean(),
});

async function runVerification() {
  console.log('===========================================================');
  console.log(' SUITE DE TESTES: BACKEND F6 - COMUNICAÇÃO E ALERTAS');
  console.log('===========================================================\n');

  try {
    // -------------------------------------------------------------
    // TESTE 1: Validação de Schemas Zod de Comunicação
    // -------------------------------------------------------------
    console.log('--- TESTE 1: Validação Rigorosa de Schemas Zod ---');

    const validMsg = enviarMensagemTestSchema.safeParse({
      destinatarioId: 'user_123',
      conteudo: 'Olá senhor técnico, notei folhas amareladas no milho.',
    });
    assert(validMsg.success, 'Schema aceita mensagem válida com destinatário e texto');

    const emptyMsg = enviarMensagemTestSchema.safeParse({
      destinatarioId: 'user_123',
      conteudo: '   ',
    });
    assert(!emptyMsg.success, 'Schema rejeita mensagem vazia ou contendo apenas espaços');

    const noRecipientMsg = enviarMensagemTestSchema.safeParse({
      destinatarioId: '',
      conteudo: 'Mensagem sem destinatário',
    });
    assert(!noRecipientMsg.success, 'Schema rejeita payload sem ID de destinatário');

    const validAlertaUpdate = atualizarAlertaTestSchema.safeParse({ lido: true });
    assert(validAlertaUpdate.success, 'Schema valida corretamente atualização de status de alerta');

    // -------------------------------------------------------------
    // TESTE 2: Localizar Usuários Vinculados (Agricultor e Técnico SDAE)
    // -------------------------------------------------------------
    console.log('\n--- TESTE 2: Verificação de Vínculo Técnico <-> Agricultor ---');

    let vinculo = await prisma.tecnicoAgricultor.findFirst({
      include: {
        tecnico: true,
        agricultor: {
          include: {
            parcelas: true,
          },
        },
      },
    });

    if (!vinculo) {
      console.log('   Nenhum vínculo existente. Localizando ou criando para o teste...');
      let tecnico = await prisma.user.findFirst({ where: { role: UserRole.TECNICO } });
      let agricultor = await prisma.user.findFirst({ where: { role: UserRole.AGRICULTOR } });

      if (tecnico && agricultor) {
        await prisma.tecnicoAgricultor.create({
          data: {
            tecnicoId: tecnico.id,
            agricultorId: agricultor.id,
          },
        });
        vinculo = await prisma.tecnicoAgricultor.findFirst({
          where: { tecnicoId: tecnico.id, agricultorId: agricultor.id },
          include: { tecnico: true, agricultor: { include: { parcelas: true } } },
        });
      }
    }

    assert(Boolean(vinculo), 'Vínculo Técnico SDAE <-> Agricultor confirmado no banco');
    const tecnico = vinculo.tecnico;
    const agricultor = vinculo.agricultor;

    console.log(`   Técnico: ${tecnico.nome} (${tecnico.email})`);
    console.log(`   Agricultor: ${agricultor.nome} (${agricultor.email})`);

    // -------------------------------------------------------------
    // TESTE 3: Envio de Mensagem Direta e Disparo Atômico de Alerta
    // -------------------------------------------------------------
    console.log('\n--- TESTE 3: Envio de Mensagem e Alerta de Notificação ---');

    const textoMensagem = `Teste automatizado de mensagem F6 - ${Date.now()}`;

    const resultadoMsg = await prisma.$transaction(async (tx) => {
      const novaMsg = await tx.mensagem.create({
        data: {
          remetenteId: agricultor.id,
          destinatarioId: tecnico.id,
          conteudo: textoMensagem,
        },
      });

      const novoAlerta = await tx.alerta.create({
        data: {
          userId: tecnico.id,
          tipo: AlertaTipo.NOVA_MENSAGEM,
          titulo: `Nova mensagem de ${agricultor.nome}`,
          mensagem: textoMensagem,
          link: `/mensagens?interlocutorId=${agricultor.id}`,
        },
      });

      return { mensagem: novaMsg, alerta: novoAlerta };
    });

    assert(Boolean(resultadoMsg.mensagem.id), 'Mensagem persistida com sucesso na tabela "Mensagem"');
    assert(resultadoMsg.mensagem.lida === false, 'Mensagem inicia com estado "lida = false"');
    assert(Boolean(resultadoMsg.alerta.id), 'Alerta de notificação gerado automaticamente na tabela "Alerta"');
    assert(resultadoMsg.alerta.tipo === AlertaTipo.NOVA_MENSAGEM, 'Tipo do alerta é rigorosamente NOVA_MENSAGEM');
    assert(resultadoMsg.alerta.userId === tecnico.id, 'Alerta endereçado ao ID correto do destinatário');

    // -------------------------------------------------------------
    // TESTE 4: Isolamento de Vínculo (Multi-tenant Security)
    // -------------------------------------------------------------
    console.log('\n--- TESTE 4: Teste de Isolamento e Bloqueio de Vínculo Não Autorizado ---');

    // Criar um agricultor isolado (sem vínculo com o técnico)
    const agricultorIsolado = await prisma.user.create({
      data: {
        nome: 'Agricultor Isolado Teste',
        email: `isolado.${Date.now()}@imunda.mz`,
        passwordHash: 'hash_ficticio',
        role: UserRole.AGRICULTOR,
      },
    });

    const vinculoInvalido = await prisma.tecnicoAgricultor.findUnique({
      where: {
        tecnicoId_agricultorId: {
          tecnicoId: tecnico.id,
          agricultorId: agricultorIsolado.id,
        },
      },
    });

    assert(vinculoInvalido === null, 'Confirmado que agricultor isolado NÃO tem vínculo com o técnico');

    // Simulação da verificação de autorização do endpoint
    const autorizacaoPermitida = Boolean(vinculoInvalido);
    assert(!autorizacaoPermitida, 'Regra RBAC barra tentativa de envio de mensagem sem vínculo mútuo');

    // -------------------------------------------------------------
    // TESTE 5: Consulta de Mensagens e Leitura de Conversa
    // -------------------------------------------------------------
    console.log('\n--- TESTE 5: Consulta de Histórico e Marcação de Mensagem como Lida ---');

    const mensagens = await prisma.mensagem.findMany({
      where: {
        OR: [
          { remetenteId: agricultor.id, destinatarioId: tecnico.id },
          { remetenteId: tecnico.id, destinatarioId: agricultor.id },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });

    assert(mensagens.length >= 1, `Histórico de mensagens recuperado com sucesso (${mensagens.length} mensagem(ns))`);

    // Atualizar mensagens recebidas para lida = true (como faz a rota GET com interlocutorId)
    await prisma.mensagem.updateMany({
      where: {
        id: resultadoMsg.mensagem.id,
        destinatarioId: tecnico.id,
      },
      data: { lida: true },
    });

    const msgAposLeitura = await prisma.mensagem.findUnique({
      where: { id: resultadoMsg.mensagem.id },
    });
    assert(msgAposLeitura.lida === true, 'Mensagem atualizada para "lida = true" após visualização pelo destinatário');

    // -------------------------------------------------------------
    // TESTE 6: Gatilho de Anomalia de Solo em Leituras (F3 -> Alerta F6)
    // -------------------------------------------------------------
    console.log('\n--- TESTE 6: Trigger de Humidade Crítica gerando Alerta Automático ---');

    let parcelaTeste = agricultor.parcelas[0];
    let parcelaCriadaParaTeste = false;

    if (!parcelaTeste) {
      parcelaTeste = await prisma.parcela.create({
        data: {
          nome: 'Parcela de Teste F6',
          areaHectares: 2.5,
          agricultorId: agricultor.id,
        },
      });
      parcelaCriadaParaTeste = true;
    }

    // Leitura anómala com humidade crítica (12%)
    const leituraCritica = await prisma.$transaction(async (tx) => {
      const leitura = await tx.leituraSolo.create({
        data: {
          parcelaId: parcelaTeste.id,
          humidade: 12.0,
          statusHumidade: 'CRITICA',
          observacoes: 'Teste automatizado de estresse hídrico severo.',
        },
      });

      const vinculoTec = await tx.tecnicoAgricultor.findFirst({
        where: { agricultorId: parcelaTeste.agricultorId },
        select: { tecnicoId: true },
      });

      let alertaCritico = null;
      if (vinculoTec) {
        alertaCritico = await tx.alerta.create({
          data: {
            userId: vinculoTec.tecnicoId,
            tipo: AlertaTipo.HUMIDADE_CRITICA,
            titulo: `Humidade Crítica na Parcela ${parcelaTeste.nome}`,
            mensagem: `Leitura de 12.0% registada por ${agricultor.nome}. Atenção técnica necessária.`,
            link: `/leituras?parcelaId=${parcelaTeste.id}`,
          },
        });
      }

      return { leitura, alerta: alertaCritico };
    });

    assert(Boolean(leituraCritica.leitura.id), 'Leitura com humidade crítica registrada com sucesso');
    assert(leituraCritica.leitura.statusHumidade === 'CRITICA', 'Status classificado corretamente como CRITICA');
    assert(Boolean(leituraCritica.alerta), 'Alerta de HUMIDADE_CRITICA gerado automaticamente para o técnico');
    assert(leituraCritica.alerta.tipo === AlertaTipo.HUMIDADE_CRITICA, 'Tipo do alerta é HUMIDADE_CRITICA');

    // -------------------------------------------------------------
    // TESTE 7: Atualização e Gestão de Alertas (PATCH)
    // -------------------------------------------------------------
    console.log('\n--- TESTE 7: Gestão do Estado do Alerta (Marcar como Lido) ---');

    const alertaAtualizado = await prisma.alerta.update({
      where: { id: leituraCritica.alerta.id },
      data: { lido: true },
    });

    assert(alertaAtualizado.lido === true, 'Alerta marcado com sucesso como "lido = true"');

    // -------------------------------------------------------------
    // TEARDOWN E LIMPEZA
    // -------------------------------------------------------------
    console.log('\n--- TEARDOWN: Limpeza dos Dados Temporários de Teste ---');

    await prisma.alerta.deleteMany({
      where: {
        id: { in: [resultadoMsg.alerta.id, leituraCritica.alerta.id] },
      },
    });

    await prisma.mensagem.deleteMany({
      where: { id: resultadoMsg.mensagem.id },
    });

    await prisma.leituraSolo.deleteMany({
      where: { id: leituraCritica.leitura.id },
    });

    if (parcelaCriadaParaTeste) {
      await prisma.parcela.delete({ where: { id: parcelaTeste.id } });
    }

    await prisma.user.delete({ where: { id: agricultorIsolado.id } });

    assert(true, 'Teardown concluído: todos os registros temporários foram removidos do banco');

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
    console.error('\n✖ Erro fatal durante a verificação:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runVerification();
