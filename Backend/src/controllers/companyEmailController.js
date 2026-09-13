const CompanyEmail = require('../models/CompanyEmail');

// @desc    Submit enterprise company email entries (Public or Authenticated)
// @route   POST /api/company-emails
// @access  Public
const submitCompanyEmails = async (req, res) => {
  try {
    const { applicantName: bodyApplicantName, applicantEmail: bodyApplicantEmail } = req.body;
    let rawEntries = req.body.entries || req.body;

    // Determine applicant name and email from session (if logged in) or body inputs
    const applicantName = (req.user && req.user.name) || (bodyApplicantName ? String(bodyApplicantName).trim() : '');
    const applicantEmail = (req.user && req.user.email) || (bodyApplicantEmail ? String(bodyApplicantEmail).trim().toLowerCase() : '');

    if (!applicantName) {
      return res.status(400).json({ success: false, message: 'Please provide your Full Name at the top of the form.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!applicantEmail || !emailRegex.test(applicantEmail)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid Applicant Email Address.' });
    }

    if (!Array.isArray(rawEntries)) {
      if (typeof rawEntries === 'object' && rawEntries !== null && rawEntries.companyName) {
        rawEntries = [rawEntries];
      } else {
        return res.status(400).json({ success: false, message: 'Invalid payload structure. Provide an array of company emails.' });
      }
    }

    if (rawEntries.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide at least one company email entry.' });
    }

    const validatedDocuments = [];

    for (let i = 0; i < rawEntries.length; i++) {
      const entry = rawEntries[i];
      const companyName = entry.companyName ? String(entry.companyName).trim() : '';
      const email = entry.email ? String(entry.email).trim().toLowerCase() : '';

      if (!companyName) {
        return res.status(400).json({
          success: false,
          message: `Row ${i + 1}: Company Name is required.`,
        });
      }

      if (!email || !emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: `Row ${i + 1}: A valid Email Address is required for ${companyName || 'entry'}.`,
        });
      }

      validatedDocuments.push({
        companyName,
        email,
        applicantName,
        applicantEmail,
        applicantId: req.user ? req.user._id : null,
      });
    }

    const createdEntries = await CompanyEmail.insertMany(validatedDocuments);

    res.status(201).json({
      success: true,
      message: '✓ Your emails have been submitted successfully.',
      count: createdEntries.length,
      data: createdEntries,
    });
  } catch (error) {
    console.error('Submit Company Emails Error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit company emails. ' + error.message });
  }
};

// @desc    Get company email submissions for logged-in applicant
// @route   GET /api/company-emails
// @access  Private (Applicant)
const getApplicantCompanyEmails = async (req, res) => {
  try {
    const emails = await CompanyEmail.find({ applicantId: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: emails.length,
      data: emails,
    });
  } catch (error) {
    console.error('Get Applicant Emails Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch submitted emails.' });
  }
};

// @desc    Get user profile data
// @route   GET /api/profile
// @access  Private
const getProfile = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      createdAt: req.user.createdAt,
    },
  });
};

// @desc    Get all submitted company emails (Admin view with search + pagination)
// @route   GET /api/admin/company-emails?page=1&limit=50&search=
// @access  Private (Admin only)
const getAdminCompanyEmails = async (req, res) => {
  try {
    const { search } = req.query;

    // Pagination params — default: page 1, 50 per page
    const page  = Math.max(1, parseInt(req.query.page,  10) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit, 10) || 50));
    const skip  = (page - 1) * limit;

    let query = {};
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query = {
        $or: [
          { companyName: searchRegex },
          { email: searchRegex },
          { applicantName: searchRegex },
          { applicantEmail: searchRegex },
        ],
      };
    }

    // Run count + paginated fetch in parallel for speed
    const [totalCount, pageEmails] = await Promise.all([
      CompanyEmail.countDocuments(query),
      CompanyEmail.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    // Sequential IDs continue across pages (e.g. page 2 starts at 51)
    const formattedEmails = pageEmails.map((item, index) => ({
      id: skip + index + 1,
      mongoId: item._id,
      companyName: item.companyName,
      email: item.email,
      applicantName: item.applicantName,
      applicantEmail: item.applicantEmail || '',
      applicantId: item.applicantId,
      createdAt: item.createdAt,
    }));

    res.status(200).json({
      success: true,
      count: formattedEmails.length,
      totalCount,
      totalPages,
      currentPage: page,
      data: formattedEmails,
    });
  } catch (error) {
    console.error('Get Admin Company Emails Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch company emails for admin view.' });
  }
};

module.exports = {
  submitCompanyEmails,
  getApplicantCompanyEmails,
  getProfile,
  getAdminCompanyEmails,
};
