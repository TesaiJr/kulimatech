// src/app/api/auth/verify-otp/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabaseServer } from '@/lib/supabase/server';
import { signJwtToken } from '@/lib/auth/jwt';
import { createSuccessResponse } from '@/lib/api/response';
import { handleApiError, AppError } from '@/lib/api/errors';
import { UserStatus } from '@prisma/client';
import { z } from 'zod';

const verifyOtpSchema = z.object({
  email: z.string().email(),
  token: z.string().min(4, 'Código inválido'),
  type: z.enum(['signup', 'recovery', 'email']).default('signup'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, token, type } = verifyOtpSchema.parse(body);

    // 1. Validar OTP através do Supabase no servidor
    const { error: sbError } = await supabaseServer.auth.verifyOtp({
      email,
      token: token.trim(),
      type: type as 'signup' | 'recovery' | 'email',
    });

    if (sbError) {
      if (sbError.message.includes('Token has expired')) {
        throw new AppError('O código de confirmação expirou. Por favor, solicite um novo código.', 400, 'OTP_EXPIRED');
      }
      throw new AppError('Código de confirmação incorreto ou inválido. Verifique o código recebido no seu e-mail.', 400, 'INVALID_OTP');
    }

    // 2. Se for ativação de conta (signup)
    if (type === 'signup') {
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

      const jwtToken = signJwtToken({
        userId: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        nome: updatedUser.nome,
      });

      const response = createSuccessResponse({ user: updatedUser, token: jwtToken }, 200);

      response.cookies.set({
        name: 'token',
        value: jwtToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 8 * 60 * 60,
      });

      return response;
    }

    // Se for recuperação
    return createSuccessResponse({ verified: true, message: 'Código de recuperação verificado com sucesso.' }, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
