const mongoose = require('mongoose');

// Disable Mongoose command buffering so queries fail immediately with clear errors when DB is not connected
mongoose.set('bufferCommands', false);

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vedron_emails';

    console.log(`📡 Connecting to MongoDB...`);
    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of default 30 seconds
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    if (!process.env.MONGODB_URI) {
      console.warn('⚠️ MONGODB_URI is not set in Backend/.env, and local MongoDB on mongodb://127.0.0.1:27017 is unavailable.');
      console.warn('👉 Please set MONGODB_URI in Backend/.env file with your MongoDB Atlas connection string.');
    } else {
      console.error(`❌ MongoDB Connection Error: ${error.message}`);
    }
  }
};

module.exports = connectDB;
