import pool from '../config/database.js';

export const getCardsByUser = async (userId) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, last4, brand, IFNULL(color, 'sky') AS color, estado, created_at AS createdAt
       FROM debit_cards
       WHERE id_user = ?
       ORDER BY created_at DESC`,
      [userId]
    );
    return rows;
  } catch (error) {
    const [rows] = await pool.query(
      `SELECT id, last4, brand, estado, created_at AS createdAt
       FROM debit_cards
       WHERE id_user = ?
       ORDER BY created_at DESC`,
      [userId]
    );
    return rows.map((row) => ({ ...row, color: 'sky' }));
  }
};

export const createCard = async (card) => {
  const { id_user, last4, brand, color, estado } = card;
  try {
    const result = await pool.query(
      `INSERT INTO debit_cards (id_user, last4, brand, color, estado)
       VALUES (?, ?, ?, ?, ?);`,
      [id_user, last4, brand, color || 'sky', estado]
    );
    return result;
  } catch (error) {
    if (error?.code === 'ER_BAD_FIELD_ERROR') {
      const result = await pool.query(
        `INSERT INTO debit_cards (id_user, last4, brand, estado)
         VALUES (?, ?, ?, ?);`,
        [id_user, last4, brand, estado]
      );
      return result;
    }
    throw error;
  }
};

export const getCardById = async (id) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, id_user, last4, brand, IFNULL(color, 'sky') AS color, estado FROM debit_cards WHERE id = ? LIMIT 1",
      [id]
    );
    return rows[0];
  } catch (error) {
    const [rows] = await pool.query(
      'SELECT id, id_user, last4, brand, estado FROM debit_cards WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] ? { ...rows[0], color: 'sky' } : undefined;
  }
};

export const updateCardStatus = async (id, estado) => {
  const [result] = await pool.query(
    'UPDATE debit_cards SET estado = ? WHERE id = ?',
    [estado, id]
  );
  return result;
};

export const deleteCard = async (id) => {
  const [result] = await pool.query('DELETE FROM debit_cards WHERE id = ?', [id]);
  return result;
};
