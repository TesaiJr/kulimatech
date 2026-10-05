// src/app/api/alertas/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/rbac/guard';
import { createSuccessResponse } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/errors';
import { AlertaTipo } from '@prisma/client';

/**
 * GET /api/alertas
 * Lista as notificações e alertas com isolamento por perfil (RBAC):
 * - AGRICULTOR e TECNICO: visualizam exclusivamente os seus próprios alertas.
 * - ADMIN: visão consolidada do sistema (pode filtrar por utilizador ou ver geral).
 */
export async function GET(req: NextRequest) {
  try {
    const session = requireAuth(req);
    const { searchParams } = new URL(req.url);

    const lidoParam = searchParams.get('lido');
    const tipoParam = searchParams.get('tipo')?.trim().toUpperCase();
    const targetUserId = searchParams.get('userId')?.trim();
    const limiteParam = searchParams.get('limite');

    const take = limiteParam ? Math.min(Math.max(parseInt(limiteParam, 10) || 50, 1), 100) : 50;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {};

    if (session.role === 'ADMIN') {
      if (targetUserId) {
        whereClause.userId = targetUserId;
      }
    } else {
      whereClause.userId = session.userId;
    }

    if (lidoParam !== null && lidoParam !== undefined && lidoParam !== '') {
      whereClause.lido = lidoParam === 'true';
    }

    if (tipoParam && Object.values(AlertaTipo).includes(tipoParam as AlertaTipo)) {
      whereClause.tipo = tipoParam as AlertaTipo;
    }

    // Consulta de alertas e contagem de não lidos em paralelo
    const userUnreadFilter =
      session.role === 'ADMIN' && targetUserId
        ? { userId: targetUserId, lido: false }
        : session.role === 'ADMIN'
        ? { lido: false }
        : { userId: session.userId, lido: false };

    const [alertas, totalNaoLidos] = await Promise.all([
      prisma.alerta.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take,
      }),
      prisma.alerta.count({
        where: userUnreadFilter,
      }),
    ]);

    return createSuccessResponse(
      {
        alertas,
        totalNaoLidos,
      },
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/alertas
 * Marca todos os alertas pendentes do utilizador autenticado como lidos.
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = requireAuth(req);

    const updated = await prisma.alerta.updateMany({
      where: {
        userId: session.userId,
        lido: false,
      },
      data: {
        lido: true,
      },
    });

    return createSuccessResponse(
      {
        marcadosComoLidos: updated.count,
        message: `${updated.count} alerta(s) marcado(s) como lido(s).`,
      },
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}
