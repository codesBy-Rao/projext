const express = require('express');
const {
  getDashboardAnalytics,
  getWeeklyTrend,
  getWeakTopics,
  getSubmissionHistory,
} = require('../controllers/analytics.controller');
const { protect } = require('../middleware/jwt.middleware');
const { validatePaginationQuery } = require('../middleware/validation.middleware');

const router = express.Router();

router.get('/analytics/overview', protect, getDashboardAnalytics);
router.get('/analytics/weekly', protect, getWeeklyTrend);
router.get('/analytics/topics', protect, validatePaginationQuery, getWeakTopics);
router.get('/history', protect, validatePaginationQuery, getSubmissionHistory);

module.exports = router;
