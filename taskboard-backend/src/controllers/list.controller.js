const List = require('../models/List');
const Card = require('../models/Card');
const Board = require('../models/Board');

/**
 * Creates a new list in a board.
 * @route POST /api/lists
 * @param {Request} req - Express request with { title, boardId } in body
 * @param {Response} res - Express response
 */
const createList = async (req, res, next) => {
  try {
    const { title, boardId } = req.body;

    // Verify the board belongs to the user
    const board = await Board.findOne({ _id: boardId, owner: req.user._id });
    if (!board) {
      return res.status(404).json({ message: 'Board not found.' });
    }

    // Get the next position
    const lastList = await List.findOne({ board: boardId }).sort({ position: -1 });
    const position = lastList ? lastList.position + 1 : 0;

    const list = await List.create({ title, board: boardId, position });
    res.status(201).json({ ...list.toObject(), cards: [] });
  } catch (error) {
    next(error);
  }
};

/**
 * Updates a list's title.
 * @route PUT /api/lists/:id
 * @param {Request} req - Express request with { title } in body
 * @param {Response} res - Express response
 */
const updateList = async (req, res, next) => {
  try {
    const { title } = req.body;
    const list = await List.findByIdAndUpdate(
      req.params.id,
      { title },
      { new: true, runValidators: true }
    );

    if (!list) {
      return res.status(404).json({ message: 'List not found.' });
    }

    res.json(list);
  } catch (error) {
    next(error);
  }
};

/**
 * Deletes a list and all its cards.
 * @route DELETE /api/lists/:id
 * @param {Request} req - Express request with list id in params
 * @param {Response} res - Express response
 */
const deleteList = async (req, res, next) => {
  try {
    const list = await List.findById(req.params.id);
    if (!list) {
      return res.status(404).json({ message: 'List not found.' });
    }

    await Card.deleteMany({ list: list._id });
    await List.findByIdAndDelete(list._id);

    res.json({ message: 'List and all its cards deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

/**
 * Reorders lists within a board.
 * @route PUT /api/lists/reorder
 * @param {Request} req - Express request with { lists: [{ id, position }] } in body
 * @param {Response} res - Express response
 */
const reorderLists = async (req, res, next) => {
  try {
    const { lists } = req.body;

    const updatePromises = lists.map(({ id, position }) =>
      List.findByIdAndUpdate(id, { position })
    );

    await Promise.all(updatePromises);
    res.json({ message: 'Lists reordered successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createList, updateList, deleteList, reorderLists };