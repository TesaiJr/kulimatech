// src/features/pragas/schemas/pragaSchemas.ts
import { z } from 'zod';
import { SeveridadePraga, StatusOcorrencia } from '@prisma/client';

export const createPragaSchema = z.object({
  nome: z.string().min(2, 'Nome da praga deve ter pelo menos 2 caracteres'),
  nomeCientifico: z.string().optional().nullable(),
  descricao: z.string().min(5, 'Descrição deve ter pelo menos 5 caracteres'),
  sintomas: z.string().min(5, 'Sintomas visíveis devem ser descritos detalhadamente'),
  metodosCombate: z.string().min(5, 'Métodos de combate devem ser descritos'),
  severidadePadrao: z.nativeEnum(SeveridadePraga).default(SeveridadePraga.MEDIA),
  culturaId: z.string().optional().nullable(),
});

export const updatePragaSchema = createPragaSchema.partial();

export const createOcorrenciaSchema = z.object({
  parcelaId: z.string().min(1, 'Parcela agrícola é obrigatória'),
  pragaId: z.string().optional().nullable(),
  descricao: z.string().min(5, 'Descreva os sintomas observados na cultura'),
  severidade: z.nativeEnum(SeveridadePraga).default(SeveridadePraga.MEDIA),
  fotoUrl: z
    .string()
    .url('URL da foto inválida')
    .or(z.literal(''))
    .optional()
    .nullable(),
});

export const resolverOcorrenciaSchema = z.object({
  status: z.nativeEnum(StatusOcorrencia, {
    message: 'Status da ocorrência é obrigatório',
  }),
  parecerTecnico: z.string().min(5, 'Parecer técnico é obrigatório'),
  acaoRecomendada: z.string().optional().nullable(),
});

export type CreatePragaInput = z.infer<typeof createPragaSchema>;
export type UpdatePragaInput = z.infer<typeof updatePragaSchema>;
export type CreateOcorrenciaInput = z.infer<typeof createOcorrenciaSchema>;
export type ResolverOcorrenciaInput = z.infer<typeof resolverOcorrenciaSchema>;
