import { z } from 'zod';

// Esquema básico para crear auditorías
export const createAuditSchema = z
.object({
    id_user: z
    .coerce
    .bigint('Ingrese un numero entero para el id de usuario.')
    .min(1, 'El id de usuario no puede ser menor a 1')
    .max(2000000000, 'Numero ingresado demasiado grande.'),
    accion: z
    .string('Las acciones no pueden estar vacias')
    .min(4, 'La accion ingresada deber ser mas larga')
    .max(150, 'La accion ingresada debe ser mas corta')
})
.superRefine(
    
);