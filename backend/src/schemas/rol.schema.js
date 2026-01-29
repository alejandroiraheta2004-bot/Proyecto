import { z } from 'zod';
import { doesRolDescriptionAlreadyExist } from '../services/rol.service.js';

// Valida datos para creación de roles
export const createRolSchema = z.object({
    descripcion: z
    .string("Ingrese un rol")
    .regex(/^[a-zA-Z]+$/, "La descripcion del rol no puede contener espacios ni caracteres especiales.")
    .min(4)
    .max(255)

}).superRefine( async (data, ctx) => {
    const userDescripcionExists = await doesRolDescriptionAlreadyExist(data.descripcion);
    console.log(userDescripcionExists, ' rol schema js');
    
    if (userDescripcionExists) {
        ctx.addIssue({
            code: "custom",
            message: "Ese rol ya existe.",
            path: ['descripcion']
        });
        console.log("test 01 rol schema js");
        
    }

    console.log("test 02 rol schema js");
});
