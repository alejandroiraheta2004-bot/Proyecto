import pool from "../config/database.js";

export const getNotifications = async () => {
    // Devuelve todas las notificaciones
    const [rows] = await pool.query(`
        SELECT * FROM notifications;    
    `);

    return rows;
}

export const getNotification = async (id) => {
    console.log(id, " MM");
    
    // Busca notificación por id
    const [rows] = await pool.query(`
        SELECT * FROM notifications
        WHERE id = ${id};    
    `);
    console.log(rows, " MM2");
    return rows[0];
}

export const createNotification = async (notificationInfo) => {
    const {id_user, max_envio, max_retiro} = notificationInfo;
    // Inserta notificación
    const result = await pool.query(`
        INSERT INTO notifications (id_user, max_envio, max_retiro)
        VALUES ("${id_user}", "${max_envio}", "${max_retiro}");    
    `);

    return result;
};

export const updateNotification = async (id, notificationInfo) => {
    const {field, value} = notificationInfo;
    // Actualiza campo dinámico
    const result = await pool.query(`
        UPDATE notifications
        SET ${field} = "${value}"
        WHERE id = "${id}";
    `);
    return result;
}

export const deleteNofication = async ( id ) => {
    // Borra notificación por id
    const result = await pool.query(`
        DELETE FROM notifications
        WHERE id = ${id};
    `);

    return result;
};