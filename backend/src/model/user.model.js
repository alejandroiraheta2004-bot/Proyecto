import pool from '../config/database.js';

export const getUsers = async () => {
    // Obtiene todos los registros de usuarios
    const [rows] = await pool.query(`
        SELECT * FROM users;    
    `);

    return rows;
};

export const getUser = async (id) => {
    // Busca un usuario por id
    const [rows] = await pool.query(`
        SELECT * FROM users
        WHERE id = ?;    
    `, [id]);

    return rows[0];
};

export const createUser = async (user) => {
    const { id_rol, nombre, username, account_number, email, telefono, password, saldo_actual, estado } = user;
    // Inserta un nuevo usuario
    const result = await pool.query(`
        INSERT INTO users(id_rol, nombre, username, account_number, email, telefono, password, saldo_actual, estado)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);    
    `, [id_rol, nombre, username, account_number, email, telefono, password, saldo_actual, estado]);
    return result;
}

export const updateUser = async (id, userInfo) => {
    const {field, value} = userInfo;
    // Actualiza el campo indicado dinámicamente
    const result = await pool.query(`UPDATE users SET ${field} = "${value}" WHERE id = ${id}`);
    return result;
}

export const updateUserStatus = async (id, estado) => {
    // Cambia el estado activo/bloqueado
    const [result] = await pool.query('UPDATE users SET estado = ? WHERE id = ?', [estado, id]);
    return result;
}

export const deleteUser = async  (id) => {
    // Elimina usuario por id
    const result = await pool.query(`DELETE FROM users WHERE id = ${id};`)
    return result;
};