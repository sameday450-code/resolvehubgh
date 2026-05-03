require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const config = require('./config');
const logger = require('./config/logger');
const errorHandler = require('./middleware/errorHandler');
const { initializeSocket } = require('./sockets');
const { ensureMigrations } = require('./utils/ensureMigrations');
const { bootstrap } = require('./utils/bootstrap');

// Route imports
const authRoutes = require('./modules/auth/auth.routes');
const superAdminRoutes = require('./modules/super-admin/superAdmin.routes');
const branchRoutes = require('./modules/branches/branches.routes');
const qrCodeRoutes = require('./modules/qrcodes/qrcodes.routes');
const complaintRoutes = require('./modules/complaints/complaints.routes');
const notificationRoutes = require('./modules/notifications/notifications.routes');
const analyticsRoutes = require('./modules/analytics/analytics.routes');
const settingsRoutes = require('./modules/settings/settings.routes');
const uploadRoutes = require('./modules/uploads/uploads.routes');
const companyRoutes = require('./modules/companies/companies.routes');
const subscriptionRoutes = require('./modules/subscription/subscription.routes');
const billingRoutes = require('./modules/billing/billing.routes');
const paymentsRoutes = require('./modules/payments/payments.routes');
const contactSalesRoutes = require('./modules/contact-sales/contactSales.routes');

// Job initialization
const { initializeJobs } = require('./jobs');

const app = express();
const server = http.createServer(app);

// Determine allowed origins for CORS
const getAllowedOrigins = () => {
  if (config.nodeEnv === 'development') {
    return ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:5173', '*'];
  }
  
  // Production: specific frontend URLs
  const origins = Array.isArray(config.corsOrigins) ? config.corsOrigins : [config.corsOrigins];
  
  // Add all frontend variants
  const allOrigins = new Set(origins);
  allOrigins.add('https://getresolvehub.com');
  allOrigins.add('https://www.getresolvehub.com');
  allOrigins.add('https://resolvehub-frontend.vercel.app');
  
  return Array.from(allOrigins);
};

const allowedOrigins = getAllowedOrigins();

// Socket.IO setup with proper CORS
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

initializeSocket(io);
app.set('io', io);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS middleware with support for multiple origins
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (config.nodeEnv === 'development' || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Stricter rate limit for public complaint submission
const complaintLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: { success: false, message: 'Too many submissions. Please try again later.' },
});
app.use('/api/complaints/public', complaintLimiter);

// Body parsing
// Stripe webhook must receive the raw body — register BEFORE express.json()
app.post(
  '/api/payments/webhook/stripe',
  express.raw({ type: 'application/json' }),
  require('./modules/payments/payments.controller').stripeWebhook
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root endpoint - returns API status
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'ResolveHub API is running',
    environment: config.nodeEnv,
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/qrcodes', qrCodeRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/public', companyRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/contact-sales', contactSalesRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    code: 'NOT_FOUND',
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Initialize scheduled jobs
initializeJobs();

// Get local IP address for development logs
const os = require('os');
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const localIp = getLocalIp();

// Async startup wrapper to ensure migrations run before server starts
(async () => {
  try {
    // Verify database migrations are complete (production safety check)
    if (config.nodeEnv === 'production') {
      logger.info('⏳ Verifying database migrations in production...');
      await ensureMigrations();
    }

    // Run bootstrap to ensure essential data exists
    logger.info('🔧 Bootstrapping system...');
    await bootstrap();

    // Start server
    server.listen(config.port, '0.0.0.0', () => {
      logger.info(`🚀 Server running on port ${config.port} in ${config.nodeEnv} mode`);
      logger.info(`📡 Socket.IO ready`);
      if (config.nodeEnv === 'development') {
        logger.info(`\n📱 Access from mobile:`);
        logger.info(`   http://${localIp}:${config.port}`);
        logger.info(`   Frontend: http://${localIp}:5173\n`);
      }
    });
  } catch (error) {
    logger.error({ err: error }, 'Failed to start server');
    process.exit(1);
  }
})();

// Graceful shutdown
const shutdown = async () => {
  logger.info('Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

module.exports = { app, server };
