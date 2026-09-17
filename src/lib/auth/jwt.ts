// src/lib/auth/jwt.ts
import jwt, { SignOptions } from 'jsonwebtoken';
import { UserRole } from '@/features/auth/types';

export interface JwtUserPayload {
  userId: string;
  email: string;
  role: UserRole;
  nome: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'kulimatech_secure_jwt_token_secret_nhamatanda_2026';
const JWT_EXPIRES_IN = '8h';

/**
 * Assina e emite um novo token JWT contendo os dados essenciais da sessao
 */
export function signJwtToken(payload: JwtUserPayload): string {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN,
    algorithm: 'HS256',
  };

  return jwt.sign(payload, JWT_SECRET, options);
}

/**
 * Verifica e decodifica um token JWT. Retorna o payload se for valido, ou dispara erro se for invalido/expirado.
 */
export function verifyJwtToken(token: string): JwtUserPayload {
  return jwt.verify(token, JWT_SECRET) as JwtUserPayload;
}
