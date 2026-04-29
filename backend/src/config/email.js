const nodemailer = require('nodemailer');
const config = require('./index');
const logger = require('./logger');

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.port === 465 || config.smtp.secure === 'true',
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
  connectionTimeout: parseInt(config.smtp.timeout || 10000, 10),
  socketTimeout: parseInt(config.smtp.timeout || 10000, 10),
  logger: false,
  debug: false,
});

// Verify connection on startup with retry logic
const verifyConnection = async (retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await transporter.verify();
      logger.info(`✅ SMTP connection verified (${config.smtp.host}:${config.smtp.port})`);
      return true;
    } catch (err) {
      logger.warn({
        attempt,
        error: err.message,
        host: config.smtp.host,
        port: config.smtp.port,
      }, `SMTP verification failed (attempt ${attempt}/${retries})`);

      if (attempt < retries) {
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      } else {
        logger.error({
          error: err.message,
          code: err.code,
          host: config.smtp.host,
        }, '❌ SMTP connection failed - check credentials and configuration');
        return false;
      }
    }
  }
};

// Verify connection on startup
verifyConnection();

module.exports = transporter;
