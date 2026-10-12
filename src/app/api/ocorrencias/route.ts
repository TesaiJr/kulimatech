// src/app/api/ocorrencias/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/rbac/guard';
import { createSuccessResponse } from '@/lib/api/response';
import { handleApiError, AppError } from '@/lib/api/errors';
import { UserRole, AlertaTipo, StatusOcorrencia } from '@prisma/client';
import { createOcorrenciaSchema } from '@/features/pragas/schemas/pragaSchemas';

export async function GET(req: NextRequest) {
  try {
    const authUser = requireAuth(req);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const severidade = searchParams.get('severidade');
    const parcelaId = searchParams.get('parcelaId');
    const pragaId = searchParams.get('pragaId');
    const search = searchParams.get('search');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {};

    if (status && status !== 'TODOS') {
      whereClause.status = status as StatusOcorrencia;
    }

    if (severidade && severidade !== 'TODOS') {
      whereClause.severidade = severidade;
    }

    if (parcelaId && parcelaId !== 'TODOS') {
      whereClause.parcelaId = parcelaId;
    }

    if (pragaId && pragaId !== 'TODOS') {
      whereClause.pragaId = pragaId;
    }

    if (search?.trim()) {
      const q = search.trim();
      whereClause.OR = [
        { descricao: { contains: q, mode: 'insensitive' } },
        { parecerTecnico: { contains: q, mode: 'insensitive' } },
        { acaoRecomendada: { contains: q, mode: 'insensitive' } },
        { parcela: { nome: { contains: q, mode: 'insensitive' } } },
        { praga: { nome: { contains: q, mode: 'insensitive' } } },
      ];
    }

    // Regras de Isolamento RBAC
    if (authUser.role === UserRole.AGRICULTOR) {
      whereClause.agricultorId = authUser.userId;
    } else if (authUser.role === UserRole.TECNICO) {
      const vinculos = await prisma.tecnicoAgricultor.findMany({
        where: { tecnicoId: authUser.userId },
        select: { agricultorId: true },
      });
      const idsAcompanhados = vinculos.map((v) => v.agricultorId);
      whereClause.agricultorId = { in: idsAcompanhados };
    }

    const ocorrencias = await prisma.ocorrenciaPraga.findMany({
      where: whereClause,
      include: {
        parcela: {
          select: {
            id: true,
            nome: true,
            areaHectares: true,
            tipoSolo: true,
          },
        },
        praga: {
          select: {
            id: true,
            nome: true,
            nomeCientifico: true,
            severidadePadrao: true,
          },
        },
        agricultor: {
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
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
      orderBy: { dataReporte: 'desc' },
      take: 100,
    });

    return createSuccessResponse(ocorrencias, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = requireAuth(req);
    const body = await req.json();
    const data = createOcorrenciaSchema.parse(body);

    const parcela = await prisma.parcela.findUnique({
      where: { id: data.parcelaId },
      include: {
        agricultor: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });

    if (!parcela) {
      throw new AppError('Parcela agrícola não encontrada.', 404, 'PARCELA_NOT_FOUND');
    }

    // Agricultor só pode reportar nas suas próprias parcelas
    if (authUser.role === UserRole.AGRICULTOR && parcela.agricultorId !== authUser.userId) {
      throw new AppError('Não tem permissão para reportar ocorrências nesta parcela.', 403, 'FORBIDDEN');
    }

    // Se for técnico, validar se acompanha o agricultor da parcela
    if (authUser.role === UserRole.TECNICO) {
      const vinculo = await prisma.tecnicoAgricultor.findFirst({
        where: {
          tecnicoId: authUser.userId,
          agricultorId: parcela.agricultorId,
        },
      });

      if (!vinculo) {
        throw new AppError('Não tem permissão técnica sobre as parcelas deste produtor.', 403, 'FORBIDDEN');
      }
    }

    // Transação de criação e notificação imediata
    const resultado = await prisma.$transaction(async (tx) => {
      const novaOcorrencia = await tx.ocorrenciaPraga.create({
        data: {
          parcelaId: data.parcelaId,
          pragaId: data.pragaId || null,
          agricultorId: parcela.agricultorId,
          descricao: data.descricao,
          severidade: data.severidade,
          status: StatusOcorrencia.ABERTA,
          fotoUrl: data.fotoUrl || null,
        },
        include: {
          parcela: {
            select: { id: true, nome: true, areaHectares: true },
          },
          praga: {
            select: { id: true, nome: true },
          },
          agricultor: {
            select: { id: true, nome: true },
          },
        },
      });

      // Disparar Alerta para o extensionista do SDAE vinculado
      const vinculo = await tx.tecnicoAgricultor.findFirst({
        where: { agricultorId: parcela.agricultorId },
        select: { tecnicoId: true },
      });

      if (vinculo) {
        await tx.alerta.create({
          data: {
            userId: vinculo.tecnicoId,
            tipo: AlertaTipo.PRAGA_REPORTADA,
            titulo: `Ocorrência Fitossanitária: ${parcela.nome}`,
            mensagem: `Novo reporte de praga/doença na parcela ${parcela.nome} (${parcela.agricultor.nome}). Severidade: ${data.severidade}.`,
            link: '/pragas/ocorrencias',
          },
        });
      }

      return novaOcorrencia;
    });

    return createSuccessResponse(resultado, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
