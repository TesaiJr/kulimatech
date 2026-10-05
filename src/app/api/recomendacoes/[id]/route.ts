// src/app/api/recomendacoes/[id]/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/rbac/guard';
import { createSuccessResponse } from '@/lib/api/response';
import { handleApiError, AppError } from '@/lib/api/errors';
import { updateStatusRecomendacaoSchema } from '@/features/culturas/schemas/culturaSchemas';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/recomendacoes/[id]
 * Detalhes de uma recomendação técnica específica.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = requireAuth(req);
    const { id } = await params;

    const recomendacao = await prisma.recomendacao.findUnique({
      where: { id },
      include: {
        tecnico: {
          select: { id: true, nome: true, email: true, telefone: true },
        },
        cultura: {
          select: { id: true, nome: true, humidadeMin: true, humidadeMax: true },
        },
        parcela: {
          select: {
            id: true,
            nome: true,
            areaHectares: true,
            tipoSolo: true,
            agricultorId: true,
            agricultor: {
              select: { id: true, nome: true, telefone: true, zonaAtuacao: true },
            },
          },
        },
      },
    });

    if (!recomendacao) {
      throw new AppError('Recomendação técnica não encontrada.', 404, 'RECOMENDACAO_NOT_FOUND');
    }

    // Validação de acesso por papel
    if (session.role === 'AGRICULTOR' && recomendacao.parcela.agricultorId !== session.userId) {
      throw new AppError('Não possui permissão para visualizar esta recomendação.', 403, 'FORBIDDEN');
    }

    return createSuccessResponse(recomendacao, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/recomendacoes/[id]
 * Atualização do status da recomendação (ex: agricultor marca como APLICADA, técnico marca como ARQUIVADA).
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = requireAuth(req);
    const { id } = await params;
    const body = await req.json();

    const validatedData = updateStatusRecomendacaoSchema.parse(body);

    const recomendacao = await prisma.recomendacao.findUnique({
      where: { id },
      include: {
        parcela: {
          select: { id: true, agricultorId: true, nome: true },
        },
      },
    });

    if (!recomendacao) {
      throw new AppError('Recomendação técnica não encontrada.', 404, 'RECOMENDACAO_NOT_FOUND');
    }

    // Regras de RBAC para alteração de status
    if (session.role === 'AGRICULTOR') {
      // Agricultor só pode alterar recomendações das suas próprias parcelas
      if (recomendacao.parcela.agricultorId !== session.userId) {
        throw new AppError('Não tem permissão para alterar esta recomendação.', 403, 'FORBIDDEN');
      }

      // Agricultor só pode marcar como APLICADA
      if (validatedData.status !== 'APLICADA') {
        throw new AppError('O agricultor apenas pode atualizar o estado para APLICADA.', 400, 'INVALID_STATUS_TRANSITION');
      }
    } else if (session.role === 'TECNICO') {
      // Técnico só pode alterar recomendações emitidas por ele
      if (recomendacao.tecnicoId !== session.userId) {
        throw new AppError('Apenas o técnico emissor pode editar ou arquivar esta recomendação.', 403, 'FORBIDDEN');
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatePayload: any = {
      status: validatedData.status,
    };

    // Técnico ou Admin podem atualizar o parecer se enviado
    if (validatedData.parecer && session.role !== 'AGRICULTOR') {
      updatePayload.parecer = validatedData.parecer;
    }

    const atualizada = await prisma.recomendacao.update({
      where: { id },
      data: updatePayload,
      include: {
        tecnico: { select: { id: true, nome: true } },
        cultura: { select: { id: true, nome: true } },
        parcela: { select: { id: true, nome: true } },
      },
    });

    return createSuccessResponse(atualizada, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
