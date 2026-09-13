const mongoose = require('mongoose');

const checkDBConnection = (req, res, next) => {
  // 1 = connected
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database is not connected. Please set a valid MONGODB_URI in Backend/.env (e.g., your MongoDB Atlas URI or local mongodb://127.0.0.1:27017/vedron_emails).',
    });
  }
  next();
};

module.exports = checkDBConnection;
