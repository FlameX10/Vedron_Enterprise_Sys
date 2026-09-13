const User = require('../models/User');

const requireAuth = async (req, res, next) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
    }

    const user = await User.findById(req.session.userId).select('-password');
    if (!user) {
      req.session.destroy();
      return res.status(401).json({ success: false, message: 'User session invalid. Please log in again.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ success: false, message: 'Server authentication error' });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden. Admin access required.' });
  }
  next();
};

module.exports = {
  requireAuth,
  requireAdmin,
};
