import { z } from 'zod';

export const createCardSchema = z.object({
  last4: z
    .string('Ingrese los últimos 4 dígitos')
    .regex(/^\d{4}$/, 'Los últimos 4 dígitos deben ser numéricos'),
  brand: z
    .string('Ingrese el tipo de tarjeta')
    .min(2, 'Ingrese un tipo válido')
    .max(30, 'El tipo debe ser menor a 30 caracteres'),
  color: z
    .string('Ingrese un color')
    .min(3, 'Color inválido')
    .max(30, 'Color inválido')
    .optional()
});

export const updateCardStatusSchema = z.object({
  estado: z
    .coerce
    .number('Estado inválido')
    .refine((v) => v === 0 || v === 1, 'Estado inválido, use 1 o 0')
});
