const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const connectDB = require('./config/db');
const checkDBConnection = require('./middleware/dbCheck');
const authRoutes = require('./routes/authRoutes');
const companyEmailRoutes = require('./routes/companyEmailRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// ALWAYS enable trust proxy on cloud hosts like Render so express-session can detect HTTPS via proxy headers
app.set('trust proxy', 1);

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Helper to extract origin (e.g., https://site.netlify.app) even if URL includes paths like /login
const parseOrigin = (urlStr) => {
  if (!urlStr) return '';
  try {
    return new URL(urlStr).origin;
  } catch (e) {
    return urlStr.replace(/\/$/, '');
  }
};

const configuredFrontend = parseOrigin(process.env.FRONTEND_URL);

const allowedOrigins = [
  configuredFrontend,
  'https://submissiontaskvedron.netlify.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      const reqOrigin = parseOrigin(origin);
      const isAllowed = allowedOrigins.some((allowed) => allowed === reqOrigin || allowed === '*');

      if (isAllowed) {
        return callback(null, true);
      }
      // Fail-safe: allow netlify app domains
      if (reqOrigin.endsWith('.netlify.app')) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Session Store Setup
let sessionStore;
if (process.env.MONGODB_URI) {
  try {
    const storeFactory = typeof MongoStore.create === 'function' ? MongoStore : (MongoStore.default || MongoStore);
    if (typeof storeFactory.create === 'function') {
      sessionStore = storeFactory.create({
        mongoUrl: process.env.MONGODB_URI,
        collectionName: 'sessions',
        ttl: 24 * 60 * 60, // 1 day
      });
    }
  } catch (err) {
    console.warn('⚠️ Session store falling back to default store:', err.message);
  }
}

const isProduction =
  process.env.NODE_ENV === 'production' ||
  Boolean(process.env.RENDER) ||
  Boolean(process.env.FRONTEND_URL && !process.env.FRONTEND_URL.includes('localhost'));

// Session middleware configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'vedron_intershall_session_secret_2026',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// Root API welcome endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Enterprise Company Email Collector API is operational',
    docs: '/api/health',
  });
});

// API Routes protected with database connection check middleware
app.use('/api/auth', checkDBConnection, authRoutes);
app.use('/api', checkDBConnection, companyEmailRoutes);
app.use('/api/admin', checkDBConnection, adminRoutes);

// 404 Route Handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: `Cannot find route: ${req.originalUrl}` });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
