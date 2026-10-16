// src/app/api/leituras/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/rbac/guard';
import { createSuccessResponse } from '@/lib/api/response';
import { handleApiError, AppError } from '@/lib/api/errors';
import { UserRole, AlertaTipo } from '@prisma/client';
import { createLeituraSchema } from '@/features/leituras/schemas/leituraSchemas';

function calcularStatusHumidade(humidade: number): string {
  if (humidade < 25) return 'CRITICA';
  if (humidade < 35) return 'BAIXA';
  if (humidade <= 55) return 'OPTIMA';
  return 'EXCESSIVA';
}

export async function POST(req: NextRequest) {
  try {
    const authUser = requireAuth(req);
    const body = await req.json();
    const data = createLeituraSchema.parse(body);

    // 1. Verificar se a parcela existe e os dados do agricultor
    const parcela = await prisma.parcela.findUnique({
      where: { id: data.parcelaId },
      select: {
        id: true,
        nome: true,
        agricultorId: true,
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

    // 2. Validação RBAC:
    // Agricultor só pode registar leituras nas suas próprias parcelas
    if (authUser.role === UserRole.AGRICULTOR && parcela.agricultorId !== authUser.userId) {
      throw new AppError('Não tem permissão para registar leituras nesta parcela.', 403, 'FORBIDDEN');
    }

    // Técnico só pode registar se estiver vinculado ao agricultor da parcela (ou se for ADMIN)
    if (authUser.role === UserRole.TECNICO) {
      const vinculo = await prisma.tecnicoAgricultor.findFirst({
        where: {
          tecnicoId: authUser.userId,
          agricultorId: parcela.agricultorId,
        },
      });

      if (!vinculo) {
        throw new AppError('Não tem permissão técnica sobre as parcelas deste agricultor.', 403, 'FORBIDDEN');
      }
    }

    // 3. Calcular status de humidade agronómica
    const statusHumidade = calcularStatusHumidade(data.humidade);

    // 4. Persistir leitura no banco de dados e disparar alerta de anomalia se crítico
    const resultado = await prisma.$transaction(async (tx) => {
      const novaLeitura = await tx.leituraSolo.create({
        data: {
          parcelaId: data.parcelaId,
          humidade: data.humidade,
          temperatura: data.temperatura ?? null,
          statusHumidade,
          observacoes: data.observacoes ?? null,
          // Se registado diretamente por um técnico, já pode nascer validada por ele
          validadoPorTecnico: authUser.role === UserRole.TECNICO,
          tecnicoValidadorId: authUser.role === UserRole.TECNICO ? authUser.userId : null,
          dataValidacao: authUser.role === UserRole.TECNICO ? new Date() : null,
          observacoesTecnicas: authUser.role === UserRole.TECNICO ? 'Medição registada diretamente pelo técnico do SDAE.' : null,
        },
        include: {
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
                  email: true,
                },
              },
            },
          },
          tecnicoValidador: {
            select: {
              id: true,
              nome: true,
              email: true,
            },
          },
        },
      });

      // Se a humidade for CRITICA, notificar automaticamente o Técnico responsável
      if (statusHumidade === 'CRITICA') {
        const vinculo = await tx.tecnicoAgricultor.findFirst({
          where: { agricultorId: parcela.agricultorId },
          select: { tecnicoId: true },
        });

        if (vinculo) {
          await tx.alerta.create({
            data: {
              userId: vinculo.tecnicoId,
              tipo: AlertaTipo.HUMIDADE_CRITICA,
              titulo: `Humidade Crítica na Parcela ${parcela.nome}`,
              mensagem: `Leitura crítica de ${data.humidade}% registada na parcela ${parcela.nome} (${parcela.agricultor.nome}). Intervenção agronómica necessária.`,
              link: `/leituras?parcelaId=${parcela.id}`,
            },
          });
        }
      }

      return novaLeitura;
    });

    return createSuccessResponse(resultado, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(req: NextRequest) {
  try {
    const authUser = requireAuth(req);
    const { searchParams } = new URL(req.url);
    const parcelaId = searchParams.get('parcelaId');
    const validado = searchParams.get('validado');
    const statusHumidade = searchParams.get('statusHumidade');
    const agricultorId = searchParams.get('agricultorId');
    const dataInicio = searchParams.get('dataInicio');
    const dataFim = searchParams.get('dataFim');
    const limit = Math.min(Math.max(Number(searchParams.get('limit')) || 50, 1), 200);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {};

    if (parcelaId && parcelaId !== 'TODOS') {
      whereClause.parcelaId = parcelaId;
    }

    if (validado === 'true') {
      whereClause.validadoPorTecnico = true;
    } else if (validado === 'false') {
      whereClause.validadoPorTecnico = false;
    }

    if (statusHumidade && statusHumidade !== 'TODOS') {
      whereClause.statusHumidade = statusHumidade;
    }

    if (dataInicio || dataFim) {
      whereClause.dataLeitura = {
        ...(dataInicio ? { gte: new Date(dataInicio) } : {}),
        ...(dataFim ? { lte: new Date(dataFim) } : {}),
      };
    }

    // Regras de Isolamento RBAC
    if (authUser.role === UserRole.AGRICULTOR) {
      whereClause.parcela = { agricultorId: authUser.userId };
    } else if (authUser.role === UserRole.TECNICO) {
      // Obter os agricultores da carteira do técnico
      const vinculos = await prisma.tecnicoAgricultor.findMany({
        where: { tecnicoId: authUser.userId },
        select: { agricultorId: true },
      });
      const idsAcompanhados = vinculos.map((v) => v.agricultorId);

      if (agricultorId && agricultorId !== 'TODOS') {
        if (!idsAcompanhados.includes(agricultorId)) {
          throw new AppError('Não tem acesso às leituras deste agricultor.', 403, 'FORBIDDEN');
        }
        whereClause.parcela = { agricultorId };
      } else {
        whereClause.parcela = { agricultorId: { in: idsAcompanhados } };
      }
    } else if (authUser.role === UserRole.ADMIN) {
      if (agricultorId && agricultorId !== 'TODOS') {
        whereClause.parcela = { agricultorId };
      }
    }

    const leituras = await prisma.leituraSolo.findMany({
      where: whereClause,
      include: {
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
                email: true,
                telefone: true,
              },
            },
          },
        },
        tecnicoValidador: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
      orderBy: { dataLeitura: 'desc' },
      take: limit,
    });

    return createSuccessResponse(leituras, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
