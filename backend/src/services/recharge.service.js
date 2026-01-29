import pool from '../config/database.js';
const insertRechargeTransaction = async (connection, data, useExtended) => {
  if (useExtended) {
    const [result] = await connection.query(
      `INSERT INTO transactions (tipo, monto, referencia, estado, description, bank_name, card_type, card_last4, origen, destino)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      , [
        data.tipo,
        data.monto,
        data.referencia,
        data.estado,
        data.description,
        data.bank_name,
        data.card_type,
        data.card_last4,
        data.origen,
        data.destino
      ]
    );
    return result;
  }

  const [result] = await connection.query(
    `INSERT INTO transactions (tipo, monto, referencia, estado, description, origen, destino)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
    , [
      data.tipo,
      data.monto,
      data.referencia,
      data.estado,
      data.description,
      data.origen,
      data.destino
    ]
  );
  return result;
};

export const rechargeBalance = async (userId, payload) => {
  const { bankName, cardType, holderName, cardNumber, expiry, cvv, amount, description } = payload;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [userRows] = await connection.query(
      'SELECT id, saldo_actual, estado, account_number FROM users WHERE id = ? FOR UPDATE',
      [userId]
    );
    const user = userRows[0];
    if (!user) throw new Error('Usuario no encontrado');
    if (user.estado === 0) throw new Error('Cuenta bloqueada');

    const amountNum = Number(amount);

    const expiryParts = String(expiry).split('/');
    const expMonth = Number(expiryParts[0]);
    const rawYear = String(expiryParts[1] || '');
    const expYear = rawYear.length === 4 ? Number(rawYear) : Number(`20${rawYear}`);
    const now = new Date();
    const expDate = new Date(expYear, expMonth, 0, 23, 59, 59);
    if (!expMonth || !expYear || expDate < now) throw new Error('Tarjeta vencida');

    if (!/^[0-9]{13,19}$/.test(String(cardNumber))) throw new Error('Número de tarjeta inválido');
    if (!/^[0-9]{3}$/.test(String(cvv))) throw new Error('CVV inválido');

    const referencia = `REC-${Date.now()}`;
    const last4 = String(cardNumber).slice(-4);
    const origen = `Tarjeta externa`;
    const normalizedType = String(cardType || '').toLowerCase().replace('é', 'e');
    const txData = {
      tipo: 'recharge_external',
      monto: amountNum,
      referencia,
      estado: 'completado',
      description: description || `Recarga externa - ${bankName}`,
      bank_name: bankName,
      card_type: normalizedType,
      card_last4: last4,
      origen,
      destino: bankName
    };

    let txResult;
    try {
      txResult = await insertRechargeTransaction(connection, txData, true);
    } catch (insertError) {
      if (insertError?.code === 'ER_BAD_FIELD_ERROR') {
        txResult = await insertRechargeTransaction(connection, txData, false);
      } else {
        throw insertError;
      }
    }

    const txId = txResult?.insertId;

    await connection.query(
      'INSERT INTO user_transactions (id_user, id_transaction, direction) VALUES (?, ?, ?)',
      [userId, txId, 'credit']
    );

    const newBalance = Number(user.saldo_actual) + amountNum;
    await connection.query('UPDATE users SET saldo_actual = ? WHERE id = ?', [newBalance, userId]);

    await connection.commit();
    return { txId, balance: newBalance };
  } catch (error) {
    await connection.rollback();
    try {
      const amountNum = Number(amount || 0);
      const last4 = String(cardNumber || '').slice(-4);
      const failedData = {
        tipo: 'recharge_external',
        monto: amountNum,
        referencia: `REC-${Date.now()}`,
        estado: 'fallida',
        description: description || `Recarga externa fallida - ${bankName || 'Banco'}`,
        bank_name: bankName || null,
        card_type: normalizedType || null,
        card_last4: last4 || null,
        origen: 'Tarjeta externa',
        destino: bankName || null
      };

      let failedTxResult;
      try {
        failedTxResult = await insertRechargeTransaction(connection, failedData, true);
      } catch (insertError) {
        if (insertError?.code === 'ER_BAD_FIELD_ERROR') {
          failedTxResult = await insertRechargeTransaction(connection, failedData, false);
        } else {
          throw insertError;
        }
      }
      const failedTxId = failedTxResult?.insertId;
      if (failedTxId) {
        await connection.query(
          'INSERT INTO user_transactions (id_user, id_transaction, direction) VALUES (?, ?, ?)',
          [userId, failedTxId, 'credit']
        );
      }
    } catch (innerError) {
      // Ignorar error de registro de transacción fallida
    }
    throw error;
  } finally {
    connection.release();
  }
};
