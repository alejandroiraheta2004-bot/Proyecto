import { z } from 'zod';

export const createPaymentSchema = z.object({
  serviceName: z
    .string('Ingrese el servicio')
    .min(3, 'Servicio inválido')
    .max(120, 'Servicio inválido'),
  accountNumber: z
    .string('Ingrese la cuenta del servicio')
    .min(3, 'Cuenta inválida')
    .max(60, 'Cuenta inválida'),
  amount: z
    .coerce
    .number('Ingrese un monto válido')
    .positive('El monto debe ser mayor a 0'),
  executionDate: z
    .string('Ingrese la fecha de ejecución')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida'),
  frequency: z
    .string('Ingrese la frecuencia')
    .regex(/^(once|weekly|monthly)$/i, 'Frecuencia inválida')
});

export const updatePaymentSchema = z.object({
  serviceName: z
    .string('Ingrese el servicio')
    .min(3, 'Servicio inválido')
    .max(120, 'Servicio inválido')
    .optional(),
  accountNumber: z
    .string('Ingrese la cuenta del servicio')
    .min(3, 'Cuenta inválida')
    .max(60, 'Cuenta inválida')
    .optional(),
  amount: z
    .coerce
    .number('Ingrese un monto válido')
    .positive('El monto debe ser mayor a 0')
    .optional(),
  executionDate: z
    .string('Ingrese la fecha de ejecución')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida')
    .optional(),
  nextExecutionDate: z
    .string('Ingrese la fecha de ejecución')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida')
    .optional(),
  frequency: z
    .string('Ingrese la frecuencia')
    .regex(/^(once|weekly|monthly)$/i, 'Frecuencia inválida')
    .optional(),
  status: z
    .string('Ingrese el estado')
    .regex(/^(scheduled|completed|cancelled)$/i, 'Estado inválido')
    .optional()
});
