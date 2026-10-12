// src/features/leituras/schemas/leituraSchemas.ts
import { z } from 'zod';

export const createLeituraSchema = z.object({
  parcelaId: z.string().min(1, 'ID da parcela é obrigatório'),
  humidade: z.coerce.number().min(0, 'Humidade mínima é 0%').max(100, 'Humidade máxima é 100%'),
  temperatura: z.coerce.number().optional().nullable(),
  observacoes: z.string().optional().nullable(),
});

export const validarLeituraSchema = z.object({
  validado: z.boolean({
    message: 'O estado de validação (aprovado/rejeitado) é obrigatório.',
  }),
  observacoesTecnicas: z.string().optional().nullable(),
});

export type CreateLeituraInput = z.infer<typeof createLeituraSchema>;
export type ValidarLeituraInput = z.infer<typeof validarLeituraSchema>;
