require('dotenv').config();

module.exports = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.EMAIL_FROM || 'noreply@apploge.com',
    secure: process.env.SMTP_SECURE || 'false',
    timeout: process.env.SMTP_TIMEOUT || 10000,
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
  },
  paystack: {
    secretKey: process.env.PAYSTACK_SECRET_KEY,
    publicKey: process.env.PAYSTACK_PUBLIC_KEY,
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publicKey: process.env.STRIPE_PUBLIC_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
  neonAuth: {
    url: process.env.NEON_AUTH_URL,
    jwksUrl: process.env.NEON_AUTH_JWKS_URL,
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10485760,
  billing: {
    enableOnlinePayments: process.env.ENABLE_ONLINE_PAYMENTS !== 'false',
    trialDays: parseInt(process.env.TRIAL_DAYS, 10) || 14,
  },
  supportContact: {
    email: process.env.SUPPORT_EMAIL || 'support@resolvehub.com',
    phone: process.env.SUPPORT_PHONE || '+233 (0) XXX XXX XXX',
    whatsapp: process.env.SUPPORT_WHATSAPP || '+233XXXXXXXXX',
  },
};
