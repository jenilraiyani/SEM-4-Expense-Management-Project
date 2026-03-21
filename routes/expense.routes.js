const express = require('express');
const router = express.Router();
const controller = require('../controllers/expense.controller');
// Check this line carefully for typos:

router.get('/',  controller.getAll); 
router.post('/',  controller.create);
router.put('/:id',  controller.update);
router.get('/:id', controller.getExpenseById);
router.delete('/:id', controller.delete);
router.get('/user/:userId', controller.getExpensesByUserId);

module.exports = router;    