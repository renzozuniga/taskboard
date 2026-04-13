const Card = require('../models/Card');
const List = require('../models/List');

/**
 * Creates a new card in a list.
 * @route POST /api/cards
 * @param {Request} req - Express request with { title, description, listId } in body
 * @param {Response} res - Express response
 */
const createCard = async (req, res, next) => {
  try {
    const { title, description, listId } = req.body;

    const list = await List.findById(listId);
    if (!list) {
      return res.status(404).json({ message: 'List not found.' });
    }

    // Get the next position
    const lastCard = await Card.findOne({ list: listId }).sort({ position: -1 });
    const position = lastCard ? lastCard.position + 1 : 0;

    const card = await Card.create({ title, description, list: listId, position });
    res.status(201).json(card);
  } catch (error) {
    next(error);
  }
};

/**
 * Updates a card's title, description, or position.
 * @route PUT /api/cards/:id
 * @param {Request} req - Express request with { title, description } in body
 * @param {Response} res - Express response
 */
const updateCard = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const card = await Card.findByIdAndUpdate(
      req.params.id,
      { title, description },
      { new: true, runValidators: true }
    );

    if (!card) {
      return res.status(404).json({ message: 'Card not found.' });
    }

    res.json(card);
  } catch (error) {
    next(error);
  }
};

/**
 * Deletes a card.
 * @route DELETE /api/cards/:id
 * @param {Request} req - Express request with card id in params
 * @param {Response} res - Express response
 */
const deleteCard = async (req, res, next) => {
  try {
    const card = await Card.findByIdAndDelete(req.params.id);
    if (!card) {
      return res.status(404).json({ message: 'Card not found.' });
    }
    res.json({ message: 'Card deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

/**
 * Moves a card to a different list and/or reorders cards.
 * Used for drag & drop functionality.
 * @route PUT /api/cards/:id/move
 * @param {Request} req - Express request with { listId, position } in body
 * @param {Response} res - Express response
 */
const moveCard = async (req, res, next) => {
  try {
    const { listId, position } = req.body;

    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ message: 'Card not found.' });
    }

    const targetList = await List.findById(listId);
    if (!targetList) {
      return res.status(404).json({ message: 'Target list not found.' });
    }

    // Update positions of other cards in the target list
    await Card.updateMany(
      { list: listId, position: { $gte: position } },
      { $inc: { position: 1 } }
    );

    // Move the card
    card.list = listId;
    card.position = position;
    await card.save();

    res.json(card);
  } catch (error) {
    next(error);
  }
};

module.exports = { createCard, updateCard, deleteCard, moveCard };