
const express = require('express');
const router = express.Router();
const systemController = require('../controllers/systemController');

router.get('/target-status', systemController.getTargetStatus);
router.get('/report', systemController.getReport);
router.get('/report/pdf', systemController.getReportPdf);

module.exports = router;
