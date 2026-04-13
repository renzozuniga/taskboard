const express = require('express');
const { createList, updateList, deleteList, reorderLists } = require('../controllers/list.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.post('/', createList);
router.put('/reorder', reorderLists);
router.put('/:id', updateList);
router.delete('/:id', deleteList);

module.exports = router;