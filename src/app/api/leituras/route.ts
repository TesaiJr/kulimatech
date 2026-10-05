// src/app/api/leituras/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/rbac/guard';
import { createSuccessResponse } from '@/lib/api/response';
import { handleApiError, AppError } from '@/lib/api/errors';
import { UserRole, AlertaTipo } from '@prisma/client';
import { z } from 'zod';

const createLeituraSchema = z.object({
  parcelaId: z.string().min(1, 'ID da parcela é obrigatório'),
  humidade: z.coerce.number().min(0, 'Humidade mínima é 0%').max(100, 'Humidade máxima é 100%'),
  temperatura: z.coerce.number().optional(),
  observacoes: z.string().optional(),
});

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

    // 1. Verificar se a parcela existe e se o utilizador tem permissão sobre ela
    const parcela = await prisma.parcela.findUnique({
      where: { id: data.parcelaId },
      select: {
        id: true,
        nome: true,
        agricultorId: true,
        agricultor: {
          select: {
            nome: true,
          },
        },
      },
    });

    if (!parcela) {
      throw new AppError('Parcela agrícola não encontrada.', 404, 'PARCELA_NOT_FOUND');
    }

    // Se for agricultor, só pode registar leituras nas suas próprias parcelas
    if (authUser.role === UserRole.AGRICULTOR && parcela.agricultorId !== authUser.userId) {
      throw new AppError('Não tem permissão para registar leituras nesta parcela.', 403, 'FORBIDDEN');
    }

    // 2. Calcular status de humidade agronómica
    const statusHumidade = calcularStatusHumidade(data.humidade);

    // 3. Persistir leitura no banco de dados e disparar alerta de anomalia se crítico
    const resultado = await prisma.$transaction(async (tx) => {
      const novaLeitura = await tx.leituraSolo.create({
        data: {
          parcelaId: data.parcelaId,
          humidade: data.humidade,
          temperatura: data.temperatura,
          statusHumidade,
          observacoes: data.observacoes,
        },
        include: {
          parcela: {
            select: {
              id: true,
              nome: true,
              areaHectares: true,
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
              mensagem: `Leitura de ${data.humidade}% registada por ${parcela.agricultor.nome}. Atenção técnica necessária.`,
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {};

    if (parcelaId) {
      whereClause.parcelaId = parcelaId;
    }

    // Se for agricultor, restringir às parcelas do agricultor
    if (authUser.role === UserRole.AGRICULTOR) {
      whereClause.parcela = { agricultorId: authUser.userId };
    }

    const leituras = await prisma.leituraSolo.findMany({
      where: whereClause,
      include: {
        parcela: {
          select: { id: true, nome: true, areaHectares: true, tipoSolo: true },
        },
      },
      orderBy: { dataLeitura: 'desc' },
      take: 50,
    });

    return createSuccessResponse(leituras, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
