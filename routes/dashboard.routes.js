const express = require('express');
const router = express.Router();
const controller = require('../controllers/dashboard.controller');

router.get('/totals', controller.getTotals);

module.exports = router;