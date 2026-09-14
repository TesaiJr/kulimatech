// src/app/api/auth/register/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { registerSchema } from '@/features/auth/schemas/authSchemas';
import { hashPassword } from '@/lib/auth/password';
import { signJwtToken } from '@/lib/auth/jwt';
import { createSuccessResponse } from '@/lib/api/response';
import { handleApiError, AppError } from '@/lib/api/errors';
import { AuthResponseData } from '@/features/auth/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = registerSchema.parse(body);

    // 1. Verificar se ja existe utilizador com o mesmo e-mail
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
      select: { id: true },
    });

    if (existingUser) {
      throw new AppError('Ja existe uma conta registada com este endereco de e-mail.', 409, 'EMAIL_ALREADY_EXISTS');
    }

    // 2. Gerar hash criptografico da senha
    const passwordHash = await hashPassword(validatedData.password);

    // 3. Criar utilizador no banco de dados
    const newUser = await prisma.user.create({
      data: {
        nome: validatedData.nome,
        email: validatedData.email,
        passwordHash,
        telefone: validatedData.telefone,
        role: validatedData.role,
        zonaAtuacao: validatedData.zonaAtuacao,
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

    // 4. Emitir token JWT inicial
    const token = signJwtToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      nome: newUser.nome,
    });

    const responseData: AuthResponseData = {
      user: newUser,
      token,
    };

    return createSuccessResponse(responseData, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
