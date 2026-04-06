const express = require('express');
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const analyzeRoutes = require('./analyze.routes');
const analyticsRoutes = require('./analytics.routes');

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/', analyzeRoutes);
router.use('/', analyticsRoutes);

module.exports = router;
