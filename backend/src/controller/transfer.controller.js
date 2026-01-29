import * as TransferService from '../services/transfer.service.js';

export const sendInternal = async (req, res) => {
  try {
    const { identifier, amount, description } = req.body;
    const result = await TransferService.sendInternalTransfer(req.user.id, { identifier, amount, description });
    return res.status(201).json({ message: 'Envío realizado', data: result });
  } catch (error) {
    return res.status(400).json({ message: error.message || 'No se pudo realizar el envío', error });
  }
};

export const sendExternal = async (req, res) => {
  try {
    const { bankName, accountNumber, holderName, amount, description } = req.body;
    const result = await TransferService.sendExternalTransfer(req.user.id, { bankName, accountNumber, holderName, amount, description });
    return res.status(201).json({ message: 'Envío externo realizado', data: result });
  } catch (error) {
    return res.status(400).json({ message: error.message || 'No se pudo realizar el envío', error });
  }
};
