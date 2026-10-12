// src/app/api/users/[id]/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/rbac/guard';
import { createSuccessResponse } from '@/lib/api/response';
import { handleApiError, AppError } from '@/lib/api/errors';
import { UserRole, UserStatus } from '@prisma/client';
import { updateUserAdminSchema } from '@/features/users/schemas/userAdminSchemas';
import { hashPassword } from '@/lib/auth/password';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authUser = requireRole(req, [UserRole.ADMIN, UserRole.TECNICO]);

    // Técnico só pode consultar se for ele próprio ou um agricultor da sua carteira
    if (authUser.role === UserRole.TECNICO && authUser.userId !== id) {
      const vinculo = await prisma.tecnicoAgricultor.findUnique({
        where: {
          tecnicoId_agricultorId: {
            tecnicoId: authUser.userId,
            agricultorId: id,
          },
        },
      });

      if (!vinculo) {
        throw new AppError('Você não tem permissão para visualizar este utilizador.', 403, 'FORBIDDEN');
      }
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        status: true,
        telefone: true,
        zonaAtuacao: true,
        createdAt: true,
        parcelas: {
          select: {
            id: true,
            nome: true,
            areaHectares: true,
            tipoSolo: true,
            localizacao: true,
            _count: {
              select: {
                leituras: true,
                ocorrencias: true,
                recomendacoes: true,
              },
            },
          },
        },
        tecnicosResponsaveis: {
          select: {
            tecnico: {
              select: {
                id: true,
                nome: true,
                email: true,
                telefone: true,
              },
            },
          },
        },
        agricultoresAcompanhados: {
          select: {
            agricultor: {
              select: {
                id: true,
                nome: true,
                email: true,
                telefone: true,
                zonaAtuacao: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new AppError('Utilizador não encontrado.', 404, 'NOT_FOUND');
    }

    return createSuccessResponse(user, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authUser = requireRole(req, [UserRole.ADMIN]);

    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      throw new AppError('Utilizador não encontrado.', 404, 'NOT_FOUND');
    }

    const body = await req.json();
    const validatedData = updateUserAdminSchema.parse(body);

    // 1. Prevenção de auto-bloqueio ou auto-rebaixamento do Administrador logado
    if (authUser.userId === id) {
      if (validatedData.status && validatedData.status !== UserStatus.ATIVO) {
        throw new AppError(
          'Ação proibida: você não pode desativar ou bloquear a sua própria conta de administrador.',
          400,
          'CANNOT_SELF_DEACTIVATE'
        );
      }
      if (validatedData.role && validatedData.role !== UserRole.ADMIN) {
        throw new AppError(
          'Ação proibida: você não pode alterar o perfil da sua própria conta de administrador.',
          400,
          'CANNOT_SELF_DEMOTE'
        );
      }
    }

    // 2. Proteção do sistema: se tentar desativar um ADMIN, verificar se resta pelo menos 1 ADMIN ativo
    if (
      targetUser.role === UserRole.ADMIN &&
      ((validatedData.status && validatedData.status !== UserStatus.ATIVO) ||
        (validatedData.role && validatedData.role !== UserRole.ADMIN))
    ) {
      const activeAdminsCount = await prisma.user.count({
        where: {
          role: UserRole.ADMIN,
          status: UserStatus.ATIVO,
          id: { not: id },
        },
      });

      if (activeAdminsCount === 0) {
        throw new AppError(
          'Ação proibida: o sistema deve possuir pelo menos um Administrador ativo no sistema.',
          400,
          'MINIMUM_ONE_ACTIVE_ADMIN_REQUIRED'
        );
      }
    }

    // 3. Montar dados para atualização
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};

    if (validatedData.nome) updateData.nome = validatedData.nome;
    if (validatedData.role) updateData.role = validatedData.role as UserRole;
    if (validatedData.status) updateData.status = validatedData.status as UserStatus;
    if (validatedData.telefone !== undefined) updateData.telefone = validatedData.telefone;
    if (validatedData.zonaAtuacao !== undefined) updateData.zonaAtuacao = validatedData.zonaAtuacao;

    if (validatedData.password && validatedData.password.trim().length >= 6) {
      updateData.passwordHash = await hashPassword(validatedData.password.trim());
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        status: true,
        telefone: true,
        zonaAtuacao: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return createSuccessResponse(updatedUser, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
