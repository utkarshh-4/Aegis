
const express = require('express');
const router = express.Router();
const systemController = require('../controllers/systemController');

router.get('/target-status', systemController.getTargetStatus);
router.get('/report', systemController.getReport);

module.exports = router;
