// src/features/parcelas/schemas/parcelaSchemas.ts
import { z } from 'zod';

export const tiposSoloValidos = ['ARENOSO', 'ARGILOSO', 'FRANCO', 'MISTO', 'OUTRO'] as const;

export const createParcelaSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(3, 'O nome da parcela deve ter no minimo 3 caracteres.')
    .max(100, 'O nome da parcela nao pode exceder 100 caracteres.'),
  areaHectares: z
    .number({
      required_error: 'A area em hectares e obrigatoria.',
      invalid_type_error: 'A area deve ser um valor numerico.',
    })
    .positive('A area deve ser um numero maior que zero.')
    .max(10000, 'A area informada e excessiva (maximo 10.000 hectares).'),
  tipoSolo: z
    .enum(tiposSoloValidos, {
      error: 'Tipo de solo invalido. Escolha entre: ARENOSO, ARGILOSO, FRANCO, MISTO ou OUTRO.',
    })
    .default('FRANCO'),
  localizacao: z
    .string()
    .trim()
    .max(255, 'A descricao da localizacao nao pode exceder 255 caracteres.')
    .optional()
    .nullable(),
  latitude: z
    .number()
    .min(-90, 'A latitude deve estar entre -90 e 90.')
    .max(90, 'A latitude deve estar entre -90 e 90.')
    .optional()
    .nullable(),
  longitude: z
    .number()
    .min(-180, 'A longitude deve estar entre -180 e 180.')
    .max(180, 'A longitude deve estar entre -180 e 180.')
    .optional()
    .nullable(),
});

export const updateParcelaSchema = createParcelaSchema.partial();

export type CreateParcelaSchema = z.infer<typeof createParcelaSchema>;
export type UpdateParcelaSchema = z.infer<typeof updateParcelaSchema>;
