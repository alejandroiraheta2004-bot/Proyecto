const STORAGE_KEY = 'scheduledPayments';
const EXECUTIONS_KEY = 'paymentExecutions';

export function getPayments() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch (err) {
    return [];
  }
}

export function savePayments(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function getExecutions() {
  try {
    return JSON.parse(localStorage.getItem(EXECUTIONS_KEY) || '[]');
  } catch (err) {
    return [];
  }
}

export function saveExecutions(list) {
  localStorage.setItem(EXECUTIONS_KEY, JSON.stringify(list));
}

export function addExecution(execution) {
  const list = getExecutions();
  const next = [...list, execution];
  saveExecutions(next);
  return execution;
}

export function addPayment(payment) {
  const list = getPayments();
  const nextExecutionDate = payment.nextExecutionDate || payment.executionDate;
  const next = [...list, payment];
  const normalized = next.map((item) => (
    item.nextExecutionDate ? item : { ...item, nextExecutionDate: nextExecutionDate }
  ));
  savePayments(normalized);
  return payment;
}

export function updatePayment(id, updates) {
  const list = getPayments();
  const next = list.map((item) => {
    if (String(item.id) !== String(id)) return item;
    const merged = { ...item, ...updates };
    if (!merged.nextExecutionDate) {
      merged.nextExecutionDate = merged.executionDate;
    }
    return merged;
  });
  savePayments(next);
  return next.find((item) => String(item.id) === String(id)) || null;
}

export function deletePayment(id) {
  const list = getPayments();
  const next = list.filter((item) => String(item.id) !== String(id));
  savePayments(next);
  return next;
}

export function getPaymentById(id) {
  const list = getPayments();
  return list.find((item) => String(item.id) === String(id)) || null;
}

export function getExecutionById(id) {
  const list = getExecutions();
  return list.find((item) => String(item.id) === String(id)) || null;
}

export function getExecutedTotal() {
  const list = getExecutions();
  return list
    .filter((item) => item.status === 'executed')
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
}

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

export function runDuePayments() {
  const list = getPayments();
  const executions = getExecutions();
  const now = new Date();
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  let updated = false;
  let updatedExecutions = [...executions];

  const nextPayments = list.map((payment) => {
    if (payment.status === 'cancelled') return payment;
    const nextDateStr = payment.nextExecutionDate || payment.executionDate;
    if (!nextDateStr) return payment;

    let nextDate = new Date(`${nextDateStr}T00:00:00`);
    let count = 0;
    let changed = false;

    while (nextDate <= todayEnd && count < 12) {
      const executionId = `exec-${payment.id}-${nextDate.toISOString().slice(0, 10)}`;
      const alreadyExecuted = updatedExecutions.some((item) => item.id === executionId);
      if (!alreadyExecuted) {
        updatedExecutions.push({
          id: executionId,
          paymentId: payment.id,
          serviceName: payment.serviceName,
          amount: payment.amount,
          executionDate: nextDate.toISOString().slice(0, 10),
          executedAt: new Date().toISOString(),
          frequency: payment.frequency,
          status: 'executed'
        });
      }

      if (payment.frequency === 'once') {
        changed = true;
        return {
          ...payment,
          status: 'completed',
          lastExecutedAt: new Date().toISOString(),
          nextExecutionDate: null
        };
      }

      nextDate = payment.frequency === 'weekly'
        ? addDays(nextDate, 7)
        : addMonths(nextDate, 1);
      changed = true;
      count += 1;
    }

    if (changed) {
      return {
        ...payment,
        lastExecutedAt: new Date().toISOString(),
        nextExecutionDate: nextDate.toISOString().slice(0, 10)
      };
    }

    return payment;
  });

  if (JSON.stringify(list) !== JSON.stringify(nextPayments)) {
    savePayments(nextPayments);
    updated = true;
  }

  if (JSON.stringify(executions) !== JSON.stringify(updatedExecutions)) {
    saveExecutions(updatedExecutions);
    updated = true;
  }

  return { payments: nextPayments, executions: updatedExecutions, updated };
}
