const express = require('express');
const router = express.Router();
const {
  submitCompanyEmails,
  getApplicantCompanyEmails,
  getProfile,
} = require('../controllers/companyEmailController');
const { requireAuth } = require('../middleware/auth');

// All applicant routes require authentication
router.use(requireAuth);

router.get('/profile', getProfile);
router.get('/company-emails', getApplicantCompanyEmails);
router.post('/company-emails', submitCompanyEmails);

module.exports = router;
