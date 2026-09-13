const express = require('express');
const router = express.Router();
const User = require('../models/User');
const {
  submitCompanyEmails,
  getApplicantCompanyEmails,
  getProfile,
} = require('../controllers/companyEmailController');
const { requireAuth } = require('../middleware/auth');

// Optional auth middleware for POST submission (attaches req.user if session exists)
const optionalAuth = async (req, res, next) => {
  try {
    if (req.session && req.session.userId) {
      const user = await User.findById(req.session.userId).select('-password');
      if (user) {
        req.user = user;
      }
    }
  } catch (err) {}
  next();
};

// Public endpoint for applicants to submit company emails
router.post('/company-emails', optionalAuth, submitCompanyEmails);

// Protected routes for profile & submission history
router.get('/profile', requireAuth, getProfile);
router.get('/company-emails', requireAuth, getApplicantCompanyEmails);

module.exports = router;
