// src/app/api/auth/activate/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signJwtToken } from '@/lib/auth/jwt';
import { createSuccessResponse } from '@/lib/api/response';
import { handleApiError, AppError } from '@/lib/api/errors';
import { UserStatus } from '@prisma/client';
import { z } from 'zod';

const activateSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = activateSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError('Utilizador não encontrado.', 404, 'USER_NOT_FOUND');
    }

    // Ativar conta no PostgreSQL/Prisma
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { status: UserStatus.ATIVO },
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

    // Gerar token de sessão imediato
    const token = signJwtToken({
      userId: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      nome: updatedUser.nome,
    });

    const response = createSuccessResponse({ user: updatedUser, token }, 200);

    // Definir cookie HTTP-Only
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 8 * 60 * 60,
    });

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
