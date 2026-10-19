// src/app/api/ocorrencias/[id]/resolver/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/rbac/guard';
import { createSuccessResponse } from '@/lib/api/response';
import { handleApiError, AppError } from '@/lib/api/errors';
import { UserRole, AlertaTipo } from '@prisma/client';
import { resolverOcorrenciaSchema } from '@/features/pragas/schemas/pragaSchemas';
import { chatEvents, CHAT_EVENT_TYPES } from '@/lib/events/chatEvents';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const authUser = requireAuth(req);
    const { id } = await params;

    // Apenas Técnicos ou Administradores podem emitir parecer técnico
    if (authUser.role !== UserRole.TECNICO && authUser.role !== UserRole.ADMIN) {
      throw new AppError(
        'Apenas técnicos do SDAE ou administradores têm permissão para resolver ocorrências fitossanitárias.',
        403,
        'FORBIDDEN'
      );
    }

    const body = await req.json();
    const data = resolverOcorrenciaSchema.parse(body);

    const ocorrencia = await prisma.ocorrenciaPraga.findUnique({
      where: { id },
      include: {
        parcela: {
          select: {
            id: true,
            nome: true,
            agricultorId: true,
          },
        },
      },
    });

    if (!ocorrencia) {
      throw new AppError('Ocorrência fitossanitária não encontrada.', 404, 'OCORRENCIA_NOT_FOUND');
    }

    // Se for técnico, garantir vínculo de carteira com o agricultor
    if (authUser.role === UserRole.TECNICO) {
      const vinculo = await prisma.tecnicoAgricultor.findFirst({
        where: {
          tecnicoId: authUser.userId,
          agricultorId: ocorrencia.agricultorId,
        },
      });

      if (!vinculo) {
        throw new AppError(
          'Não tem permissão para emitir parecer técnico a agricultores fora da sua carteira atribuída.',
          403,
          'FORBIDDEN'
        );
      }
    }

    // Transação de resolução e emissão de alerta de retorno
    const ocorrenciaAtualizada = await prisma.$transaction(async (tx) => {
      const atualizada = await tx.ocorrenciaPraga.update({
        where: { id },
        data: {
          status: data.status,
          parecerTecnico: data.parecerTecnico,
          acaoRecomendada: data.acaoRecomendada || null,
          tecnicoResolutorId: authUser.userId,
          dataResolucao: new Date(),
        },
        include: {
          parcela: {
            select: { id: true, nome: true },
          },
          praga: {
            select: { id: true, nome: true },
          },
          agricultor: {
            select: { id: true, nome: true, email: true },
          },
          tecnicoResolutor: {
            select: { id: true, nome: true, email: true },
          },
        },
      });

      // Disparar notificação para o agricultor
      const alerta = await tx.alerta.create({
        data: {
          userId: ocorrencia.agricultorId,
          tipo: AlertaTipo.SISTEMA,
          titulo: `Parecer Técnico: Ocorrência na Parcela ${ocorrencia.parcela.nome}`,
          mensagem: `O técnico do SDAE avaliou a ocorrência fitossanitária (Status: ${data.status}). Parecer: ${data.parecerTecnico}.`,
          link: '/pragas/ocorrencias',
        },
      });

      return { atualizada, alerta };
    });

    try {
      chatEvents.emit(CHAT_EVENT_TYPES.NEW_ALERTA, ocorrenciaAtualizada.alerta);
    } catch (err) {
      console.error('[Event Error] Falha ao emitir alerta SSE de resolução:', err);
    }

    return createSuccessResponse(ocorrenciaAtualizada.atualizada, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
