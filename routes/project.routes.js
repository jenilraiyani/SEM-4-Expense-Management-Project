const express = require('express');
const router = express.Router();
const controller = require('../controllers/project.controller');

router.get('/', controller.getAll);
router.post('/', controller.create);    
router.put('/:id', controller.update);
router.get('/:id', controller.getProjectById);
router.delete('/:id', controller.delete);
// 👇 ADD THIS NEW ROUTE HERE (Must be before /:id) 👇
router.get('/user/:userId', controller.getProjectsByUserId);

module.exports = router;