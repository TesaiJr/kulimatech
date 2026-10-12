// src/app/api/pragas/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/rbac/guard';
import { createSuccessResponse } from '@/lib/api/response';
import { handleApiError, AppError } from '@/lib/api/errors';
import { UserRole } from '@prisma/client';
import { createPragaSchema } from '@/features/pragas/schemas/pragaSchemas';

export async function GET(req: NextRequest) {
  try {
    requireAuth(req);
    const { searchParams } = new URL(req.url);
    const culturaId = searchParams.get('culturaId');
    const severidade = searchParams.get('severidade');
    const search = searchParams.get('search');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {};

    if (culturaId && culturaId !== 'TODOS') {
      whereClause.culturaId = culturaId;
    }

    if (severidade && severidade !== 'TODOS') {
      whereClause.severidadePadrao = severidade;
    }

    if (search?.trim()) {
      const q = search.trim();
      whereClause.OR = [
        { nome: { contains: q, mode: 'insensitive' } },
        { nomeCientifico: { contains: q, mode: 'insensitive' } },
        { sintomas: { contains: q, mode: 'insensitive' } },
        { metodosCombate: { contains: q, mode: 'insensitive' } },
      ];
    }

    const pragas = await prisma.praga.findMany({
      where: whereClause,
      include: {
        cultura: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
      orderBy: { nome: 'asc' },
    });

    return createSuccessResponse(pragas, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = requireAuth(req);

    if (authUser.role !== UserRole.ADMIN) {
      throw new AppError(
        'Apenas administradores podem cadastrar pragas no catálogo mestre.',
        403,
        'FORBIDDEN'
      );
    }

    const body = await req.json();
    const data = createPragaSchema.parse(body);

    const existente = await prisma.praga.findUnique({
      where: { nome: data.nome },
    });

    if (existente) {
      throw new AppError('Já existe uma praga com este nome cadastrada no catálogo.', 409, 'PRAGA_EXISTS');
    }

    const novaPraga = await prisma.praga.create({
      data: {
        nome: data.nome,
        nomeCientifico: data.nomeCientifico ?? null,
        descricao: data.descricao,
        sintomas: data.sintomas,
        metodosCombate: data.metodosCombate,
        severidadePadrao: data.severidadePadrao,
        culturaId: data.culturaId ?? null,
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

    return createSuccessResponse(novaPraga, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
