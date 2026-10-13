// src/app/api/users/atribuicoes/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/rbac/guard';
import { createSuccessResponse } from '@/lib/api/response';
import { handleApiError, AppError } from '@/lib/api/errors';
import { UserRole, UserStatus } from '@prisma/client';
import { atribuicaoCarteiraSchema } from '@/features/users/schemas/userAdminSchemas';

export async function GET(req: NextRequest) {
  try {
    // 1. Acesso restrito a Administradores
    requireRole(req, [UserRole.ADMIN]);

    // 2. Buscar todos os técnicos com seus agricultores vinculados
    const tecnicosRaw = await prisma.user.findMany({
      where: {
        role: UserRole.TECNICO,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        status: true,
        telefone: true,
        zonaAtuacao: true,
        createdAt: true,
        agricultoresAcompanhados: {
          select: {
            agricultor: {
              select: {
                id: true,
                nome: true,
                email: true,
                role: true,
                status: true,
                telefone: true,
                zonaAtuacao: true,
                createdAt: true,
                _count: {
                  select: {
                    parcelas: true,
                  },
                },
              },
            },
          },
          orderBy: {
            dataVinculo: 'desc',
          },
        },
      },
      orderBy: { nome: 'asc' },
    });

    const tecnicos = tecnicosRaw.map((tec) => ({
      tecnico: {
        id: tec.id,
        nome: tec.nome,
        email: tec.email,
        role: tec.role,
        status: tec.status,
        telefone: tec.telefone,
        zonaAtuacao: tec.zonaAtuacao,
        createdAt: tec.createdAt.toISOString(),
      },
      agricultores: tec.agricultoresAcompanhados.map((item) => ({
        ...item.agricultor,
        createdAt: item.agricultor.createdAt.toISOString(),
      })),
      totalAgricultores: tec.agricultoresAcompanhados.length,
    }));

    // 3. Buscar agricultores que ainda não têm nenhum técnico atribuído
    const agricultoresPendentesRaw = await prisma.user.findMany({
      where: {
        role: UserRole.AGRICULTOR,
        status: UserStatus.ATIVO,
        tecnicosResponsaveis: {
          none: {},
        },
      },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        status: true,
        telefone: true,
        zonaAtuacao: true,
        createdAt: true,
        _count: {
          select: {
            parcelas: true,
          },
        },
      },
      orderBy: { nome: 'asc' },
    });

    const agricultoresPendentes = agricultoresPendentesRaw.map((a) => ({
      ...a,
      createdAt: a.createdAt.toISOString(),
    }));

    return createSuccessResponse(
      {
        tecnicos,
        agricultoresPendentes,
        totalPendentes: agricultoresPendentes.length,
      },
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Acesso restrito a Administradores
    requireRole(req, [UserRole.ADMIN]);

    const body = await req.json();
    const { tecnicoId, agricultorIds } = atribuicaoCarteiraSchema.parse(body);

    // 2. Verificar se o técnico existe e tem papel TECNICO
    const tecnico = await prisma.user.findUnique({
      where: { id: tecnicoId },
      select: { id: true, nome: true, role: true, status: true },
    });

    if (!tecnico || tecnico.role !== UserRole.TECNICO) {
      throw new AppError('O utilizador informado para técnico não foi encontrado ou não é um Técnico SDAE.', 400, 'INVALID_TECNICO');
    }

    if (tecnico.status !== UserStatus.ATIVO) {
      throw new AppError('Não é possível atribuir carteira a um técnico inativo ou bloqueado.', 400, 'TECNICO_INACTIVE');
    }

    // 3. Executar atribuição atômica em transação de lote (único round-trip ao banco)
    await prisma.$transaction([
      prisma.tecnicoAgricultor.deleteMany({
        where: {
          agricultorId: { in: agricultorIds },
        },
      }),
      prisma.tecnicoAgricultor.createMany({
        data: agricultorIds.map((agId) => ({
          tecnicoId,
          agricultorId: agId,
        })),
        skipDuplicates: true,
      }),
    ]);

    // 4. Notificações disparadas de forma segura (sem abortar a atribuição caso ocorra timeout de rede)
    try {
      const alertasAgricultores = agricultorIds.map((agId) => ({
        userId: agId,
        tipo: 'SISTEMA' as const,
        titulo: 'Técnico SDAE Atribuído',
        mensagem: `Você foi vinculado ao Técnico SDAE ${tecnico.nome}. Suas parcelas e dúvidas agora contam com acompanhamento técnico dedicado.`,
        lido: false,
      }));

      await Promise.all([
        prisma.alerta.createMany({
          data: alertasAgricultores,
        }),
        prisma.alerta.create({
          data: {
            userId: tecnicoId,
            tipo: 'SISTEMA',
            titulo: 'Novos Produtores na Carteira',
            mensagem: `A administração atribuiu ${agricultorIds.length} novo(s) agricultor(es) à sua carteira técnica de supervisão.`,
            lido: false,
          },
        }),
      ]);
    } catch (notifError) {
      console.warn('[Atribuicoes] Aviso: Vínculos criados com sucesso, mas houve lentidão ao registrar alertas:', notifError);
    }

    return createSuccessResponse(
      {
        message: `Atribuição concluída com sucesso para o técnico ${tecnico.nome}.`,
        tecnicoId,
        agricultoresAtribuidos: agricultorIds.length,
      },
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // 1. Acesso restrito a Administradores
    requireRole(req, [UserRole.ADMIN]);

    const { searchParams } = new URL(req.url);
    const tecnicoId = searchParams.get('tecnicoId');
    const agricultorId = searchParams.get('agricultorId');

    if (!tecnicoId || !agricultorId) {
      throw new AppError('Parâmetros tecnicoId e agricultorId são obrigatórios.', 400, 'MISSING_PARAMS');
    }

    // 2. Verificar se o vínculo existe
    const vinculo = await prisma.tecnicoAgricultor.findUnique({
      where: {
        tecnicoId_agricultorId: {
          tecnicoId,
          agricultorId,
        },
      },
      include: {
        tecnico: { select: { nome: true } },
        agricultor: { select: { nome: true } },
      },
    });

    if (!vinculo) {
      throw new AppError('Vínculo entre o técnico e o agricultor não encontrado.', 404, 'NOT_FOUND');
    }

    // 3. Remover vínculo e notificar sequencialmente sem transação aberta
    await prisma.tecnicoAgricultor.deleteMany({
      where: {
        tecnicoId,
        agricultorId,
      },
    });

    // Notificar agricultor
    await prisma.alerta.create({
      data: {
        userId: agricultorId,
        tipo: 'SISTEMA',
        titulo: 'Desvinculação Técnica',
        mensagem: `O seu vínculo com o Técnico SDAE ${vinculo.tecnico.nome} foi descontinuado pela administração. Aguarde nova atribuição.`,
        lido: false,
      },
    });

    return createSuccessResponse(
      {
        message: `Vínculo entre ${vinculo.tecnico.nome} e ${vinculo.agricultor.nome} desfeito com sucesso.`,
      },
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}
