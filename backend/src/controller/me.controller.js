import pool from '../config/database.js';
import * as Transaction from '../model/transaction.model.js';
import * as Card from '../model/card.model.js';

export const me = async (req, res) => {
  try {
    // Devuelve perfil del usuario autenticado
    const [rows] = await pool.query(
      `SELECT u.*, r.descripcion AS rol
       FROM users u
       LEFT JOIN rols r ON r.id = u.id_rol
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (!rows[0]) return res.status(404).json({ message: 'Usuario no encontrado' });

    return res.json({
      message: 'Perfil obtenido',
      data: rows[0]
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener el perfil', error });
  }
};

export const myTransactions = async (req, res) => {
  try {
    // Transacciones asociadas al usuario autenticado
    let rows = [];
    try {
      const [result] = await pool.query(
        `SELECT 
           t.id,
           ut.direction AS type,
           t.tipo AS transactionType,
           t.monto AS amount,
           t.referencia AS reference,
           t.estado AS status,
           t.description AS description,
           t.bank_name AS bankName,
           t.card_type AS cardType,
           t.card_last4 AS cardLast4,
           t.origen AS origin,
           t.destino AS destination,
           t.created_at AS createdAt
         FROM user_transactions ut
         JOIN transactions t ON t.id = ut.id_transaction
         WHERE ut.id_user = ?
         ORDER BY t.created_at DESC`,
        [req.user.id]
      );
      rows = result;
    } catch (innerError) {
      const [fallback] = await pool.query(
        `SELECT 
           t.id,
           ut.direction AS type,
           t.tipo AS transactionType,
           t.monto AS amount,
           t.referencia AS reference,
           t.estado AS status,
           t.description AS description,
           t.origen AS origin,
           t.destino AS destination,
           t.created_at AS createdAt
         FROM user_transactions ut
         JOIN transactions t ON t.id = ut.id_transaction
         WHERE ut.id_user = ?
         ORDER BY t.created_at DESC`,
        [req.user.id]
      );
      rows = fallback;
    }

    return res.json({
      message: 'Transacciones obtenidas',
      data: rows
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener las transacciones', error });
  }
};

export const createMyTransaction = async (req, res) => {
  try {
    const { tipo, monto, referencia, estado, descripcion } = req.body;

    // Valida tipo permitido y monto positivo
    if (!['credit', 'debit'].includes(tipo)) {
      return res.status(400).json({ message: 'Tipo de transacción inválido' });
    }
    const amountNum = Number(monto);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      return res.status(400).json({ message: 'Monto inválido' });
    }

    // Obtiene saldo actual del usuario
    const [users] = await pool.query('SELECT saldo_actual FROM users WHERE id = ?', [req.user.id]);
    const currentBalance = Number(users?.[0]?.saldo_actual || 0);

    if (tipo === 'debit' && currentBalance < amountNum) {
      return res.status(400).json({ message: 'Fondos insuficientes para realizar el envío' });
    }

    // Crea transacción y la vincula al usuario
    const txEstado = estado || 'completado';
    const result = await Transaction.createTransaction({ tipo, monto: amountNum, referencia, estado: txEstado, descripcion });
    const insertId = result?.[0]?.insertId;

    if (!insertId) return res.status(500).json({ message: 'No se pudo crear la transacción' });

    await pool.query(
      'INSERT INTO user_transactions (id_user, id_transaction, direction) VALUES (?, ?, ?)',
      [req.user.id, insertId, tipo]
    );

    // Actualiza saldo del usuario
    const newBalance = tipo === 'credit' ? currentBalance + amountNum : currentBalance - amountNum;
    await pool.query('UPDATE users SET saldo_actual = ? WHERE id = ?', [newBalance, req.user.id]);

    return res.status(201).json({
      message: 'Transacción creada',
      data: { id: insertId, saldo_actual: newBalance }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error al crear la transacción', error });
  }
};

export const updatePrimaryCard = async (req, res) => {
  try {
    const { cardId } = req.body;
    const card = await Card.getCardById(cardId);
    if (!card || card.id_user !== req.user.id) {
      return res.status(404).json({ message: 'Tarjeta no encontrada' });
    }
    if (card.estado === 0) {
      return res.status(400).json({ message: 'La tarjeta está inactiva' });
    }
    await pool.query('UPDATE users SET primary_card_id = ? WHERE id = ?', [cardId, req.user.id]);
    return res.json({ message: 'Tarjeta principal actualizada', data: { primary_card_id: cardId } });
  } catch (error) {
    return res.status(500).json({ message: 'Error al actualizar la tarjeta principal', error });
  }
};
