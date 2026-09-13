const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { register, login, logout, getMe } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

// Rate limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 auth requests per windowMs
  message: { success: false, message: 'Too many authentication attempts. Please try again after 15 minutes.' },
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.get('/me', requireAuth, getMe);

module.exports = router;
