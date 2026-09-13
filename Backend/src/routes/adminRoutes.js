const express = require('express');
const router = express.Router();
const { getAdminCompanyEmails } = require('../controllers/companyEmailController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(requireAuth);
router.use(requireAdmin);

router.get('/company-emails', getAdminCompanyEmails);

module.exports = router;
