// src/app/api/users/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/rbac/guard';
import { createSuccessResponse } from '@/lib/api/response';
import { handleApiError, AppError } from '@/lib/api/errors';
import { UserRole, UserStatus } from '@prisma/client';
import { createUserAdminSchema } from '@/features/users/schemas/userAdminSchemas';
import { hashPassword } from '@/lib/auth/password';

export async function GET(req: NextRequest) {
  try {
    // 1. Acesso restrito a Administradores e Técnicos SDAE
    const authUser = requireRole(req, [UserRole.ADMIN, UserRole.TECNICO]);

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim();
    const roleParam = searchParams.get('role')?.toUpperCase();
    const statusParam = searchParams.get('status')?.toUpperCase();

    // 2. Filtros dinâmicos com RBAC rigoroso
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { telefone: { contains: search, mode: 'insensitive' } },
        { zonaAtuacao: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (authUser.role === UserRole.TECNICO) {
      // Isolamento estrito da carteira técnica: o técnico vê APENAS agricultores atribuídos a ele
      whereClause.role = UserRole.AGRICULTOR;
      whereClause.tecnicosResponsaveis = {
        some: {
          tecnicoId: authUser.userId,
        },
      };
    } else {
      // Administrador pode filtrar por role e status livremente
      if (roleParam && roleParam !== 'ALL' && Object.values(UserRole).includes(roleParam as UserRole)) {
        whereClause.role = roleParam as UserRole;
      }
      if (statusParam && statusParam !== 'ALL' && Object.values(UserStatus).includes(statusParam as UserStatus)) {
        whereClause.status = statusParam as UserStatus;
      }
    }

    // 3. Consulta com relações para visualização completa
    const users = await prisma.user.findMany({
      where: whereClause,
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
            agricultoresAcompanhados: true,
            tecnicosResponsaveis: true,
            leiturasValidadas: true,
            recomendacoesEmitidas: true,
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
      orderBy: { createdAt: 'desc' },
    });

    return createSuccessResponse(users, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Apenas Administradores podem criar utilizadores administrativamente
    requireRole(req, [UserRole.ADMIN]);

    const body = await req.json();
    const validatedData = createUserAdminSchema.parse(body);

    // 2. Verificar se o e-mail já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
      select: { id: true },
    });

    if (existingUser) {
      throw new AppError('Este endereço de e-mail já está em uso por outro utilizador.', 409, 'EMAIL_ALREADY_EXISTS');
    }

    // 3. Gerar hash de senha seguro
    const passwordHash = await hashPassword(validatedData.password);

    // 4. Criar utilizador
    const newUser = await prisma.user.create({
      data: {
        nome: validatedData.nome,
        email: validatedData.email,
        passwordHash,
        role: validatedData.role as UserRole,
        status: (validatedData.status as UserStatus) || UserStatus.ATIVO,
        telefone: validatedData.telefone || null,
        zonaAtuacao: validatedData.zonaAtuacao || null,
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
      },
    });

    // 5. Criar alerta de boas-vindas do sistema
    await prisma.alerta.create({
      data: {
        userId: newUser.id,
        tipo: 'SISTEMA',
        titulo: 'Boas-vindas ao KulimaTech',
        mensagem: `Bem-vindo ao KulimaTech, ${newUser.nome}! A sua conta institucional (${newUser.role}) foi configurada pelo Administrador distrital.`,
        lido: false,
      },
    });

    return createSuccessResponse(newUser, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
