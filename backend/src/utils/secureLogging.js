/**
 * Secure Logging Utility for Payments
 * Sanitizes sensitive payment data before logging
 */

const logger = require('../config/logger');

/**
 * Sanitize payment data for logging
 * Removes/masks sensitive fields
 */
const sanitizePayment = (data) => {
  if (!data) return null;

  const sanitized = { ...data };

  // Remove sensitive fields entirely
  delete sanitized.providerReference; // Transaction reference
  delete sanitized.providerData; // Full webhook data

  // Mask card data
  if (sanitized.cardLastFour) {
    sanitized.cardLastFour = `****${sanitized.cardLastFour.slice(-4)}`;
  }

  // Mask sensitive strings (keep first 4 and last 4 chars)
  const maskString = (str) => {
    if (!str || str.length <= 8) return '****';
    return `${str.slice(0, 4)}****${str.slice(-4)}`;
  };

  if (sanitized.authorizationUrl) {
    sanitized.authorizationUrl = maskString(sanitized.authorizationUrl);
  }

  return sanitized;
};

/**
 * Log payment action with context
 * Example: logPaymentAction('CHARGE_INITIATED', companyId, {amount, currency})
 */
const logPaymentAction = (action, companyId, context = {}) => {
  const logData = {
    action,
    companyId,
    timestamp: new Date().toISOString(),
    ...sanitizePayment(context),
  };

  logger.info(logData, `Payment Action: ${action}`);
  return logData;
};

/**
 * Log payment error with security considerations
 */
const logPaymentError = (error, action, companyId, context = {}) => {
  const errorData = {
    action,
    companyId,
    timestamp: new Date().toISOString(),
    error: {
      message: error.message,
      code: error.code,
      // Only include stack in development
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    },
    context: sanitizePayment(context),
  };

  logger.error(errorData, `Payment Error: ${action}`);
  return errorData;
};

/**
 * Log webhook received (minimal details)
 */
const logWebhookReceived = (gateway, eventType, reference) => {
  logger.info({
    gateway,
    eventType,
    reference: maskString(reference),
  }, `Webhook Received: ${gateway} - ${eventType}`);
};

/**
 * Log webhook verified
 */
const logWebhookVerified = (gateway, eventType, companyId) => {
  logger.info({
    gateway,
    eventType,
    companyId,
  }, `Webhook Verified: ${gateway} - ${eventType}`);
};

/**
 * Log webhook failed verification (security alert)
 */
const logWebhookVerificationFailed = (gateway, eventType, reason) => {
  logger.warn({
    gateway,
    eventType,
    reason,
    severity: 'HIGH', // Potential security threat
  }, `Webhook Verification Failed: ${gateway} - ${eventType}`);
};

/**
 * Log subscription state change
 */
const logSubscriptionStateChange = (companyId, oldStatus, newStatus, reason = '') => {
  logger.info({
    companyId,
    oldStatus,
    newStatus,
    reason,
    timestamp: new Date().toISOString(),
  }, `Subscription State Change: ${oldStatus} → ${newStatus}`);
};

/**
 * Helper to mask strings in logs
 */
const maskString = (str) => {
  if (!str || str.length <= 8) return '****';
  return `${str.slice(0, 4)}****${str.slice(-4)}`;
};

/**
 * Audit log for sensitive operations (creates immutable record)
 * Use this for compliance/PCI DSS requirements
 */
const auditLog = async (operation, companyId, result, metadata = {}) => {
  // In production, write to immutable audit log storage
  // For now, log to application logger with audit marker
  logger.info({
    __audit: true,
    operation,
    companyId,
    result, // SUCCESS, FAILURE
    metadata: sanitizePayment(metadata),
    timestamp: new Date().toISOString(),
  }, `AUDIT: ${operation}`);
};

module.exports = {
  sanitizePayment,
  logPaymentAction,
  logPaymentError,
  logWebhookReceived,
  logWebhookVerified,
  logWebhookVerificationFailed,
  logSubscriptionStateChange,
  maskString,
  auditLog,
};
