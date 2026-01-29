import * as CardService from '../services/card.service.js';

export const getMyCards = async (req, res) => {
  try {
    const cards = await CardService.listMyCards(req.user.id);
    return res.json({ message: 'Tarjetas obtenidas', data: cards });
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener tarjetas', error });
  }
};

export const createMyCard = async (req, res) => {
  try {
    const { last4, brand, color } = req.body;
    const result = await CardService.addCard(req.user.id, { last4, brand, color });
    return res.status(201).json({
      message: 'Tarjeta registrada',
      data: { id: result?.[0]?.insertId, last4, brand, color: color || 'sky', estado: 1 }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error al crear tarjeta', error });
  }
};

export const updateMyCardStatus = async (req, res) => {
  try {
    const { estado } = req.body;
    const card = await CardService.getCard(req.params.id);
    if (!card || card.id_user !== req.user.id) {
      return res.status(404).json({ message: 'Tarjeta no encontrada' });
    }
    const normalized = Number(estado) === 1 ? 1 : 0;
    await CardService.setCardStatus(req.params.id, normalized);
    return res.json({ message: 'Estado actualizado', data: { id: card.id, estado: normalized } });
  } catch (error) {
    return res.status(500).json({ message: 'Error al actualizar tarjeta', error });
  }
};

export const deleteMyCard = async (req, res) => {
  try {
    const card = await CardService.getCard(req.params.id);
    if (!card || card.id_user !== req.user.id) {
      return res.status(404).json({ message: 'Tarjeta no encontrada' });
    }
    await CardService.removeCard(req.params.id);
    return res.json({ message: 'Tarjeta eliminada' });
  } catch (error) {
    return res.status(500).json({ message: 'Error al eliminar tarjeta', error });
  }
};
