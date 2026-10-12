// src/app/api/leituras/[id]/validar/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/rbac/guard';
import { createSuccessResponse } from '@/lib/api/response';
import { handleApiError, AppError } from '@/lib/api/errors';
import { UserRole, AlertaTipo } from '@prisma/client';
import { validarLeituraSchema } from '@/features/leituras/schemas/leituraSchemas';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/leituras/[id]/validar
 * Homologação agronómica da leitura de humidade de solo pelo Técnico SDAE ou Administrador.
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const authUser = requireAuth(req);
    const { id } = await params;

    // Apenas perfis técnicos ou administrativos podem homologar
    if (authUser.role !== UserRole.TECNICO && authUser.role !== UserRole.ADMIN) {
      throw new AppError(
        'Apenas técnicos do SDAE ou administradores têm permissão para validar leituras agronómicas.',
        403,
        'FORBIDDEN'
      );
    }

    const body = await req.json();
    const data = validarLeituraSchema.parse(body);

    const leitura = await prisma.leituraSolo.findUnique({
      where: { id },
      include: {
        parcela: {
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
        },
      },
    });

    if (!leitura) {
      throw new AppError('Leitura de solo não encontrada.', 404, 'LEITURA_NOT_FOUND');
    }

    // Se for Técnico, validar se pertence à sua carteira supervisionada
    if (authUser.role === UserRole.TECNICO) {
      const vinculo = await prisma.tecnicoAgricultor.findFirst({
        where: {
          tecnicoId: authUser.userId,
          agricultorId: leitura.parcela.agricultorId,
        },
      });

      if (!vinculo) {
        throw new AppError(
          'Não tem permissão para validar leituras de agricultores fora da sua carteira técnica atribuída.',
          403,
          'FORBIDDEN'
        );
      }
    }

    // Transação de validação e notificação
    const leituraAtualizada = await prisma.$transaction(async (tx) => {
      const atualizada = await tx.leituraSolo.update({
        where: { id },
        data: {
          validadoPorTecnico: data.validado,
          tecnicoValidadorId: authUser.userId,
          dataValidacao: new Date(),
          observacoesTecnicas: data.observacoesTecnicas ?? null,
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

      // Disparar notificação para o agricultor
      const statusTexto = data.validado ? 'validada e homologada' : 'revisada com apontamentos';
      await tx.alerta.create({
        data: {
          userId: leitura.parcela.agricultorId,
          tipo: AlertaTipo.SISTEMA,
          titulo: data.validado ? 'Leitura de Solo Validada' : 'Leitura de Solo com Apontamentos',
          mensagem: `A leitura de ${leitura.humidade}% na parcela ${leitura.parcela.nome} foi ${statusTexto} pelo técnico.${data.observacoesTecnicas ? ` Parecer: ${data.observacoesTecnicas}` : ''}`,
          link: `/leituras?parcelaId=${leitura.parcelaId}`,
        },
      });

      return atualizada;
    });

    return createSuccessResponse(leituraAtualizada, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
