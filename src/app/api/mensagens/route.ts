// src/app/api/mensagens/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/rbac/guard';
import { createSuccessResponse } from '@/lib/api/response';
import { handleApiError, AppError } from '@/lib/api/errors';
import { enviarMensagemSchema } from '@/features/comunicacao/schemas/comunicacaoSchemas';
import { AlertaTipo } from '@prisma/client';

/**
 * GET /api/mensagens
 * Canal de mensagens diretas entre Agricultor e Técnico SDAE (RBAC Multi-tenant):
 * - Se ?interlocutorId=<id>: retorna histórico de mensagens com o interlocutor e marca lidas.
 * - Sem interlocutorId: retorna resumo de todas as conversas ativas com contagem de não lidas.
 */
export async function GET(req: NextRequest) {
  try {
    const session = requireRole(req, ['AGRICULTOR', 'TECNICO']);
    const { searchParams } = new URL(req.url);
    const interlocutorId = searchParams.get('interlocutorId')?.trim();

    if (interlocutorId) {
      // 1. Validar se o interlocutor possui vínculo legal de acompanhamento
      if (session.role === 'AGRICULTOR') {
        const vinculo = await prisma.tecnicoAgricultor.findUnique({
          where: {
            tecnicoId_agricultorId: {
              tecnicoId: interlocutorId,
              agricultorId: session.userId,
            },
          },
        });

        if (!vinculo) {
          throw new AppError(
            'Não possui vínculo de acompanhamento técnico com o utilizador indicado.',
            403,
            'FORBIDDEN_INTERLOCUTOR'
          );
        }
      } else if (session.role === 'TECNICO') {
        const vinculo = await prisma.tecnicoAgricultor.findUnique({
          where: {
            tecnicoId_agricultorId: {
              tecnicoId: session.userId,
              agricultorId: interlocutorId,
            },
          },
        });

        if (!vinculo) {
          throw new AppError(
            'O agricultor indicado não está registado sob o seu acompanhamento técnico.',
            403,
            'FORBIDDEN_INTERLOCUTOR'
          );
        }
      }

      // 2. Buscar histórico de mensagens ordenado cronologicamente
      const mensagens = await prisma.mensagem.findMany({
        where: {
          OR: [
            { remetenteId: session.userId, destinatarioId: interlocutorId },
            { remetenteId: interlocutorId, destinatarioId: session.userId },
          ],
        },
        orderBy: { createdAt: 'asc' },
        include: {
          remetente: {
            select: { id: true, nome: true, email: true, role: true, telefone: true, zonaAtuacao: true },
          },
          destinatario: {
            select: { id: true, nome: true, email: true, role: true, telefone: true, zonaAtuacao: true },
          },
        },
      });

      // 3. Atualizar mensagens recebidas não lidas para 'lida: true'
      await prisma.mensagem.updateMany({
        where: {
          remetenteId: interlocutorId,
          destinatarioId: session.userId,
          lida: false,
        },
        data: {
          lida: true,
        },
      });

      return createSuccessResponse(mensagens, 200);
    }

    // Sem interlocutorId: listar todas as conversas possíveis baseadas nos vínculos
    if (session.role === 'AGRICULTOR') {
      const vinculos = await prisma.tecnicoAgricultor.findMany({
        where: { agricultorId: session.userId },
        include: {
          tecnico: {
            select: { id: true, nome: true, email: true, role: true, telefone: true, zonaAtuacao: true },
          },
        },
      });

      const conversas = await Promise.all(
        vinculos.map(async (v) => {
          const ultimaMensagem = await prisma.mensagem.findFirst({
            where: {
              OR: [
                { remetenteId: session.userId, destinatarioId: v.tecnico.id },
                { remetenteId: v.tecnico.id, destinatarioId: session.userId },
              ],
            },
            orderBy: { createdAt: 'desc' },
          });

          const totalNaoLidas = await prisma.mensagem.count({
            where: {
              remetenteId: v.tecnico.id,
              destinatarioId: session.userId,
              lida: false,
            },
          });

          return {
            interlocutor: v.tecnico,
            ultimaMensagem: ultimaMensagem
              ? {
                  id: ultimaMensagem.id,
                  conteudo: ultimaMensagem.conteudo,
                  createdAt: ultimaMensagem.createdAt.toISOString(),
                  enviadaPorMim: ultimaMensagem.remetenteId === session.userId,
                }
              : null,
            totalNaoLidas,
          };
        })
      );

      return createSuccessResponse(conversas, 200);
    } else {
      // Perfil TECNICO
      const vinculos = await prisma.tecnicoAgricultor.findMany({
        where: { tecnicoId: session.userId },
        include: {
          agricultor: {
            select: { id: true, nome: true, email: true, role: true, telefone: true, zonaAtuacao: true },
          },
        },
      });

      const conversas = await Promise.all(
        vinculos.map(async (v) => {
          const ultimaMensagem = await prisma.mensagem.findFirst({
            where: {
              OR: [
                { remetenteId: session.userId, destinatarioId: v.agricultor.id },
                { remetenteId: v.agricultor.id, destinatarioId: session.userId },
              ],
            },
            orderBy: { createdAt: 'desc' },
          });

          const totalNaoLidas = await prisma.mensagem.count({
            where: {
              remetenteId: v.agricultor.id,
              destinatarioId: session.userId,
              lida: false,
            },
          });

          return {
            interlocutor: v.agricultor,
            ultimaMensagem: ultimaMensagem
              ? {
                  id: ultimaMensagem.id,
                  conteudo: ultimaMensagem.conteudo,
                  createdAt: ultimaMensagem.createdAt.toISOString(),
                  enviadaPorMim: ultimaMensagem.remetenteId === session.userId,
                }
              : null,
            totalNaoLidas,
          };
        })
      );

      return createSuccessResponse(conversas, 200);
    }
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/mensagens
 * Envia uma mensagem direta e dispara automaticamente uma notificação de Alerta.
 */
export async function POST(req: NextRequest) {
  try {
    const session = requireRole(req, ['AGRICULTOR', 'TECNICO']);
    const body = await req.json();
    const validatedData = enviarMensagemSchema.parse(body);

    if (validatedData.destinatarioId === session.userId) {
      throw new AppError('Não é permitido enviar mensagens para si próprio.', 400, 'INVALID_RECIPIENT');
    }

    // 1. Validar existência e papel do destinatário
    const destinatario = await prisma.user.findUnique({
      where: { id: validatedData.destinatarioId },
      select: { id: true, nome: true, email: true, role: true },
    });

    if (!destinatario) {
      throw new AppError('Destinatário não encontrado no sistema.', 404, 'RECIPIENT_NOT_FOUND');
    }

    // 2. Validação estrita de vínculo mútuo
    if (session.role === 'AGRICULTOR') {
      const vinculo = await prisma.tecnicoAgricultor.findUnique({
        where: {
          tecnicoId_agricultorId: {
            tecnicoId: validatedData.destinatarioId,
            agricultorId: session.userId,
          },
        },
      });

      if (!vinculo) {
        throw new AppError(
          `Apenas pode enviar mensagens para o técnico SDAE que acompanha as suas parcelas. O utilizador "${destinatario.nome}" não está vinculado.`,
          403,
          'NOT_ASSIGNED_TECHNICIAN'
        );
      }
    } else if (session.role === 'TECNICO') {
      const vinculo = await prisma.tecnicoAgricultor.findUnique({
        where: {
          tecnicoId_agricultorId: {
            tecnicoId: session.userId,
            agricultorId: validatedData.destinatarioId,
          },
        },
      });

      if (!vinculo) {
        throw new AppError(
          `Apenas pode enviar mensagens para agricultores sob o seu acompanhamento técnico. O agricultor "${destinatario.nome}" não está na sua carteira.`,
          403,
          'NOT_SUPERVISED_FARMER'
        );
      }
    }

    // 3. Persistência atômica da mensagem e disparo do alerta
    const resultado = await prisma.$transaction(async (tx) => {
      const novaMensagem = await tx.mensagem.create({
        data: {
          remetenteId: session.userId,
          destinatarioId: validatedData.destinatarioId,
          conteudo: validatedData.conteudo,
        },
        include: {
          remetente: {
            select: { id: true, nome: true, email: true, role: true, telefone: true },
          },
          destinatario: {
            select: { id: true, nome: true, email: true, role: true, telefone: true },
          },
        },
      });

      const previewConteudo =
        validatedData.conteudo.length > 70
          ? `${validatedData.conteudo.substring(0, 70)}...`
          : validatedData.conteudo;

      await tx.alerta.create({
        data: {
          userId: validatedData.destinatarioId,
          tipo: AlertaTipo.NOVA_MENSAGEM,
          titulo: `Nova mensagem de ${session.nome}`,
          mensagem: previewConteudo,
          link: `/mensagens?interlocutorId=${session.userId}`,
        },
      });

      return novaMensagem;
    });

    return createSuccessResponse(resultado, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
