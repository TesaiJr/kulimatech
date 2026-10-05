// src/app/api/recomendacoes/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireRole } from '@/lib/rbac/guard';
import { createSuccessResponse } from '@/lib/api/response';
import { handleApiError, AppError } from '@/lib/api/errors';
import { createRecomendacaoSchema } from '@/features/culturas/schemas/culturaSchemas';
import { AlertaTipo } from '@prisma/client';

/**
 * GET /api/recomendacoes
 * Consulta de recomendações técnicas com isolamento de dados por papel (RBAC):
 * - AGRICULTOR: visualiza apenas as recomendações dirigidas às suas parcelas.
 * - TECNICO: visualiza recomendações emitidas por ele ou relativas a agricultores supervisionados.
 * - ADMIN: visualização geral do sistema.
 */
export async function GET(req: NextRequest) {
  try {
    const session = requireAuth(req);
    const { searchParams } = new URL(req.url);

    const parcelaId = searchParams.get('parcelaId')?.trim();
    const statusParam = searchParams.get('status')?.trim().toUpperCase();
    const culturaId = searchParams.get('culturaId')?.trim();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {};

    if (session.role === 'AGRICULTOR') {
      // Agricultor só visualiza recomendações de parcelas que lhe pertencem
      whereClause.parcela = { agricultorId: session.userId };
    } else if (session.role === 'TECNICO') {
      // Técnico visualiza recomendações que ele próprio emitiu OU de agricultores que acompanha
      const vinculos = await prisma.tecnicoAgricultor.findMany({
        where: { tecnicoId: session.userId },
        select: { agricultorId: true },
      });
      const agricultoresIds = vinculos.map((v: { agricultorId: string }) => v.agricultorId);

      whereClause.OR = [
        { tecnicoId: session.userId },
        { parcela: { agricultorId: { in: agricultoresIds } } },
      ];
    }

    if (parcelaId) {
      whereClause.parcelaId = parcelaId;
    }

    if (statusParam && ['PENDENTE', 'APLICADA', 'ARQUIVADA'].includes(statusParam)) {
      whereClause.status = statusParam;
    }

    if (culturaId) {
      whereClause.culturaId = culturaId;
    }

    const recomendacoes = await prisma.recomendacao.findMany({
      where: whereClause,
      include: {
        tecnico: {
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
          },
        },
        cultura: {
          select: {
            id: true,
            nome: true,
            humidadeMin: true,
            humidadeMax: true,
          },
        },
        parcela: {
          select: {
            id: true,
            nome: true,
            areaHectares: true,
            tipoSolo: true,
            agricultor: {
              select: {
                id: true,
                nome: true,
                telefone: true,
                zonaAtuacao: true,
              },
            },
          },
        },
      },
      orderBy: { dataEmissao: 'desc' },
    });

    return createSuccessResponse(recomendacoes, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/recomendacoes
 * Emissão de uma recomendação técnica por um Técnico do SDAE ou Administrador.
 * Cria automaticamente uma notificação de alerta (Alerta) para o agricultor responsável.
 */
export async function POST(req: NextRequest) {
  try {
    const session = requireRole(req, ['TECNICO', 'ADMIN']);
    const body = await req.json();
    const validatedData = createRecomendacaoSchema.parse(body);

    // 1. Obter a parcela e validar existência
    const parcela = await prisma.parcela.findUnique({
      where: { id: validatedData.parcelaId },
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
      throw new AppError('Parcela agrícola indicada não foi encontrada.', 404, 'PARCELA_NOT_FOUND');
    }

    // 2. Se for Técnico, validar se ele é responsável pelo agricultor dono da parcela
    if (session.role === 'TECNICO') {
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
          `Não possui autorização para emitir recomendações para a parcela "${parcela.nome}". O agricultor ${parcela.agricultor.nome} não está sob seu acompanhamento técnico.`,
          403,
          'NOT_SUPERVISING_FARMER'
        );
      }
    }

    // 3. Se especificou culturaId, validar existência
    let culturaNome: string | null = null;
    if (validatedData.culturaId) {
      const cultura = await prisma.cultura.findUnique({
        where: { id: validatedData.culturaId },
        select: { id: true, nome: true },
      });
      if (!cultura) {
        throw new AppError('Cultura agronómica indicada não existe no catálogo.', 404, 'CULTURA_NOT_FOUND');
      }
      culturaNome = cultura.nome;
    }

    // 4. Executar criação da recomendação e disparo do alerta atomicamente
    const resultado = await prisma.$transaction(async (tx) => {
      const novaRecomendacao = await tx.recomendacao.create({
        data: {
          parcelaId: validatedData.parcelaId,
          tecnicoId: session.userId,
          culturaId: validatedData.culturaId || null,
          parecer: validatedData.parecer,
          status: 'PENDENTE',
        },
        include: {
          tecnico: {
            select: { id: true, nome: true, email: true, telefone: true },
          },
          cultura: {
            select: { id: true, nome: true, humidadeMin: true, humidadeMax: true },
          },
          parcela: {
            select: {
              id: true,
              nome: true,
              areaHectares: true,
              tipoSolo: true,
              agricultor: {
                select: { id: true, nome: true, telefone: true, zonaAtuacao: true },
              },
            },
          },
        },
      });

      // Disparo automático de alerta para o agricultor
      const resumoParecer =
        validatedData.parecer.length > 90
          ? `${validatedData.parecer.substring(0, 90)}...`
          : validatedData.parecer;

      await tx.alerta.create({
        data: {
          userId: parcela.agricultorId,
          tipo: AlertaTipo.NOVA_RECOMENDACAO,
          titulo: `Nova Orientação Técnica: ${parcela.nome}`,
          mensagem: culturaNome
            ? `O Técnico recomendou a cultura ${culturaNome}: "${resumoParecer}"`
            : `Nova orientação técnica emitida: "${resumoParecer}"`,
          link: `/parcelas/${parcela.id}`,
        },
      });

      return novaRecomendacao;
    });

    return createSuccessResponse(resultado, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
