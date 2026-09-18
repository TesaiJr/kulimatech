// src/app/api/auth/reset-password/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth/password';
import { createSuccessResponse } from '@/lib/api/response';
import { handleApiError, AppError } from '@/lib/api/errors';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve conter pelo menos 6 caracteres'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = resetPasswordSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, nome: true },
    });

    if (!user) {
      throw new AppError('Utilizador não encontrado no sistema.', 404, 'USER_NOT_FOUND');
    }

    const passwordHash = await hashPassword(password);

    await prisma.user.update({
      where: { email },
      data: { passwordHash },
    });

    // Sincronizar também no Supabase Auth
    try {
      const { supabaseServer } = await import('@/lib/supabase/server');
      const { data: sbUsers } = await supabaseServer.auth.admin.listUsers();
      const sbUser = sbUsers?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
      if (sbUser) {
        await supabaseServer.auth.admin.updateUserById(sbUser.id, { password });
      }
    } catch (sbErr) {
      console.warn('Aviso ao sincronizar senha no Supabase:', sbErr);
    }

    return createSuccessResponse(
      { message: 'Palavra-passe redefinida com sucesso. Já pode iniciar sessão.' },
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}
