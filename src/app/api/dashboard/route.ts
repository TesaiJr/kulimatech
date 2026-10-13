// src/app/api/dashboard/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/rbac/guard';
import { createSuccessResponse } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/errors';
import { UserRole, StatusOcorrencia, StatusRecomendacao } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const authUser = requireAuth(req);

    const currentUser = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        status: true,
        telefone: true,
        zonaAtuacao: true,
        createdAt: true,
      },
    });

    if (!currentUser) {
      throw new Error('Utilizador não encontrado no sistema.');
    }

    // =========================================================================
    // 1. VISÃO DO AGRICULTOR
    // =========================================================================
    if (currentUser.role === UserRole.AGRICULTOR) {
      const [parcelas, vinculo, recomendacoesAtivas, ocorrenciasAtivas, alertasNaoLidos] = await Promise.all([
        prisma.parcela.findMany({
          where: { agricultorId: currentUser.id },
          include: {
            leituras: {
              orderBy: { dataLeitura: 'desc' },
              take: 1,
            },
            recomendacoes: {
              include: {
                tecnico: { select: { id: true, nome: true, email: true } },
                cultura: { select: { id: true, nome: true } },
              },
              orderBy: { dataEmissao: 'desc' },
              take: 3,
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.tecnicoAgricultor.findFirst({
          where: { agricultorId: currentUser.id },
          include: {
            tecnico: {
              select: { id: true, nome: true, email: true, telefone: true, zonaAtuacao: true },
            },
          },
        }),
        prisma.recomendacao.count({
          where: {
            parcela: { agricultorId: currentUser.id },
            status: StatusRecomendacao.PENDENTE,
          },
        }),
        prisma.ocorrenciaPraga.count({
          where: {
            agricultorId: currentUser.id,
            status: { in: [StatusOcorrencia.ABERTA, StatusOcorrencia.EM_ANALISE] },
          },
        }),
        prisma.alerta.count({
          where: {
            userId: currentUser.id,
            lido: false,
          },
        }),
      ]);

      const totalParcelas = parcelas.length;
      const totalHectares = parcelas.reduce((acc, p) => acc + (p.areaHectares || 0), 0);

      // Obter a medição mais recente entre todas as suas parcelas
      let ultimaLeitura = null;
      for (const p of parcelas) {
        if (p.leituras.length > 0) {
          if (!ultimaLeitura || new Date(p.leituras[0].dataLeitura) > new Date(ultimaLeitura.dataLeitura)) {
            ultimaLeitura = {
              ...p.leituras[0],
              parcelaNome: p.nome,
            };
          }
        }
      }

      const dashboardData = {
        role: 'AGRICULTOR',
        user: currentUser,
        stats: {
          totalParcelas,
          totalHectares: parseFloat(totalHectares.toFixed(2)),
          humidadeAtual: ultimaLeitura ? ultimaLeitura.humidade : null,
          statusHumidadeAtual: ultimaLeitura ? ultimaLeitura.statusHumidade : null,
          ultimaLeituraData: ultimaLeitura ? ultimaLeitura.dataLeitura : null,
          parcelaUltimaLeitura: ultimaLeitura ? ultimaLeitura.parcelaNome : null,
          tecnicoResponsavel: vinculo?.tecnico || null,
          recomendacoesAtivasCount: recomendacoesAtivas,
          ocorrenciasAtivasCount: ocorrenciasAtivas,
          alertasNaoLidosCount: alertasNaoLidos,
        },
        parcelas: parcelas.map((p) => ({
          id: p.id,
          nome: p.nome,
          areaHectares: p.areaHectares,
          tipoSolo: p.tipoSolo,
          localizacao: p.localizacao,
          ultimaLeitura: p.leituras[0] || null,
        })),
        recomendacoesRecentes: parcelas
          .flatMap((p) =>
            p.recomendacoes.map((r) => ({
              ...r,
              parcelaNome: p.nome,
            }))
          )
          .slice(0, 3),
      };

      return createSuccessResponse(dashboardData, 200);
    }

    // =========================================================================
    // 2. VISÃO DO TÉCNICO SDAE
    // =========================================================================
    if (currentUser.role === UserRole.TECNICO) {
      // Agricultores vinculados à carteira do técnico
      const vinculos = await prisma.tecnicoAgricultor.findMany({
        where: { tecnicoId: currentUser.id },
        include: {
          agricultor: {
            select: {
              id: true,
              nome: true,
              email: true,
              telefone: true,
              zonaAtuacao: true,
              parcelas: {
                select: {
                  id: true,
                  nome: true,
                  areaHectares: true,
                  tipoSolo: true,
                },
              },
            },
          },
        },
      });

      const agricultorIds = vinculos.map((v) => v.agricultorId);
      const parcelasIds = vinculos.flatMap((v) => v.agricultor.parcelas.map((p) => p.id));
      const totalHectares = vinculos.reduce(
        (acc, v) => acc + v.agricultor.parcelas.reduce((pAcc, p) => pAcc + (p.areaHectares || 0), 0),
        0
      );

      // Consultas agregadas e dados analíticos em paralelo
      const [
        validacoesPendentesCount,
        ocorrenciasPragasCount,
        ocorrenciasResolvidasCount,
        recomendacoesEmitidasCount,
        leiturasRecentes,
        ocorrenciasPragas,
      ] = await Promise.all([
        parcelasIds.length > 0
          ? prisma.leituraSolo.count({
              where: {
                parcelaId: { in: parcelasIds },
                validadoPorTecnico: false,
              },
            })
          : 0,
        agricultorIds.length > 0
          ? prisma.ocorrenciaPraga.count({
              where: {
                agricultorId: { in: agricultorIds },
                status: { in: [StatusOcorrencia.ABERTA, StatusOcorrencia.EM_ANALISE] },
              },
            })
          : 0,
        agricultorIds.length > 0
          ? prisma.ocorrenciaPraga.count({
              where: {
                agricultorId: { in: agricultorIds },
                status: StatusOcorrencia.RESOLVIDA,
              },
            })
          : 0,
        prisma.recomendacao.count({
          where: { tecnicoId: currentUser.id },
        }),
        parcelasIds.length > 0
          ? prisma.leituraSolo.findMany({
              where: { parcelaId: { in: parcelasIds } },
              include: {
                parcela: {
                  select: {
                    id: true,
                    nome: true,
                    tipoSolo: true,
                    agricultor: { select: { id: true, nome: true } },
                  },
                },
              },
              orderBy: { dataLeitura: 'desc' },
              take: 5,
            })
          : [],
        agricultorIds.length > 0
          ? prisma.ocorrenciaPraga.findMany({
              where: { agricultorId: { in: agricultorIds } },
              include: {
                parcela: { select: { nome: true } },
                agricultor: { select: { nome: true } },
                praga: { select: { nome: true } },
              },
              orderBy: { dataReporte: 'desc' },
              take: 5,
            })
          : [],
      ]);

      const dashboardData = {
        role: 'TECNICO_SDAE',
        user: currentUser,
        stats: {
          totalAgricultores: vinculos.length,
          totalParcelas: parcelasIds.length,
          totalHectares: parseFloat(totalHectares.toFixed(2)),
          validacoesPendentes: validacoesPendentesCount,
          ocorrenciasPragasCount,
          ocorrenciasResolvidasCount,
          recomendacoesEmitidasCount,
        },
        agricultores: vinculos.map((v) => ({
          ...v.agricultor,
          dataVinculo: v.dataVinculo,
        })),
        leiturasRecentes,
        ocorrenciasPragas,
      };

      return createSuccessResponse(dashboardData, 200);
    }

    // =========================================================================
    // 3. VISÃO DO ADMINISTRADOR
    // =========================================================================
    if (currentUser.role === UserRole.ADMIN) {
      const [
        totalUsuarios,
        totalAdmins,
        totalTecnicos,
        totalAgricultores,
        totalParcelas,
        hectaresAgg,
        totalCulturas,
        totalPragas,
        totalLeituras,
        leiturasValidadas,
        totalOcorrencias,
        totalRecomendacoes,
        culturas,
        pragas,
        tecnicos,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: UserRole.ADMIN } }),
        prisma.user.count({ where: { role: UserRole.TECNICO } }),
        prisma.user.count({ where: { role: UserRole.AGRICULTOR } }),
        prisma.parcela.count(),
        prisma.parcela.aggregate({ _sum: { areaHectares: true } }),
        prisma.cultura.count(),
        prisma.praga.count(),
        prisma.leituraSolo.count(),
        prisma.leituraSolo.count({ where: { validadoPorTecnico: true } }),
        prisma.ocorrenciaPraga.count(),
        prisma.recomendacao.count(),
        prisma.cultura.findMany({
          take: 6,
          select: { id: true, nome: true, cicloDias: true, humidadeMin: true, humidadeMax: true },
          orderBy: { nome: 'asc' },
        }),
        prisma.praga.findMany({
          take: 6,
          select: { id: true, nome: true, severidadePadrao: true },
          orderBy: { nome: 'asc' },
        }),
        prisma.user.findMany({
          where: { role: UserRole.TECNICO },
          select: {
            id: true,
            nome: true,
            email: true,
            zonaAtuacao: true,
            _count: {
              select: { agricultoresAcompanhados: true },
            },
          },
          take: 6,
          orderBy: { nome: 'asc' },
        }),
      ]);

      const totalHectaresDistrito = hectaresAgg._sum.areaHectares || 0;

      const dashboardData = {
        role: 'ADMIN',
        user: currentUser,
        stats: {
          totalUsuarios,
          totalAdmins,
          totalTecnicos,
          totalAgricultores,
          totalParcelas,
          totalHectaresDistrito: parseFloat(totalHectaresDistrito.toFixed(2)),
          totalCulturas,
          totalPragas,
          totalLeituras,
          leiturasValidadas,
          leiturasPendentes: totalLeituras - leiturasValidadas,
          totalOcorrencias,
          totalRecomendacoes,
          distrito: 'Nhamatanda',
          provincia: 'Sofala',
        },
        tecnicos: tecnicos.map((t) => ({
          id: t.id,
          nome: t.nome,
          email: t.email,
          zonaAtuacao: t.zonaAtuacao,
          agricultoresCount: t._count.agricultoresAcompanhados,
        })),
        culturas,
        pragas,
      };

      return createSuccessResponse(dashboardData, 200);
    }

    throw new Error('Perfil de utilizador não reconhecido.');
  } catch (error) {
    return handleApiError(error);
  }
}
