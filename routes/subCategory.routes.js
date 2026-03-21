const express = require('express');
const router = express.Router();
const controller = require('../controllers/subCategory.controller');

router.get('/', controller.getAll);
router.post('/',controller.create);
router.put('/:id', controller.update);
router.get('/:id', controller.getSubCategoryById);
router.delete('/:id', controller.delete);
// 👇 ADD THIS NEW ROUTE HERE (Must be before /:id) 👇
router.get('/user/:userId', controller.getSubCategoriesByUserId);

module.exports = router;
