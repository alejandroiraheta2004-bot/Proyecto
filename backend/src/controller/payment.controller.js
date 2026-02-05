import * as PaymentService from '../services/payment.service.js';

export const listPayments = async (req, res) => {
  try {
    const rows = await PaymentService.listPayments(req.user.id);
    return res.json({ message: 'Pagos obtenidos', data: rows });
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener los pagos', error });
  }
};

export const getPayment = async (req, res) => {
  try {
    const payment = await PaymentService.getPaymentById(req.user.id, req.params.id);
    if (!payment) return res.status(404).json({ message: 'Pago no encontrado' });
    return res.json({ message: 'Pago obtenido', data: payment });
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener el pago', error });
  }
};

export const createPayment = async (req, res) => {
  try {
    const insertId = await PaymentService.createPayment(req.user.id, req.body);
    const payment = await PaymentService.getPaymentById(req.user.id, insertId);
    return res.status(201).json({ message: 'Pago programado', data: payment });
  } catch (error) {
    return res.status(500).json({ message: 'Error al crear el pago', error });
  }
};

export const updatePayment = async (req, res) => {
  try {
    const payment = await PaymentService.updatePayment(req.user.id, req.params.id, req.body);
    if (!payment) return res.status(404).json({ message: 'Pago no encontrado' });
    return res.json({ message: 'Pago actualizado', data: payment });
  } catch (error) {
    return res.status(500).json({ message: 'Error al actualizar el pago', error });
  }
};

export const cancelPayment = async (req, res) => {
  try {
    const payment = await PaymentService.cancelPayment(req.user.id, req.params.id);
    if (!payment) return res.status(404).json({ message: 'Pago no encontrado' });
    return res.json({ message: 'Pago cancelado', data: payment });
  } catch (error) {
    return res.status(500).json({ message: 'Error al cancelar el pago', error });
  }
};

export const listExecutions = async (req, res) => {
  try {
    const rows = await PaymentService.listExecutions(req.user.id);
    return res.json({ message: 'Ejecuciones obtenidas', data: rows });
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener ejecuciones', error });
  }
};

export const getExecution = async (req, res) => {
  try {
    const execution = await PaymentService.getExecutionById(req.user.id, req.params.id);
    if (!execution) return res.status(404).json({ message: 'Ejecución no encontrada' });
    return res.json({ message: 'Ejecución obtenida', data: execution });
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener ejecución', error });
  }
};

export const runDuePayments = async (req, res) => {
  try {
    const result = await PaymentService.runDuePayments(req.user.id);
    return res.json({ message: 'Pagos ejecutados', data: result });
  } catch (error) {
    return res.status(500).json({ message: error?.message || 'Error al ejecutar pagos', error });
  }
};
