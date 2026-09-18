// src/features/auth/schemas/authSchemas.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email('Formato de e-mail invalido.')
    .toLowerCase(),
  password: z
    .string()
    .min(6, 'A senha deve conter no minimo 6 caracteres.'),
});

export const registerSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(3, 'O nome deve ter pelo menos 3 caracteres.')
    .max(100, 'O nome nao pode exceder 100 caracteres.'),
  email: z
    .string()
    .trim()
    .email('Formato de e-mail invalido.')
    .toLowerCase(),
  password: z
    .string()
    .min(8, 'A senha deve conter no minimo 8 caracteres.')
    .max(100, 'A senha nao pode exceder 100 caracteres.'),
  telefone: z
    .string()
    .trim()
    .optional()
    .nullable(),
  role: z
    .enum(['AGRICULTOR', 'TECNICO'])
    .default('AGRICULTOR'),
  zonaAtuacao: z
    .string()
    .trim()
    .optional()
    .nullable(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
