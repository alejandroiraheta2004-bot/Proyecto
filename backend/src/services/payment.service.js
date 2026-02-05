import pool from '../config/database.js';

const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const addMonths = (date, months) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
};

const normalizeFrequency = (value) => String(value || '').toLowerCase();

export const listPayments = async (userId) => {
  const [rows] = await pool.query(
    `SELECT 
      id,
      id_user AS userId,
      service_name AS serviceName,
      account_number AS accountNumber,
      amount,
      execution_date AS executionDate,
      next_execution_date AS nextExecutionDate,
      frequency,
      status,
      last_executed_at AS lastExecutedAt,
      cancelled_at AS cancelledAt,
      created_at AS createdAt,
      updated_at AS updatedAt
     FROM scheduled_payments
     WHERE id_user = ?
     ORDER BY created_at DESC`,
    [userId]
  );
  return rows;
};

export const getPaymentById = async (userId, paymentId) => {
  const [rows] = await pool.query(
    `SELECT 
      id,
      id_user AS userId,
      service_name AS serviceName,
      account_number AS accountNumber,
      amount,
      execution_date AS executionDate,
      next_execution_date AS nextExecutionDate,
      frequency,
      status,
      last_executed_at AS lastExecutedAt,
      cancelled_at AS cancelledAt,
      created_at AS createdAt,
      updated_at AS updatedAt
     FROM scheduled_payments
     WHERE id_user = ? AND id = ?`,
    [userId, paymentId]
  );
  return rows[0] || null;
};

export const createPayment = async (userId, payload) => {
  const { serviceName, accountNumber, amount, executionDate, frequency } = payload;
  const normalizedFrequency = normalizeFrequency(frequency) || 'once';
  const [result] = await pool.query(
    `INSERT INTO scheduled_payments (id_user, service_name, account_number, amount, execution_date, next_execution_date, frequency, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'scheduled')`,
    [userId, serviceName, accountNumber, amount, executionDate, executionDate, normalizedFrequency]
  );
  return result?.insertId;
};

export const updatePayment = async (userId, paymentId, updates) => {
  const fields = [];
  const values = [];

  if (updates.serviceName) {
    fields.push('service_name = ?');
    values.push(updates.serviceName);
  }
  if (updates.accountNumber) {
    fields.push('account_number = ?');
    values.push(updates.accountNumber);
  }
  if (updates.amount !== undefined) {
    fields.push('amount = ?');
    values.push(updates.amount);
  }
  if (updates.executionDate) {
    fields.push('execution_date = ?');
    values.push(updates.executionDate);
    if (!updates.nextExecutionDate) {
      fields.push('next_execution_date = ?');
      values.push(updates.executionDate);
    }
  }
  if (updates.nextExecutionDate) {
    fields.push('next_execution_date = ?');
    values.push(updates.nextExecutionDate);
  }
  if (updates.frequency) {
    fields.push('frequency = ?');
    values.push(normalizeFrequency(updates.frequency));
  }
  if (updates.status) {
    const normalizedStatus = String(updates.status).toLowerCase();
    fields.push('status = ?');
    values.push(normalizedStatus);
    if (normalizedStatus === 'cancelled') {
      fields.push('cancelled_at = ?');
      values.push(new Date());
    }
  }

  if (!fields.length) return getPaymentById(userId, paymentId);

  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(userId, paymentId);

  await pool.query(
    `UPDATE scheduled_payments SET ${fields.join(', ')} WHERE id_user = ? AND id = ?`,
    values
  );

  return getPaymentById(userId, paymentId);
};

export const cancelPayment = async (userId, paymentId) => {
  await pool.query(
    `UPDATE scheduled_payments
     SET status = 'cancelled', cancelled_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
     WHERE id_user = ? AND id = ?`,
    [userId, paymentId]
  );
  return getPaymentById(userId, paymentId);
};

export const listExecutions = async (userId) => {
  const [rows] = await pool.query(
    `SELECT 
      id,
      payment_id AS paymentId,
      id_user AS userId,
      service_name AS serviceName,
      account_number AS accountNumber,
      amount,
      execution_date AS executionDate,
      executed_at AS executedAt,
      frequency,
      status,
      created_at AS createdAt,
      updated_at AS updatedAt
     FROM payment_executions
     WHERE id_user = ?
     ORDER BY executed_at DESC`,
    [userId]
  );
  return rows;
};

