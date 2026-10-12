// src/app/api/pragas/[id]/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/rbac/guard';
import { createSuccessResponse } from '@/lib/api/response';
import { handleApiError, AppError } from '@/lib/api/errors';
import { UserRole } from '@prisma/client';
import { updatePragaSchema } from '@/features/pragas/schemas/pragaSchemas';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    requireAuth(req);
    const { id } = await params;

    const praga = await prisma.praga.findUnique({
      where: { id },
      include: {
        cultura: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });

    if (!praga) {
      throw new AppError('Praga agrícola não encontrada.', 404, 'PRAGA_NOT_FOUND');
    }

    return createSuccessResponse(praga, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const authUser = requireAuth(req);
    const { id } = await params;

    if (authUser.role !== UserRole.ADMIN) {
      throw new AppError('Apenas administradores podem atualizar o catálogo mestre de pragas.', 403, 'FORBIDDEN');
    }

    const body = await req.json();
    const data = updatePragaSchema.parse(body);

    const pragaExistente = await prisma.praga.findUnique({ where: { id } });
    if (!pragaExistente) {
      throw new AppError('Praga não encontrada para atualização.', 404, 'PRAGA_NOT_FOUND');
    }

    const pragaAtualizada = await prisma.praga.update({
      where: { id },
      data: {
        ...(data.nome ? { nome: data.nome } : {}),
        ...(data.nomeCientifico !== undefined ? { nomeCientifico: data.nomeCientifico } : {}),
        ...(data.descricao ? { descricao: data.descricao } : {}),
        ...(data.sintomas ? { sintomas: data.sintomas } : {}),
        ...(data.metodosCombate ? { metodosCombate: data.metodosCombate } : {}),
        ...(data.severidadePadrao ? { severidadePadrao: data.severidadePadrao } : {}),
        ...(data.culturaId !== undefined ? { culturaId: data.culturaId } : {}),
      },
      include: {
        cultura: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });

    return createSuccessResponse(pragaAtualizada, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const authUser = requireAuth(req);
    const { id } = await params;

    if (authUser.role !== UserRole.ADMIN) {
      throw new AppError('Apenas administradores podem remover itens do catálogo de pragas.', 403, 'FORBIDDEN');
    }

    const pragaExistente = await prisma.praga.findUnique({ where: { id } });
    if (!pragaExistente) {
      throw new AppError('Praga não encontrada para remoção.', 404, 'PRAGA_NOT_FOUND');
    }

    await prisma.praga.delete({ where: { id } });

    return createSuccessResponse({ message: 'Praga removida com sucesso do catálogo.' }, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
