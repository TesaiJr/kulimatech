// src/app/api/alertas/[id]/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/rbac/guard';
import { createSuccessResponse } from '@/lib/api/response';
import { handleApiError, AppError } from '@/lib/api/errors';
import { atualizarAlertaSchema } from '@/features/comunicacao/schemas/comunicacaoSchemas';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/alertas/[id]
 * Atualiza o estado de um alerta (ex: marcar como lido).
 * Restrito ao proprietário do alerta ou ADMIN.
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = requireAuth(req);
    const { id } = await params;
    const body = await req.json();

    const validatedData = atualizarAlertaSchema.parse(body);

    const alerta = await prisma.alerta.findUnique({
      where: { id },
    });

    if (!alerta) {
      throw new AppError('Alerta não encontrado.', 404, 'ALERTA_NOT_FOUND');
    }

    if (session.role !== 'ADMIN' && alerta.userId !== session.userId) {
      throw new AppError(
        'Acesso negado. Não tem permissão para alterar este alerta.',
        403,
        'FORBIDDEN'
      );
    }

    const alertaAtualizado = await prisma.alerta.update({
      where: { id },
      data: {
        lido: validatedData.lido,
      },
    });

    return createSuccessResponse(alertaAtualizado, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/alertas/[id]
 * Exclui um alerta específico.
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = requireAuth(req);
    const { id } = await params;

    const alerta = await prisma.alerta.findUnique({
      where: { id },
    });

    if (!alerta) {
      throw new AppError('Alerta não encontrado.', 404, 'ALERTA_NOT_FOUND');
    }

    if (session.role !== 'ADMIN' && alerta.userId !== session.userId) {
      throw new AppError(
        'Acesso negado. Não tem permissão para eliminar este alerta.',
        403,
        'FORBIDDEN'
      );
    }

    await prisma.alerta.delete({
      where: { id },
    });

    return createSuccessResponse(
      { message: 'Alerta removido com sucesso.' },
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}
