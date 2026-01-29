import pool from "../config/database.js";

export const doesRolDescriptionAlreadyExist = async (descripcion) => {
    // Verifica si ya existe un rol con la descripción dada
    const [rolDescription] = await pool.query(`
            SELECT * FROM rols WHERE descripcion = "${descripcion}";
    `);

    console.log('rol service js', rolDescription[0]);

    return rolDescription[0];
};