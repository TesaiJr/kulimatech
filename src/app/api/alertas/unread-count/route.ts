// src/app/api/alertas/unread-count/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/rbac/guard';
import { createSuccessResponse } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/errors';

/**
 * GET /api/alertas/unread-count
 * Rota ultra-leve (< 50 bytes) destinada a polling frequente (RNF04 - a cada 30 segundos)
 * Retorna exclusivamente a contagem de alertas não lidos do utilizador autenticado.
 */
export async function GET(req: NextRequest) {
  let session;
  try {
    session = requireAuth(req);
  } catch (authError) {
    return handleApiError(authError);
  }

  try {
    const count = await prisma.alerta.count({
      where: {
        userId: session.userId,
        lido: false,
      },
    });

    return createSuccessResponse({ count }, 200);
  } catch (dbError) {
    // Resiliência para conexões móveis e resets de PgBouncer:
    // Retorna { count: 0 } gracioso em vez de falhar com 500 no polling frequente de 30s
    console.warn('[Alertas Unread-Count] Falha transitória de consulta:', (dbError as Error)?.message);
    return createSuccessResponse({ count: 0 }, 200);
  }
}
