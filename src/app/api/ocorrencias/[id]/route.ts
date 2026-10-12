// src/app/api/ocorrencias/[id]/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/rbac/guard';
import { createSuccessResponse } from '@/lib/api/response';
import { handleApiError, AppError } from '@/lib/api/errors';
import { UserRole } from '@prisma/client';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const authUser = requireAuth(req);
    const { id } = await params;

    const ocorrencia = await prisma.ocorrenciaPraga.findUnique({
      where: { id },
      include: {
        parcela: {
          select: {
            id: true,
            nome: true,
            areaHectares: true,
            tipoSolo: true,
            localizacao: true,
          },
        },
        praga: {
          select: {
            id: true,
            nome: true,
            nomeCientifico: true,
            descricao: true,
            sintomas: true,
            metodosCombate: true,
            severidadePadrao: true,
          },
        },
        agricultor: {
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
            zonaAtuacao: true,
          },
        },
        tecnicoResolutor: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });

    if (!ocorrencia) {
      throw new AppError('Ocorrência fitossanitária não encontrada.', 404, 'OCORRENCIA_NOT_FOUND');
    }

    // RBAC check
    if (authUser.role === UserRole.AGRICULTOR && ocorrencia.agricultorId !== authUser.userId) {
      throw new AppError('Acesso negado a esta ocorrência.', 403, 'FORBIDDEN');
    }

    if (authUser.role === UserRole.TECNICO) {
      const vinculo = await prisma.tecnicoAgricultor.findFirst({
        where: {
          tecnicoId: authUser.userId,
          agricultorId: ocorrencia.agricultorId,
        },
      });
      if (!vinculo) {
        throw new AppError('Não tem acesso a ocorrências deste produtor.', 403, 'FORBIDDEN');
      }
    }

    return createSuccessResponse(ocorrencia, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
