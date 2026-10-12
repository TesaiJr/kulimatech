// src/lib/rbac/guard.ts
import { NextRequest } from 'next/server';
import { UserRole } from '@/features/auth/types';
import { verifyJwtToken, JwtUserPayload } from '../auth/jwt';
import { AppError } from '../api/errors';

/**
 * Extrai o token JWT do header Authorization: Bearer ou dos cookies da requisicao
 */
export function extractTokenFromRequest(req: Request | NextRequest): string | null {
  // 1. Header Authorization
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  // 2. Cookie (suporte se for NextRequest)
  if ('cookies' in req && typeof (req as NextRequest).cookies.get === 'function') {
    const cookieToken = (req as NextRequest).cookies.get('token')?.value;
    if (cookieToken) return cookieToken;
  }

  // 3. Query parameter 'token' (necessário para conexões SSE / EventSource que não enviam headers customizados)
  try {
    const url = new URL(req.url);
    const queryToken = url.searchParams.get('token');
    if (queryToken) return queryToken;
  } catch {}

  return null;
}

/**
 * Autentica o utilizador a partir da requisicao.
 * Dispara AppError 401 caso o token nao exista ou seja invalido.
 */
export function requireAuth(req: Request | NextRequest): JwtUserPayload {
  const token = extractTokenFromRequest(req);
  if (!token) {
    throw new AppError('Acesso nao autorizado. Token de autenticacao ausente.', 401, 'UNAUTHORIZED');
  }

  try {
    return verifyJwtToken(token);
  } catch {
    throw new AppError('Sessao expirada ou token invalido. Faca login novamente.', 401, 'UNAUTHORIZED');
  }
}

/**
 * Valida se o utilizador autenticado possui um dos papeis requeridos.
 * Dispara AppError 403 caso o perfil nao tenha permissao.
 */
export function requireRole(req: Request | NextRequest, allowedRoles: UserRole[]): JwtUserPayload {
  const user = requireAuth(req);

  if (!allowedRoles.includes(user.role)) {
    throw new AppError(
      `Acesso negado. Esta operacao requer permissao de: ${allowedRoles.join(', ')}.`,
      403,
      'FORBIDDEN'
    );
  }

  return user;
}
