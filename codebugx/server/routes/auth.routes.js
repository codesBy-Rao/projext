const express = require('express');
const { register, login, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/jwt.middleware');
const { validateAuthPayload } = require('../middleware/validation.middleware');

const router = express.Router();

router.post('/register', validateAuthPayload, register);
router.post('/login', validateAuthPayload, login);
router.get('/me', protect, getMe);

module.exports = router;
