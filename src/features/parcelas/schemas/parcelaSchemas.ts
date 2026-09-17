import { z } from 'zod';

export const parcelaFormSchema = z.object({
  nome: z
    .string()
    .min(3, 'O nome da parcela deve ter pelo menos 3 caracteres')
    .max(100, 'O nome da parcela não pode ter mais de 100 caracteres'),
  areaHectares: z
    .number()
    .positive('A área deve ser maior que zero')
    .max(10000, 'Área excede o limite máximo permitido'),
  tipoSolo: z.enum(['ARENOSO', 'ARGILOSO', 'FRANCO', 'MISTO', 'OUTRO']),
  localizacao: z.string().optional().nullable(),
  latitude: z
    .number()
    .min(-90, 'Latitude inválida')
    .max(90, 'Latitude inválida')
    .optional()
    .nullable(),
  longitude: z
    .number()
    .min(-180, 'Longitude inválida')
    .max(180, 'Longitude inválida')
    .optional()
    .nullable(),
});

export const createParcelaSchema = parcelaFormSchema;
export const updateParcelaSchema = parcelaFormSchema.partial();

export type ParcelaFormData = z.infer<typeof parcelaFormSchema>;
