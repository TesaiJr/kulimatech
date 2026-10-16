// src/app/api/ocorrencias/estatisticas/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/rbac/guard';
import { createSuccessResponse } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/errors';
import { UserRole, StatusOcorrencia, SeveridadePraga } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const authUser = requireAuth(req);
    const { searchParams } = new URL(req.url);
    const parcelaId = searchParams.get('parcelaId');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const baseWhere: any = {};

    if (parcelaId && parcelaId !== 'TODOS') {
      baseWhere.parcelaId = parcelaId;
    }

    if (authUser.role === UserRole.AGRICULTOR) {
      baseWhere.agricultorId = authUser.userId;
    } else if (authUser.role === UserRole.TECNICO) {
      const vinculos = await prisma.tecnicoAgricultor.findMany({
        where: { tecnicoId: authUser.userId },
        select: { agricultorId: true },
      });
      const idsAcompanhados = vinculos.map((v) => v.agricultorId);
      baseWhere.agricultorId = { in: idsAcompanhados };
    }

    const [total, abertas, emAnalise, resolvidas, criticas] = await Promise.all([
      prisma.ocorrenciaPraga.count({ where: baseWhere }),
      prisma.ocorrenciaPraga.count({
        where: { ...baseWhere, status: StatusOcorrencia.ABERTA },
      }),
      prisma.ocorrenciaPraga.count({
        where: { ...baseWhere, status: StatusOcorrencia.EM_ANALISE },
      }),
      prisma.ocorrenciaPraga.count({
        where: { ...baseWhere, status: StatusOcorrencia.RESOLVIDA },
      }),
      prisma.ocorrenciaPraga.count({
        where: {
          ...baseWhere,
          severidade: SeveridadePraga.CRITICA,
          status: { not: StatusOcorrencia.RESOLVIDA },
        },
      }),
    ]);

    const estatisticas = {
      total,
      abertas,
      emAnalise,
      resolvidas,
      criticas,
    };

    return createSuccessResponse(estatisticas, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
