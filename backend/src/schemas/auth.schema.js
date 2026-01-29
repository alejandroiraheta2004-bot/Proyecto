import { z } from 'zod';
import { userExists, verifyPassword } from '../services/user.service.js';

// Esquema de login con validaciones de existencia y contraseña
export const loginSchema = z.object({
    email: z
    .string('El correo electrónico es obligatorio')
    .email({ message: "Correo electrónico inválido" }),
    password: z
    .string('La contraseña es obligatoria')
})
.superRefine( async (data, ctx) => {
    const email = (data.email || '').trim().toLowerCase();
    const user =  await userExists(email);
    if (!user) {
        ctx.addIssue({
            code: "custom",
            path: ['email', "password"],
            message: 'Correo electrónico o contraseña incorrectos'
        });
    }

    const validPassword = await verifyPassword(email, data.password);
    console.log(validPassword);
    if (!validPassword) {
        ctx.addIssue({
            code: "custom",
            path: ['email', "password"],
            message: 'Correo electrónico o contraseña incorrectos_'
        });
    }
});