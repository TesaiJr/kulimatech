// src/app/api/auth/login/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { loginSchema } from '@/features/auth/schemas/authSchemas';
import { verifyPassword } from '@/lib/auth/password';
import { signJwtToken } from '@/lib/auth/jwt';
import { createSuccessResponse } from '@/lib/api/response';
import { handleApiError, AppError } from '@/lib/api/errors';
import { AuthResponseData } from '@/features/auth/types';
import { UserStatus } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    // 1. Localizar utilizador pelo e-mail
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        nome: true,
        email: true,
        passwordHash: true,
        role: true,
        status: true,
        telefone: true,
        zonaAtuacao: true,
        createdAt: true,
      },
    });

    // Prevencao contra enumeracao: mensagem identica se o usuario nao existir ou senha incorreta
    if (!user) {
      throw new AppError('E-mail ou senha incorretos.', 401, 'INVALID_CREDENTIALS');
    }

    // 2. Verificar senha por hash seguro
    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('E-mail ou senha incorretos.', 401, 'INVALID_CREDENTIALS');
    }

    // 3. Verificar status da conta
    if (user.status !== UserStatus.ATIVO) {
      throw new AppError(
        'Sua conta esta inativa ou bloqueada. Entre em contacto com a administracao do SDAE.',
        403,
        'ACCOUNT_INACTIVE'
      );
    }

    // 4. Gerar token JWT
    const token = signJwtToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      nome: user.nome,
    });

    // 5. Retornar dados sanitizados (removendo passwordHash explicitamente)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...sanitizedUser } = user;

    const responseData: AuthResponseData = {
      user: sanitizedUser,
      token,
    };

    const response = createSuccessResponse(responseData, 200);

    // Definir cookie HTTP-Only para reforco de seguranca
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 8 * 60 * 60, // 8 horas
    });

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
