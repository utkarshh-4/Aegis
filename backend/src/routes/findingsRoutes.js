
const express = require('express');
const router = express.Router();
const findingsController = require('../controllers/findingsController');

router.get('/', findingsController.getAllFindings);
router.post('/', findingsController.createFinding);
router.get('/:id', findingsController.getFindingById);
router.put('/:id', findingsController.updateFinding);
router.delete('/:id', findingsController.deleteFinding);
router.post('/:id/run-poc', findingsController.runPoc);

module.exports = router;
