// src/features/culturas/schemas/culturaSchemas.ts
import { z } from 'zod';

export const culturaBaseSchema = z.object({
  nome: z
    .string()
    .min(2, 'O nome da cultura deve ter pelo menos 2 caracteres')
    .max(100, 'O nome da cultura não pode ter mais de 100 caracteres'),
  nomeCientifico: z.string().max(120, 'Nome científico muito longo').optional().nullable(),
  descricao: z
    .string()
    .min(10, 'A descrição deve ter pelo menos 10 caracteres'),
  humidadeMin: z.coerce
    .number()
    .min(0, 'Humidade mínima não pode ser inferior a 0%')
    .max(100, 'Humidade mínima não pode ultrapassar 100%'),
  humidadeMax: z.coerce
    .number()
    .min(0, 'Humidade máxima não pode ser inferior a 0%')
    .max(100, 'Humidade máxima não pode ultrapassar 100%'),
  cicloDias: z.coerce.number().int().positive('Ciclo deve ser positivo em dias').optional().nullable(),
  epocaPlantio: z.string().max(100, 'Época de plantio muito longa').optional().nullable(),
  cuidados: z.string().optional().nullable(),
});

export const culturaFormSchema = culturaBaseSchema.refine(
  (data) => data.humidadeMin <= data.humidadeMax,
  {
    message: 'A humidade mínima não pode ser superior à humidade máxima',
    path: ['humidadeMin'],
  }
);

export const createCulturaSchema = culturaFormSchema;

export const updateCulturaSchema = culturaBaseSchema.partial().refine(
  (data) => {
    if (data.humidadeMin !== undefined && data.humidadeMax !== undefined) {
      return data.humidadeMin <= data.humidadeMax;
    }
    return true;
  },
  {
    message: 'A humidade mínima não pode ser superior à humidade máxima',
    path: ['humidadeMin'],
  }
);

export const createRecomendacaoSchema = z.object({
  parcelaId: z.string().min(1, 'Selecione uma parcela'),
  culturaId: z.string().optional().nullable(),
  parecer: z
    .string()
    .min(10, 'O parecer técnico deve conter no mínimo 10 caracteres')
    .max(2000, 'O parecer técnico não pode ultrapassar 2000 caracteres'),
});

export const updateStatusRecomendacaoSchema = z.object({
  status: z.enum(['PENDENTE', 'APLICADA', 'ARQUIVADA']),
  parecer: z.string().max(2000).optional(),
});

export type CulturaFormData = z.infer<typeof culturaFormSchema>;
export type CreateRecomendacaoData = z.infer<typeof createRecomendacaoSchema>;
export type UpdateStatusRecomendacaoData = z.infer<typeof updateStatusRecomendacaoSchema>;
