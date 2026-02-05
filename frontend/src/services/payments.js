import { api } from './api';

export async function getPayments() {
  const res = await api.listPayments();
  return res?.data || res?.payments || [];
}

export async function getExecutions() {
  const res = await api.listPaymentExecutions();
  return res?.data || res?.executions || [];
}

export async function addPayment(payment) {
  const res = await api.createPayment(payment);
  return res?.data || res?.payment || null;
}

export async function updatePayment(id, updates) {
  const res = await api.updatePayment(id, updates);
  return res?.data || res?.payment || null;
}

export async function deletePayment(id) {
  const res = await api.cancelPayment(id);
  return res?.data || res?.payment || null;
}

export async function getPaymentById(id) {
  const res = await api.getPayment(id);
  return res?.data || res?.payment || null;
}

export async function getExecutionById(id) {
  const res = await api.getPaymentExecution(id);
  return res?.data || res?.execution || null;
}

export async function getExecutedTotal() {
  const list = await getExecutions();
  return list
    .filter((item) => item.status === 'executed')
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
}

export async function runDuePayments() {
  const res = await api.runDuePayments();
  return res?.data || res || null;
}
