import { z } from 'zod';

export const rechargeSchema = z.object({
  bankName: z
    .string('Ingrese el banco emisor')
    .min(3, 'Banco inválido')
    .max(80, 'Banco inválido'),
  cardType: z
    .string('Ingrese el tipo de tarjeta')
    .regex(/^(debito|d[eé]bito|credito|cr[eé]dito)$/i, 'Tipo de tarjeta inválido'),
  holderName: z
    .string('Ingrese el titular')
    .min(3, 'Titular inválido')
    .max(120, 'Titular inválido'),
  cardNumber: z
    .string('Ingrese el número de tarjeta')
    .regex(/^\d{13,19}$/, 'Número de tarjeta inválido'),
  expiry: z
    .string('Ingrese la fecha de vencimiento')
    .regex(/^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/, 'Fecha inválida'),
  cvv: z
    .string('Ingrese el CVV')
    .regex(/^\d{3}$/, 'CVV inválido'),
  amount: z
    .coerce
    .number('Ingrese un monto válido')
    .positive('El monto debe ser mayor a 0'),
  description: z
    .string()
    .max(200, 'La descripción debe ser menor a 200 caracteres')
    .optional()
});
