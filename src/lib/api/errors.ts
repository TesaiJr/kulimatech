// src/lib/api/errors.ts
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { createErrorResponse } from './response';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(message: string, statusCode = 400, code = 'APP_ERROR', details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Handler centralizado e seguro para capturar qualquer excecao nas APIs
 * e devolver a resposta HTTP correta sem expor dados sensiveis.
 */
export function handleApiError(error: unknown): NextResponse {
  console.error('[API Error Log]:', error);

  // 1. Erro customizado da aplicacao
  if (error instanceof AppError) {
    return createErrorResponse(error.message, error.statusCode, error.code, error.details);
  }

  // 2. Erro de validacao Zod (Payload invalido)
  if (error instanceof ZodError) {
    const formattedErrors = error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
    return createErrorResponse(
      'Dados de entrada invalidos. Verifique os campos enviados.',
      400,
      'VALIDATION_ERROR',
      formattedErrors
    );
  }

  // 3. Erro do Prisma / Conexao a Base de Dados
  if (typeof error === 'object' && error !== null) {
    const errObj = error as { code?: string; message?: string; meta?: { target?: string[] } };
    if (errObj.code === 'P2002') {
      const field = errObj.meta?.target?.join(', ') || 'campo';
      return createErrorResponse(
        `Ja existe um registo com este ${field}.`,
        409,
        'DUPLICATE_RESOURCE'
      );
    }
    if (errObj.code === 'ECONNREFUSED' || (errObj.message && (errObj.message.includes('ECONNREFUSED') || errObj.message.includes('Can\'t reach database server')))) {
      return createErrorResponse(
        'Nao foi possivel conectar a base de dados (PostgreSQL/Supabase). Verifique se o servidor de banco de dados esta ativo e a variavel DATABASE_URL esta correta no ficheiro .env.',
        503,
        'DATABASE_CONNECTION_ERROR'
      );
    }
  }

  if (error instanceof Error && (error.message.includes('ECONNREFUSED') || error.message.includes('Can\'t reach database server'))) {
    return createErrorResponse(
      'Nao foi possivel conectar a base de dados (PostgreSQL/Supabase). Verifique se o servidor de banco de dados esta ativo e a variavel DATABASE_URL esta correta no ficheiro .env.',
      503,
      'DATABASE_CONNECTION_ERROR'
    );
  }

  // 4. Erro de JSON Web Token
  if (error instanceof Error && (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError')) {
    return createErrorResponse('Token de autenticacao invalido ou expirado.', 401, 'UNAUTHORIZED');
  }

  // 5. Erro generico de servidor (500)
  const isProduction = process.env.NODE_ENV === 'production';
  const errorMessage = isProduction
    ? 'Ocorreu um erro interno no servidor. Tente novamente mais tarde.'
    : error instanceof Error ? error.message : 'Erro interno desconhecido.';

  return createErrorResponse(errorMessage, 500, 'INTERNAL_SERVER_ERROR');
}
