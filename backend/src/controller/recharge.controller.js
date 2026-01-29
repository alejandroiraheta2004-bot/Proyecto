import * as RechargeService from '../services/recharge.service.js';

export const recharge = async (req, res) => {
  try {
    const result = await RechargeService.rechargeBalance(req.user.id, req.body);
    return res.status(201).json({ message: 'Recarga realizada', data: result });
  } catch (error) {
    return res.status(400).json({ message: error.message || 'No se pudo realizar la recarga', error });
  }
};
