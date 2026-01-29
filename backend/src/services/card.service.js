import * as Card from '../model/card.model.js';

export const listMyCards = async (userId) => Card.getCardsByUser(userId);

export const addCard = async (userId, { last4, brand, color }) => {
  try {
    const result = await Card.createCard({
      id_user: userId,
      last4,
      brand,
      color: color || 'sky',
      estado: 1
    });
    return result;
  } catch (error) {
    if (error?.code === 'ER_BAD_FIELD_ERROR') {
      const result = await Card.createCard({
        id_user: userId,
        last4,
        brand,
        estado: 1
      });
      return result;
    }
    throw error;
  }
};

export const setCardStatus = async (cardId, estado) => Card.updateCardStatus(cardId, estado);

export const getCard = async (cardId) => Card.getCardById(cardId);

export const removeCard = async (cardId) => Card.deleteCard(cardId);
