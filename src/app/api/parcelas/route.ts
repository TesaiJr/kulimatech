// src/app/api/parcelas/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireRole } from '@/lib/rbac/guard';
import { createSuccessResponse } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/errors';
import { createParcelaSchema } from '@/features/parcelas/schemas/parcelaSchemas';

export async function GET(req: NextRequest) {
  try {
    const session = requireAuth(req);
    const { searchParams } = new URL(req.url);

    const search = searchParams.get('search')?.trim();
    const agricultorIdParam = searchParams.get('agricultorId')?.trim();
    const tipoSoloParam = searchParams.get('tipoSolo')?.toUpperCase();

    // Cláusula de filtro baseada em isolamento de dados por papel
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {};

    if (session.role === 'AGRICULTOR') {
      // Agricultor so visualiza as suas proprias parcelas
      whereClause.agricultorId = session.userId;
    } else if (session.role === 'TECNICO') {
      // Tecnico visualiza apenas as parcelas dos agricultores sob seu acompanhamento
      const vinculos = await prisma.tecnicoAgricultor.findMany({
        where: { tecnicoId: session.userId },
        select: { agricultorId: true },
      });

      const agricultoresPermitidos = vinculos.map((v) => v.agricultorId);

      // Se passou filtro de agricultor especifico, validar se o tecnico realmente o acompanha
      if (agricultorIdParam) {
        if (!agricultoresPermitidos.includes(agricultorIdParam)) {
          return createSuccessResponse([], 200);
        }
        whereClause.agricultorId = agricultorIdParam;
      } else {
        whereClause.agricultorId = { in: agricultoresPermitidos };
      }
    } else if (session.role === 'ADMIN') {
      // Administrador pode filtrar por agricultor especifico caso deseje
      if (agricultorIdParam) {
        whereClause.agricultorId = agricultorIdParam;
      }
    }

    // Filtro por tipo de solo
    if (tipoSoloParam) {
      whereClause.tipoSolo = tipoSoloParam;
    }

    // Filtro de busca textual
    if (search) {
      whereClause.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { localizacao: { contains: search, mode: 'insensitive' } },
      ];
    }

    const parcelas = await prisma.parcela.findMany({
      where: whereClause,
      include: {
        agricultor: {
          select: {
            id: true,
            nome: true,
            telefone: true,
            zonaAtuacao: true,
          },
        },
        _count: {
          select: {
            leituras: true,
            recomendacoes: true,
            ocorrencias: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return createSuccessResponse(parcelas, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    // Apenas agricultores podem cadastrar parcelas
    const session = requireRole(req, ['AGRICULTOR']);

    const body = await req.json();
    const validatedData = createParcelaSchema.parse(body);

    const novaParcela = await prisma.parcela.create({
      data: {
        nome: validatedData.nome,
        areaHectares: validatedData.areaHectares,
        tipoSolo: validatedData.tipoSolo,
        localizacao: validatedData.localizacao,
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
        agricultorId: session.userId,
      },
      include: {
        agricultor: {
          select: {
            id: true,
            nome: true,
            telefone: true,
            zonaAtuacao: true,
          },
        },
      },
    });

    return createSuccessResponse(novaParcela, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
