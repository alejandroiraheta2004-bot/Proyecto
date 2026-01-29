import pool from '../config/database.js';
import { findUserByUsernameOrAccount } from './user.service.js';

export const sendInternalTransfer = async (userId, { identifier, amount, description }) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [senderRows] = await connection.query(
      'SELECT id, saldo_actual, estado, account_number, username FROM users WHERE id = ? FOR UPDATE',
      [userId]
    );
    const sender = senderRows[0];
    if (!sender) throw new Error('Usuario no encontrado');
    if (sender.estado === 0) throw new Error('Cuenta bloqueada');

    const recipient = await findUserByUsernameOrAccount(identifier);
    if (!recipient) throw new Error('Usuario destino no existe');
    if (recipient.estado === 0) throw new Error('Cuenta destino inactiva');
    if (recipient.id === sender.id) throw new Error('No puedes enviarte a ti mismo');

    const amountNum = Number(amount);
    if (sender.saldo_actual < amountNum) throw new Error('Saldo insuficiente');

    const referencia = `ENV-${Date.now()}`;
    const [txResult] = await connection.query(
      `INSERT INTO transactions (tipo, monto, referencia, estado, description, origen, destino)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
      , [
        'send_internal',
        amountNum,
        referencia,
        'completado',
        description || `Envío a ${recipient.username}`,
        sender.account_number,
        recipient.account_number
      ]
    );
    const txId = txResult?.insertId;

    await connection.query(
      'INSERT INTO user_transactions (id_user, id_transaction, direction) VALUES (?, ?, ?), (?, ?, ?)',
      [sender.id, txId, 'debit', recipient.id, txId, 'credit']
    );

    const newSenderBalance = Number(sender.saldo_actual) - amountNum;
    const newRecipientBalance = Number(recipient.saldo_actual) + amountNum;

    await connection.query('UPDATE users SET saldo_actual = ? WHERE id = ?', [newSenderBalance, sender.id]);
    await connection.query('UPDATE users SET saldo_actual = ? WHERE id = ?', [newRecipientBalance, recipient.id]);

    await connection.commit();
    return { txId, balance: newSenderBalance };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const sendExternalTransfer = async (userId, { bankName, accountNumber, holderName, amount, description }) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [senderRows] = await connection.query(
      'SELECT id, saldo_actual, estado, account_number, username FROM users WHERE id = ? FOR UPDATE',
      [userId]
    );
    const sender = senderRows[0];
    if (!sender) throw new Error('Usuario no encontrado');
    if (sender.estado === 0) throw new Error('Cuenta bloqueada');

    const amountNum = Number(amount);
    if (sender.saldo_actual < amountNum) throw new Error('Saldo insuficiente');

    const referencia = `EXT-${Date.now()}`;
    const destino = `${bankName} | ${accountNumber} | ${holderName}`;
    const [txResult] = await connection.query(
      `INSERT INTO transactions (tipo, monto, referencia, estado, description, origen, destino)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
      , [
        'send_external',
        amountNum,
        referencia,
        'completado',
        description || `Envío a ${holderName}`,
        sender.account_number,
        destino
      ]
    );
    const txId = txResult?.insertId;

    await connection.query(
      'INSERT INTO user_transactions (id_user, id_transaction, direction) VALUES (?, ?, ?)',
      [sender.id, txId, 'debit']
    );

    const newSenderBalance = Number(sender.saldo_actual) - amountNum;
    await connection.query('UPDATE users SET saldo_actual = ? WHERE id = ?', [newSenderBalance, sender.id]);

    await connection.commit();
    return { txId, balance: newSenderBalance };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
