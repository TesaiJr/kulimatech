// src/app/api/users/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/rbac/guard';
import { createSuccessResponse } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/errors';
import { UserRole, UserStatus } from '@/features/auth/types';

export async function GET(req: NextRequest) {
  try {
    // 1. Acesso restrito a Administradores
    requireRole(req, [UserRole.ADMIN]);

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim();
    const roleParam = searchParams.get('role')?.toUpperCase();
    const statusParam = searchParams.get('status')?.toUpperCase();

    // 2. Filtros dinamicos
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (roleParam && Object.values(UserRole).includes(roleParam as UserRole)) {
      whereClause.role = roleParam as UserRole;
    }

    if (statusParam && Object.values(UserStatus).includes(statusParam as UserStatus)) {
      whereClause.status = statusParam as UserStatus;
    }

    // 3. Consulta paginada/ordenada
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
      },
      orderBy: { createdAt: 'desc' },
    });

    return createSuccessResponse(users, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
