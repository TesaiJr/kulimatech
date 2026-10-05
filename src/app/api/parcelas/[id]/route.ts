// src/app/api/parcelas/[id]/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireRole } from '@/lib/rbac/guard';
import { createSuccessResponse } from '@/lib/api/response';
import { handleApiError, AppError } from '@/lib/api/errors';
import { updateParcelaSchema } from '@/features/parcelas/schemas/parcelaSchemas';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = requireAuth(req);
    const { id } = await params;

    const parcela = await prisma.parcela.findUnique({
      where: { id },
      include: {
        agricultor: {
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
            zonaAtuacao: true,
          },
        },
        leituras: {
          take: 5,
          orderBy: { dataLeitura: 'desc' },
        },
        recomendacoes: {
          include: {
            tecnico: {
              select: { id: true, nome: true },
            },
            cultura: {
              select: { id: true, nome: true },
            },
          },
          orderBy: { dataEmissao: 'desc' },
        },
        ocorrencias: {
          include: {
            praga: {
              select: { id: true, nome: true },
            },
          },
          orderBy: { dataReporte: 'desc' },
        },
      },
    });

    if (!parcela) {
      throw new AppError('Parcela nao encontrada no sistema.', 404, 'NOT_FOUND');
    }

    // Validacao rigorosa de autorizacao
    if (session.role === 'AGRICULTOR') {
      if (parcela.agricultorId !== session.userId) {
        throw new AppError('Acesso negado. Esta parcela pertence a outro agricultor.', 403, 'FORBIDDEN');
      }
    } else if (session.role === 'TECNICO') {
      const vinculo = await prisma.tecnicoAgricultor.findUnique({
        where: {
          tecnicoId_agricultorId: {
            tecnicoId: session.userId,
            agricultorId: parcela.agricultorId,
          },
        },
      });

      if (!vinculo) {
        throw new AppError(
          'Acesso negado. Este agricultor nao esta sob seu acompanhamento tecnico.',
          403,
          'FORBIDDEN'
        );
      }
    }

    return createSuccessResponse(parcela, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = requireRole(req, ['AGRICULTOR', 'TECNICO', 'ADMIN']);
    const { id } = await params;

    // Verificar se a parcela existe e validar permissões por papel
    const existingParcela = await prisma.parcela.findUnique({
      where: { id },
      select: { agricultorId: true },
    });

    if (!existingParcela) {
      throw new AppError('Parcela nao encontrada no sistema.', 404, 'NOT_FOUND');
    }

    if (session.role === 'AGRICULTOR') {
      if (existingParcela.agricultorId !== session.userId) {
        throw new AppError('Acesso negado. Voce so pode editar as suas proprias parcelas.', 403, 'FORBIDDEN');
      }
    } else if (session.role === 'TECNICO') {
      const vinculo = await prisma.tecnicoAgricultor.findUnique({
        where: {
          tecnicoId_agricultorId: {
            tecnicoId: session.userId,
            agricultorId: existingParcela.agricultorId,
          },
        },
      });

      if (!vinculo) {
        throw new AppError(
          'Acesso negado. Este agricultor nao esta sob seu acompanhamento tecnico.',
          403,
          'FORBIDDEN'
        );
      }
    }

    const body = await req.json();
    const validatedData = updateParcelaSchema.parse(body);

    const updatedParcela = await prisma.parcela.update({
      where: { id },
      data: validatedData,
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

    return createSuccessResponse(updatedParcela, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = requireRole(req, ['AGRICULTOR', 'ADMIN']);
    const { id } = await params;

    const existingParcela = await prisma.parcela.findUnique({
      where: { id },
      select: { agricultorId: true, nome: true },
    });

    if (!existingParcela) {
      throw new AppError('Parcela nao encontrada no sistema.', 404, 'NOT_FOUND');
    }

    if (session.role === 'AGRICULTOR' && existingParcela.agricultorId !== session.userId) {
      throw new AppError('Acesso negado. Voce so pode excluir as suas proprias parcelas.', 403, 'FORBIDDEN');
    }

    await prisma.parcela.delete({
      where: { id },
    });

    return createSuccessResponse(
      { message: `Parcela "${existingParcela.nome}" excluida com sucesso.` },
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}
