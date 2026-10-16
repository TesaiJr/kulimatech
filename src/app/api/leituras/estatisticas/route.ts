// src/app/api/leituras/estatisticas/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/rbac/guard';
import { createSuccessResponse } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/errors';
import { UserRole } from '@prisma/client';

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
      baseWhere.parcela = { agricultorId: authUser.userId };
    } else if (authUser.role === UserRole.TECNICO) {
      const vinculos = await prisma.tecnicoAgricultor.findMany({
        where: { tecnicoId: authUser.userId },
        select: { agricultorId: true },
      });
      const idsAcompanhados = vinculos.map((v) => v.agricultorId);
      baseWhere.parcela = { agricultorId: { in: idsAcompanhados } };
    }

    const agora = new Date();
    const seteDiasAtras = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
    const trintaDiasAtras = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalLeituras,
      pendentesValidacao,
      leiturasCriticas,
      leiturasOptimas,
      leiturasBaixas,
      leiturasExcessivas,
      avg7Dias,
      avg30Dias,
    ] = await Promise.all([
      prisma.leituraSolo.count({ where: baseWhere }),
      prisma.leituraSolo.count({ where: { ...baseWhere, validadoPorTecnico: false } }),
      prisma.leituraSolo.count({ where: { ...baseWhere, statusHumidade: 'CRITICA' } }),
      prisma.leituraSolo.count({ where: { ...baseWhere, statusHumidade: 'OPTIMA' } }),
      prisma.leituraSolo.count({ where: { ...baseWhere, statusHumidade: 'BAIXA' } }),
      prisma.leituraSolo.count({ where: { ...baseWhere, statusHumidade: 'EXCESSIVA' } }),
      prisma.leituraSolo.aggregate({
        where: { ...baseWhere, dataLeitura: { gte: seteDiasAtras } },
        _avg: { humidade: true },
      }),
      prisma.leituraSolo.aggregate({
        where: { ...baseWhere, dataLeitura: { gte: trintaDiasAtras } },
        _avg: { humidade: true },
      }),
    ]);

    const estatisticas = {
      totalLeituras,
      pendentesValidacao,
      leiturasCriticas,
      mediaHumidade7Dias: avg7Dias._avg.humidade ? Number(avg7Dias._avg.humidade.toFixed(1)) : 0,
      mediaHumidade30Dias: avg30Dias._avg.humidade ? Number(avg30Dias._avg.humidade.toFixed(1)) : 0,
      distribuicaoStatus: {
        CRITICA: leiturasCriticas,
        BAIXA: leiturasBaixas,
        OPTIMA: leiturasOptimas,
        EXCESSIVA: leiturasExcessivas,
      },
    };

    return createSuccessResponse(estatisticas, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
