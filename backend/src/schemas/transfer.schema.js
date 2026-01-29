import { z } from 'zod';

export const sendInternalSchema = z.object({
  identifier: z
    .string('Ingrese el username o número de cuenta')
    .min(3, 'Ingrese un destinatario válido')
    .max(120, 'Destinatario inválido'),
  amount: z
    .coerce
    .number('Ingrese un monto válido')
    .positive('El monto debe ser mayor a 0'),
  description: z
    .string()
    .max(200, 'La descripción debe ser menor a 200 caracteres')
    .optional()
});

export const sendExternalSchema = z.object({
  bankName: z
    .string('Ingrese el banco')
    .min(3, 'Banco inválido')
    .max(80, 'Banco inválido'),
  accountNumber: z
    .string('Ingrese la cuenta destino')
    .regex(/^\d{10,20}$/, 'Formato de cuenta inválido'),
  holderName: z
    .string('Ingrese el titular')
    .min(3, 'Titular inválido')
    .max(120, 'Titular inválido'),
  amount: z
    .coerce
    .number('Ingrese un monto válido')
    .positive('El monto debe ser mayor a 0'),
  description: z
    .string()
    .max(200, 'La descripción debe ser menor a 200 caracteres')
    .optional()
});
