const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth.middleware');
const { getAdminSummary } = require('../controllers/summary.controller');

router.get('/summary', authenticate, getAdminSummary);

module.exports = router;
