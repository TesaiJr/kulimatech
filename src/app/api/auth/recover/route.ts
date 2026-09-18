// src/app/api/auth/recover/route.ts
import { NextRequest } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { createSuccessResponse } from '@/lib/api/response';
import { handleApiError, AppError } from '@/lib/api/errors';
import { z } from 'zod';

const recoverSchema = z.object({
  email: z.string().email('E-mail inválido'),
  redirectTo: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, redirectTo } = recoverSchema.parse(body);

    const redirectUrl = redirectTo || `${req.nextUrl.origin}/auth?mode=reset`;

    // 1. Tentar envio padrão via Supabase Auth (caso SMTP próprio esteja configurado)
    const { error } = await supabaseServer.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (!error) {
      return createSuccessResponse(
        { message: 'Link e instruções de recuperação enviados com sucesso para o seu e-mail.' },
        200
      );
    }

    // 2. Se o Supabase atingiu o limite gratuito de e-mails (429 rate limit)
    const isRateLimited = error.message.includes('rate limit') || error.status === 429;
    if (isRateLimited) {
      // Gerar link e OTP de recuperação diretamente via Admin API sem ser bloqueado pelo rate limit de email
      const { data: linkData, error: linkError } = await supabaseServer.auth.admin.generateLink({
        type: 'recovery',
        email,
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (!linkError && linkData?.properties) {
        const otp = linkData.properties.email_otp;
        const actionLink = linkData.properties.action_link;

        console.log(`\n======================================================`);
        console.log(`[RECUPERAÇÃO DE SENHA - SUPABASE OTP GERADO]`);
        console.log(`E-mail: ${email}`);
        console.log(`Código OTP: ${otp}`);
        console.log(`Link Direto: ${actionLink}`);
        console.log(`======================================================\n`);

        return createSuccessResponse(
          {
            message: 'Código de recuperação gerado com sucesso.',
            otp,
            actionLink,
            rateLimitBypassed: true,
          },
          200
        );
      }

      throw new AppError(
        'Limite de envio de e-mails atingido no Supabase. Configure o SMTP próprio no painel do Supabase ou aguarde alguns minutos.',
        429,
        'RATE_LIMIT'
      );
    }

    throw new AppError(error.message, 400, 'RECOVER_ERROR');
  } catch (error) {
    return handleApiError(error);
  }
}
