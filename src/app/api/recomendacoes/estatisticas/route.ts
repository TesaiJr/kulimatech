// src/app/api/recomendacoes/estatisticas/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/rbac/guard';
import { createSuccessResponse } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/errors';
import { StatusRecomendacao } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const session = requireAuth(req);
    const { searchParams } = new URL(req.url);
    const parcelaId = searchParams.get('parcelaId')?.trim();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const baseWhere: any = {};

    if (session.role === 'AGRICULTOR') {
      baseWhere.parcela = { agricultorId: session.userId };
    } else if (session.role === 'TECNICO') {
      const vinculos = await prisma.tecnicoAgricultor.findMany({
        where: { tecnicoId: session.userId },
        select: { agricultorId: true },
      });
      const agricultoresIds = vinculos.map((v) => v.agricultorId);

      baseWhere.OR = [
        { tecnicoId: session.userId },
        { parcela: { agricultorId: { in: agricultoresIds } } },
      ];
    }

    if (parcelaId && parcelaId !== 'TODOS') {
      baseWhere.parcelaId = parcelaId;
    }

    const [total, pendentes, aplicadas, arquivadas] = await Promise.all([
      prisma.recomendacao.count({ where: baseWhere }),
      prisma.recomendacao.count({
        where: { ...baseWhere, status: StatusRecomendacao.PENDENTE },
      }),
      prisma.recomendacao.count({
        where: { ...baseWhere, status: StatusRecomendacao.APLICADA },
      }),
      prisma.recomendacao.count({
        where: { ...baseWhere, status: StatusRecomendacao.ARQUIVADA },
      }),
    ]);

    const estatisticas = {
      total,
      pendentes,
      aplicadas,
      arquivadas,
    };

    return createSuccessResponse(estatisticas, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
