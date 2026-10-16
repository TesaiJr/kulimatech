// src/app/api/culturas/[id]/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireRole } from '@/lib/rbac/guard';
import { createSuccessResponse } from '@/lib/api/response';
import { handleApiError, AppError } from '@/lib/api/errors';
import { updateCulturaSchema } from '@/features/culturas/schemas/culturaSchemas';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/culturas/[id]
 * Detalhes da cultura agronómica.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    requireAuth(req);
    const { id } = await params;

    const cultura = await prisma.cultura.findUnique({
      where: { id },
      include: {
        _count: {
          select: { recomendacoes: true },
        },
      },
    });

    if (!cultura) {
      throw new AppError('Cultura agronómica não encontrada.', 404, 'CULTURA_NOT_FOUND');
    }

    return createSuccessResponse(cultura, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/culturas/[id]
 * Atualização dos dados e limiares da cultura (apenas ADMIN).
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    requireRole(req, ['ADMIN']);
    const { id } = await params;
    const body = await req.json();

    const validatedData = updateCulturaSchema.parse(body);

    const existing = await prisma.cultura.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError('Cultura agronómica não encontrada.', 404, 'CULTURA_NOT_FOUND');
    }

    // Se alterou o nome, verificar duplicidade
    if (validatedData.nome && validatedData.nome !== existing.nome) {
      const duplicate = await prisma.cultura.findUnique({
        where: { nome: validatedData.nome },
      });
      if (duplicate) {
        throw new AppError(
          `Já existe outra cultura com o nome "${validatedData.nome}".`,
          409,
          'CULTURA_NAME_CONFLICT'
        );
      }
    }

    const culturaAtualizada = await prisma.cultura.update({
      where: { id },
      data: validatedData,
    });

    return createSuccessResponse(culturaAtualizada, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/culturas/[id]
 * Remoção de cultura do catálogo (apenas ADMIN).
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    requireRole(req, ['ADMIN']);
    const { id } = await params;

    const existing = await prisma.cultura.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            recomendacoes: true,
            pragas: true,
          },
        },
      },
    });

    if (!existing) {
      throw new AppError('Cultura agronómica não encontrada.', 404, 'CULTURA_NOT_FOUND');
    }

    if (existing._count.recomendacoes > 0) {
      throw new AppError(
        `Não é possível eliminar a cultura "${existing.nome}" pois existem ${existing._count.recomendacoes} recomendações técnicas associadas a ela no sistema.`,
        400,
        'CULTURA_HAS_RECOMMENDATIONS'
      );
    }

    if (existing._count.pragas > 0) {
      throw new AppError(
        `Não é possível eliminar a cultura "${existing.nome}" pois existem ${existing._count.pragas} pragas cadastradas associadas a ela no catálogo fitossanitário.`,
        400,
        'CULTURA_HAS_PESTS'
      );
    }

    await prisma.cultura.delete({
      where: { id },
    });

    return createSuccessResponse({ message: `Cultura "${existing.nome}" eliminada com sucesso.` }, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
