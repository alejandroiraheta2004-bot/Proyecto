import { z } from 'zod';
import * as UserService from '../services/user.service.js';

// Validación para creación de usuario
export const createUserSchema = z.object({
    nombre: z
        .string('Ingrese un nombre')
        .min(3, 'Ingrese al menos 3 caracteres')
        .max(200, 'Ingrese un nombre con menos de 200 caracteres'),
    username: z
        .string('Ingrese un nombre de usuario')
        .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
        .max(100, 'El nombre de usuario debe tener menos de 100 caracteres'),
    email: z
        .string('El correo es obligatorio')
        .email('Ingrese un email válido'),
    telefono: z
        .string('Ingrese un número de teléfono')
        .min(8, 'Ingrese un teléfono válido')
        .max(20, 'El teléfono debe ser menor a 20 caracteres'),
    password: z
        .string('Ingrese una contraseña')
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .max(64, 'La contraseña debe tener máximo 64 caracteres')
})
.superRefine(async (data, ctx) => {
    // Evita contraseñas que contengan el nombre
    const passwordHasName = data.password.toLowerCase().includes(data.nombre.toLowerCase());
    if (passwordHasName) {
        ctx.addIssue({
            code:'custom',
            message:'La contraseña no debe contener su nombre',
            path:['password']
        });
     }

    // Valida que el email no exista
    const existingUser = await UserService.userExists(data.email);
    if (existingUser) {
        ctx.addIssue ({
            code: 'custom',
            path: ['email'],
            message:'El usuario ya está registrado'
        });
    }

    // Valida que el username no exista
    const existingUsername = await UserService.usernameExists(data.username);
    if (existingUsername) {
        ctx.addIssue ({
            code: 'custom',
            path: ['username'],
            message:'El nombre de usuario ya está en uso'
        });
    }
});


// Validación para verificar rol asignado a un usuario
export const validateUserInfoSchema = z.object({
    rol: z
    .string("Ingrese un rol")
    .regex(/^[a-zA-Z]+$/, "Rol no valido.")
    .min(4)
    .max(255),
    id_user: z
    .coerce
    .bigint('El id del usuario debe ser ingresado')
    .min(1, 'El id de usuario debe ser mayor a 0.')
    .max(2000000000, 'El id de usuario debe ser un numero menor')
})
.superRefine(async (data, ctx) => {
    const assigedRol = await UserService.doesTheUserHaveSubmittedRol(data.rol, data.id_user);
    if (!assigedRol) {
        ctx.addIssue({
            code:'custom',
            message:'El usuario no corresponde con el nivel de permiso asignado',
            path: ['rol']
        });
    }
});