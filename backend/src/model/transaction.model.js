import pool from '../config/database.js';

export const getTransactions = async () => {
    // Devuelve todas las transacciones
    const [rows] = await pool.query(`
        SELECT * FROM transactions;    
    `);
    return rows;
};

export const getTransaction = async ( id ) => {

    // Busca transacción por id
    const [rows] = await pool.query(`
        SELECT * FROM transactions
        WHERE id = ?;    
    `, [id]);

    return rows[0];
};

export const createTransaction = async ( transaccionInfo ) => {

    const {tipo, monto, referencia, estado, descripcion, description, origen, destino, bank_name, card_type, card_last4} = transaccionInfo;

    // Inserta un movimiento nuevo
    const result = await pool.query(`
        INSERT INTO  transactions (tipo, monto, referencia, estado, description, bank_name, card_type, card_last4, origen, destino)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);    
    `, [
        tipo,
        monto,
        referencia,
        estado,
        descripcion || description || null,
        bank_name || null,
        card_type || null,
        card_last4 || null,
        origen || null,
        destino || null
    ]);

    return result;
};

export const updateTransaction = async (id, transaccionInfo ) => {
    // console.log(id, transaccionInfo, "mo");
    const {field, value} = transaccionInfo;
    
    // Actualiza campo específico
    const result = await pool.query(`
        UPDATE transactions
        SET ${field} = "${value}"
        WHERE id = ${id};    
    `);
};

export const deleteTransaction = async ( id ) => {
    // Borra transacción por id
    const result = await pool.query(`
        DELETE FROM transactions
        WHERE id = "${id}";    
    `);
};