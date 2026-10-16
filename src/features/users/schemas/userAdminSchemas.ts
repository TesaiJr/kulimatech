// src/features/users/schemas/userAdminSchemas.ts
import { z } from 'zod';

export const createUserAdminSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(3, 'O nome deve ter pelo menos 3 caracteres.')
    .max(100, 'O nome não pode exceder 100 caracteres.'),
  email: z
    .string()
    .trim()
    .email('Formato de e-mail inválido.')
    .toLowerCase(),
  password: z
    .string()
    .min(6, 'A senha deve conter no mínimo 6 caracteres.')
    .max(100, 'A senha não pode exceder 100 caracteres.'),
  role: z.enum(['ADMIN', 'TECNICO', 'AGRICULTOR'], {
    message: 'Selecione um perfil válido.',
  }),
  status: z.enum(['ATIVO', 'INATIVO', 'BLOQUEADO']).default('ATIVO'),
  telefone: z
    .string()
    .trim()
    .optional()
    .nullable(),
  zonaAtuacao: z
    .string()
    .trim()
    .optional()
    .nullable(),
});

export const updateUserAdminSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(3, 'O nome deve ter pelo menos 3 caracteres.')
    .max(100, 'O nome não pode exceder 100 caracteres.')
    .optional(),
  role: z.enum(['ADMIN', 'TECNICO', 'AGRICULTOR']).optional(),
  status: z.enum(['ATIVO', 'INATIVO', 'BLOQUEADO']).optional(),
  telefone: z
    .string()
    .trim()
    .optional()
    .nullable(),
  zonaAtuacao: z
    .string()
    .trim()
    .optional()
    .nullable(),
  password: z
    .string()
    .min(6, 'A senha deve conter no mínimo 6 caracteres.')
    .max(100, 'A senha não pode exceder 100 caracteres.')
    .optional()
    .or(z.literal('')),
});

export const atribuicaoCarteiraSchema = z.object({
  tecnicoId: z.string().min(1, 'Selecione um técnico responsável.'),
  agricultorIds: z
    .array(z.string().min(1))
    .min(1, 'Selecione pelo menos um agricultor para vincular.'),
});

export const removerAtribuicaoSchema = z.object({
  tecnicoId: z.string().min(1, 'ID do técnico é obrigatório.'),
  agricultorId: z.string().min(1, 'ID do agricultor é obrigatório.'),
});
