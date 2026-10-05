// src/features/comunicacao/schemas/comunicacaoSchemas.ts
import { z } from 'zod';
import { AlertaTipo } from '@prisma/client';

export const enviarMensagemSchema = z.object({
  destinatarioId: z.string().min(1, 'ID do destinatário é obrigatório.'),
  conteudo: z
    .string()
    .trim()
    .min(1, 'A mensagem não pode estar vazia.')
    .max(1000, 'A mensagem não pode exceder 1000 caracteres.'),
});

export const atualizarAlertaSchema = z.object({
  lido: z.boolean({
    error: 'O campo "lido" deve ser booleano (true ou false).',
  }),
});

export const criarAlertaSchema = z.object({
  userId: z.string().min(1, 'ID do utilizador é obrigatório.'),
  tipo: z.nativeEnum(AlertaTipo).default(AlertaTipo.SISTEMA),
  titulo: z.string().trim().min(3, 'Título deve ter no mínimo 3 caracteres.').max(150),
  mensagem: z.string().trim().min(5, 'Mensagem deve ter no mínimo 5 caracteres.').max(500),
  link: z.string().trim().optional().nullable(),
});
