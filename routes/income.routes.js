const express = require('express');
const router = express.Router();
const controller = require('../controllers/income.controller');

router.get('/',  controller.getAll); 
router.post('/',  controller.create);
router.put('/:id',  controller.update);
router.get('/:id', controller.getIncomeById);
router.delete('/:id', controller.delete);
// 👇 2. Add the new route
router.get('/user/:userId', controller.getIncomesByUserId);
module.exports = router;