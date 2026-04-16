const express = require('express');
const {
  createBoard, getBoards, getBoardById, updateBoard, deleteBoard
} = require('../controllers/board.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// All board routes require authentication
router.use(authenticate);

router.post('/', createBoard);
router.get('/', getBoards);
router.get('/:id', getBoardById);
router.put('/:id', updateBoard);
router.delete('/:id', deleteBoard);

module.exports = router;