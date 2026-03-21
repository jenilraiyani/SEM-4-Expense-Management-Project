const express = require('express');
const router = express.Router();
const controller = require('../controllers/category.controller');


router.get('/', controller.getAll);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.get('/:id', controller.getCategoryById);
router.delete('/:id', controller.delete);

module.exports = router;