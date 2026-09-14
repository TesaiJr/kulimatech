// src/lib/auth/password.ts
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/**
 * Gera o hash de uma senha em texto plano utilizando bcrypt com salt 12
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

/**
 * Compara uma senha em texto plano com um hash gravado no banco de dados.
 * Imune a ataques de temporizacao (timing-safe).
 */
export async function verifyPassword(plainPassword: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, passwordHash);
}
