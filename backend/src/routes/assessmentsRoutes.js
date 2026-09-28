const express = require('express');
const assessmentsController = require('../controllers/assessmentsController');

const router = express.Router();

router.post('/validate-scope', assessmentsController.validateScope);
router.post('/', assessmentsController.createAssessment);
router.get('/', assessmentsController.listAssessments);
router.get('/:id', assessmentsController.getAssessment);

module.exports = router;
