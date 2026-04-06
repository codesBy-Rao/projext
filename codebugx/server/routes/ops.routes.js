const express = require('express');
const { resetDemoData } = require('../controllers/ops.controller');
const { requireAdminToken } = require('../middleware/admin-token.middleware');

const router = express.Router();

router.post('/ops/reset-demo', requireAdminToken, resetDemoData);

module.exports = router;