export const getExecutionById = async (userId, executionId) => {
  const [rows] = await pool.query(
    `SELECT 
      id,
      payment_id AS paymentId,
      id_user AS userId,
      service_name AS serviceName,
      account_number AS accountNumber,
      amount,
      execution_date AS executionDate,
      executed_at AS executedAt,
      frequency,
      status,
      created_at AS createdAt,
      updated_at AS updatedAt
     FROM payment_executions
     WHERE id_user = ? AND id = ?`,
    [userId, executionId]
  );
  return rows[0] || null;
};

export const runDuePayments = async (userId) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [userRows] = await connection.query(
      'SELECT id, saldo_actual, estado FROM users WHERE id = ? FOR UPDATE',
      [userId]
    );
    const user = userRows[0];
    if (!user) throw new Error('Usuario no encontrado');
    if (user.estado === 0) throw new Error('Cuenta bloqueada');

    const [payments] = await connection.query(
      'SELECT * FROM scheduled_payments WHERE id_user = ?',
      [userId]
    );

    const [executions] = await connection.query(
      'SELECT payment_id, execution_date FROM payment_executions WHERE id_user = ?',
      [userId]
    );

    const executionMap = new Set(
      executions.map((item) => `${item.payment_id}-${new Date(item.execution_date).toISOString().slice(0, 10)}`)
    );

    const now = new Date();
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    let balance = Number(user.saldo_actual || 0);

    for (const payment of payments) {
      if (payment.status === 'cancelled' || payment.status === 'completed') continue;
      const nextDateStr = payment.next_execution_date || payment.execution_date;
      if (!nextDateStr) continue;

      let nextDate = new Date(`${nextDateStr}T00:00:00`);
      let count = 0;
      let changed = false;

      while (nextDate <= todayEnd && count < 12) {
        const executionKey = `${payment.id}-${nextDate.toISOString().slice(0, 10)}`;
        if (!executionMap.has(executionKey)) {
          await connection.query(
            `INSERT INTO payment_executions 
             (payment_id, id_user, service_name, account_number, amount, execution_date, executed_at, frequency, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
            , [
              payment.id,
              userId,
              payment.service_name,
              payment.account_number,
              payment.amount,
              nextDate.toISOString().slice(0, 10),
              new Date(),
              payment.frequency,
              'executed'
            ]
          );
          executionMap.add(executionKey);
          balance -= Number(payment.amount || 0);
        }

        if (payment.frequency === 'once') {
          changed = true;
          await connection.query(
            `UPDATE scheduled_payments
             SET status = 'completed', last_executed_at = CURRENT_TIMESTAMP, next_execution_date = NULL, updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [payment.id]
          );
          break;
        }

        nextDate = payment.frequency === 'weekly'
          ? addDays(nextDate, 7)
          : addMonths(nextDate, 1);
        changed = true;
        count += 1;
      }

      if (changed && payment.frequency !== 'once') {
        await connection.query(
          `UPDATE scheduled_payments
           SET last_executed_at = CURRENT_TIMESTAMP, next_execution_date = ?, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [nextDate.toISOString().slice(0, 10), payment.id]
        );
      }
    }

    await connection.query('UPDATE users SET saldo_actual = ? WHERE id = ?', [balance, userId]);

    await connection.commit();

    const [updatedPayments] = await connection.query(
      `SELECT 
        id,
        id_user AS userId,
        service_name AS serviceName,
        account_number AS accountNumber,
        amount,
        execution_date AS executionDate,
        next_execution_date AS nextExecutionDate,
        frequency,
        status,
        last_executed_at AS lastExecutedAt,
        cancelled_at AS cancelledAt,
        created_at AS createdAt,
        updated_at AS updatedAt
       FROM scheduled_payments
       WHERE id_user = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    const [updatedExecutions] = await connection.query(
      `SELECT 
        id,
        payment_id AS paymentId,
        id_user AS userId,
        service_name AS serviceName,
        account_number AS accountNumber,
        amount,
        execution_date AS executionDate,
        executed_at AS executedAt,
        frequency,
        status,
        created_at AS createdAt,
        updated_at AS updatedAt
       FROM payment_executions
       WHERE id_user = ?
       ORDER BY executed_at DESC`,
      [userId]
    );

    return { payments: updatedPayments, executions: updatedExecutions, balance };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
