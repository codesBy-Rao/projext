const express = require('express');
const { analyzeCode } = require('../controllers/analyze.controller');
const { protect } = require('../middleware/jwt.middleware');
const { validateAnalyzePayload } = require('../middleware/validation.middleware');

const router = express.Router();

router.post('/analyze', protect, validateAnalyzePayload, analyzeCode);

module.exports = router;
