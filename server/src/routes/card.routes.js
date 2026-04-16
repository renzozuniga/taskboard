const express = require('express');
const { createCard, updateCard, deleteCard, moveCard } = require('../controllers/card.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.post('/', createCard);
router.put('/:id', updateCard);
router.put('/:id/move', moveCard);
router.delete('/:id', deleteCard);

module.exports = router;