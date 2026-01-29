import pool from '../config/database.js';

export const getRols = async () => {
    // Devuelve todos los roles
    const [rows] = await pool.query(`
            SELECT * FROM rols;
        `);

    return rows;    
};

export const getRol = async (id) => {
    // Busca rol por id
    const [rows] = await pool.query(`
            SELECT * FROM rols WHERE id = ?;
        `, [id]
    );
    console.log(id);
    
    return rows[0];
};

export const createRol = async (rol) => {
    const { descripcion } = rol;
    // console.log(description, rol, 'test 01');

    // Inserta rol nuevo
    const result = await pool.query(`
        INSERT INTO rols(descripcion) VALUES(?);
    `, [descripcion]);

    return descripcion;
};

export const updateRol = async (id, body) => {
    const { descripcion } = body;
    
    // Actualiza descripción del rol
    const result = await pool.query(`
          UPDATE rols
          SET descripcion = ?
          WHERE id = ?;
      `, [descripcion, id]);  
    console.log(descripcion);
    
    return result;
};

export const deleteRol = async (id) => {
    // console.log(id, "test m");
    // Borra rol por id
   const result = await pool.query(`
        DELETE FROM rols
        WHERE id = ?;
    ` , [id]);

    console.log(result, "t m");

    return result;
};