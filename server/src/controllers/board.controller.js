const Board = require('../models/Board');
const List = require('../models/List');
const Card = require('../models/Card');

/**
 * Creates a new board for the authenticated user.
 * @route POST /api/boards
 * @param {Request} req - Express request with { title, description } in body
 * @param {Response} res - Express response
 */
const createBoard = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const board = await Board.create({
      title,
      description,
      owner: req.user._id
    });
    res.status(201).json(board);
  } catch (error) {
    next(error);
  }
};

/**
 * Returns all boards owned by the authenticated user.
 * @route GET /api/boards
 * @param {Request} req - Express request (requires authentication)
 * @param {Response} res - Express response
 */
const getBoards = async (req, res, next) => {
  try {
    const boards = await Board.find({ owner: req.user._id })
      .sort({ updatedAt: -1 });
    res.json(boards);
  } catch (error) {
    next(error);
  }
};

/**
 * Returns a single board with its lists and cards.
 * @route GET /api/boards/:id
 * @param {Request} req - Express request with board id in params
 * @param {Response} res - Express response
 */
const getBoardById = async (req, res, next) => {
  try {
    const board = await Board.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!board) {
      return res.status(404).json({ message: 'Board not found.' });
    }

    const lists = await List.find({ board: board._id }).sort({ position: 1 });

    const listsWithCards = await Promise.all(
      lists.map(async (list) => {
        const cards = await Card.find({ list: list._id }).sort({ position: 1 });
        return { ...list.toObject(), cards };
      })
    );

    res.json({ ...board.toObject(), lists: listsWithCards });
  } catch (error) {
    next(error);
  }
};

/**
 * Updates a board's title or description.
 * @route PUT /api/boards/:id
 * @param {Request} req - Express request with { title, description } in body
 * @param {Response} res - Express response
 */
const updateBoard = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const board = await Board.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { title, description },
      { new: true, runValidators: true }
    );

    if (!board) {
      return res.status(404).json({ message: 'Board not found.' });
    }

    res.json(board);
  } catch (error) {
    next(error);
  }
};

/**
 * Deletes a board and all its associated lists and cards.
 * @route DELETE /api/boards/:id
 * @param {Request} req - Express request with board id in params
 * @param {Response} res - Express response
 */
const deleteBoard = async (req, res, next) => {
  try {
    const board = await Board.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!board) {
      return res.status(404).json({ message: 'Board not found.' });
    }

    // Delete all cards in all lists of this board
    const lists = await List.find({ board: board._id });
    const listIds = lists.map(list => list._id);
    await Card.deleteMany({ list: { $in: listIds } });

    // Delete all lists
    await List.deleteMany({ board: board._id });

    // Delete the board
    await Board.findByIdAndDelete(board._id);

    res.json({ message: 'Board and all its contents deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createBoard, getBoards, getBoardById, updateBoard, deleteBoard };