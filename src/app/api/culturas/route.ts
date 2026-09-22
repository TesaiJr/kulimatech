// src/app/api/culturas/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireRole } from '@/lib/rbac/guard';
import { createSuccessResponse } from '@/lib/api/response';
import { handleApiError, AppError } from '@/lib/api/errors';
import { createCulturaSchema } from '@/features/culturas/schemas/culturaSchemas';

/**
 * GET /api/culturas
 * Consulta o catálogo de culturas do sistema KulimaTech / SDAE Nhamatanda.
 * Acessível a todos os utilizadores autenticados (ADMIN, TECNICO, AGRICULTOR).
 */
export async function GET(req: NextRequest) {
  try {
    requireAuth(req);
    const { searchParams } = new URL(req.url);

    const search = searchParams.get('search')?.trim();
    const humidade = searchParams.get('humidade');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { nomeCientifico: { contains: search, mode: 'insensitive' } },
        { descricao: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (humidade !== null && humidade !== undefined && humidade !== '') {
      const humidadeVal = parseFloat(humidade);
      if (!isNaN(humidadeVal)) {
        whereClause.humidadeMin = { lte: humidadeVal };
        whereClause.humidadeMax = { gte: humidadeVal };
      }
    }

    const culturas = await prisma.cultura.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { recomendacoes: true },
        },
      },
      orderBy: { nome: 'asc' },
    });

    return createSuccessResponse(culturas, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/culturas
 * Cadastra uma nova cultura no catálogo agronómico de referência.
 * Restrito estritamente a administradores do sistema (ADMIN).
 */
export async function POST(req: NextRequest) {
  try {
    requireRole(req, ['ADMIN']);

    const body = await req.json();
    const validatedData = createCulturaSchema.parse(body);

    // Verificar se já existe uma cultura com o mesmo nome
    const existing = await prisma.cultura.findUnique({
      where: { nome: validatedData.nome },
    });

    if (existing) {
      throw new AppError(
        `Já existe uma cultura cadastrada com o nome "${validatedData.nome}".`,
        409,
        'CULTURA_ALREADY_EXISTS'
      );
    }

    const novaCultura = await prisma.cultura.create({
      data: {
        nome: validatedData.nome,
        nomeCientifico: validatedData.nomeCientifico,
        descricao: validatedData.descricao,
        humidadeMin: validatedData.humidadeMin,
        humidadeMax: validatedData.humidadeMax,
        cicloDias: validatedData.cicloDias,
        epocaPlantio: validatedData.epocaPlantio,
        cuidados: validatedData.cuidados,
      },
    });

    return createSuccessResponse(novaCultura, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
