const prisma = require('../../config/database');
const { NotFoundError, ValidationError } = require('../../utils/errors');
const logger = require('../../config/logger');
const { 
  sendPaymentSuccessEmail, 
  sendPaymentFailedEmail,
  sendEnterpriseActivationEmail 
} = require('../../utils/emailService');
const {
  logPaymentAction,
  logPaymentError,
  logSubscriptionStateChange,
  auditLog,
} = require('../../utils/secureLogging');

/**
 * Record a new payment transaction (called by webhook handlers or gateway integrations).
 * Validates required fields before creating.
 */
const createTransaction = async (data) => {
  // Validate required fields
  if (!data.companyId) {
    throw new ValidationError('Company ID is required for payment transaction');
  }
  if (!data.amount || data.amount <= 0) {
    throw new ValidationError('Amount must be a positive number');
  }
  if (!data.gateway) {
    throw new ValidationError('Payment gateway is required (PAYSTACK or STRIPE)');
  }
  if (!['PAYSTACK', 'STRIPE'].includes(data.gateway)) {
    throw new ValidationError(`Invalid gateway: ${data.gateway}`);
  }

  logPaymentAction('TRANSACTION_CREATED', data.companyId, {
    amount: data.amount,
    currency: data.currency || 'USD',
    gateway: data.gateway,
  });

  return prisma.paymentTransaction.create({ data });
};

/**
 * Find a transaction by provider reference (idempotency check for webhooks).
 */
const findByProviderReference = async (providerReference) => {
  return prisma.paymentTransaction.findUnique({ where: { providerReference } });
};

/**
 * Update a transaction's status (e.g., mark SUCCESS/FAILED from webhook).
 */
const updateTransactionStatus = async (id, status, extras = {}) => {
  return prisma.paymentTransaction.update({
    where: { id },
    data: { status, ...extras },
  });
};

/**
 * List transactions for a specific company with pagination.
 */
const listTransactionsByCompany = async (companyId, { page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;

  const [total, items] = await Promise.all([
    prisma.paymentTransaction.count({ where: { companyId } }),
    prisma.paymentTransaction.findMany({
      where: { companyId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return {
    data: items,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  };
};

/**
 * Get a single transaction by ID, scoped to a company.
 */
const getTransactionById = async (id, companyId) => {
  const tx = await prisma.paymentTransaction.findFirst({
    where: { id, companyId },
  });
  if (!tx) throw new NotFoundError('Transaction not found');
  return tx;
};

/**
 * Super-admin: list all transactions across companies.
 */
const listAllTransactions = async ({ page = 1, limit = 20, status, companyId } = {}) => {
  const skip = (page - 1) * limit;
  const where = {};
  if (status) where.status = status;
  if (companyId) where.companyId = companyId;

  const [total, items] = await Promise.all([
    prisma.paymentTransaction.count({ where }),
    prisma.paymentTransaction.findMany({
      where,
      skip,
      take: limit,
      include: {
        company: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return {
    data: items,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  };
};

/**
 * Mark a transaction as FAILED with timestamp and reason.
 */
const failTransaction = async (id, reason = 'Payment failed') => {
  return prisma.paymentTransaction.update({
    where: { id },
    data: { status: 'FAILED', failedAt: new Date(), failureReason: reason },
  });
};

module.exports = {
  createTransaction,
  findByProviderReference,
  updateTransactionStatus,
  failTransaction,
  listTransactionsByCompany,
  getTransactionById,
  listAllTransactions,
  activateSubscriptionAfterPayment,
  handleSubscriptionRenewal,
  handleSubscriptionCancellation,
  handleSubscriptionFailure,
  markSubscriptionPastDue,
};

/**
 * Activate a company's subscription after successful payment.
 * Sets status = ACTIVE, sets billing period dates, updates transaction to SUCCESS.
 * Also handles dashboard access unlocking and sends notifications.
 *
 * @param {string} companyId - The company ID
 * @param {string} transactionId - The transaction ID
 * @param {string} gateway - The payment gateway (PAYSTACK, STRIPE)
 * @returns {Promise<Object>} - Updated subscription
 */
async function activateSubscriptionAfterPayment(companyId, transactionId, gateway) {
  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  try {
    // Get subscription details to check if it's a renewal or first activation
    const existingSubscription = await prisma.companySubscription.findUnique({
      where: { companyId },
      include: { subscriptionPlan: true, company: true },
    });

    const isRenewal = existingSubscription?.status === 'ACTIVE' || existingSubscription?.status === 'PAST_DUE';

    // Activate subscription
    const [subscription, , _] = await Promise.all([
      prisma.companySubscription.update({
        where: { companyId },
        data: {
          status: 'ACTIVE',
          activatedAt: isRenewal ? existingSubscription.activatedAt : now,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          gateway: gateway || undefined,
        },
        include: { subscriptionPlan: true, company: true },
      }),
      // Mark transaction as SUCCESS
      transactionId
        ? prisma.paymentTransaction.update({
            where: { id: transactionId },
            data: { status: 'SUCCESS', paidAt: now },
          })
        : Promise.resolve(),
      // Update company status to APPROVED (if was PENDING, unlock dashboard access)
      prisma.company.update({
        where: { id: companyId },
        data: {
          status: 'APPROVED',
          approvedAt: isRenewal ? undefined : now, // Only set on first activation
        },
      }),
    ]);

    // Send payment success email (non-blocking)
    try {
      const transaction = await prisma.paymentTransaction.findUnique({ where: { id: transactionId } });
      if (transaction) {
        await sendPaymentSuccessEmail(subscription.company, transaction, subscription);
      }
    } catch (err) {
      logger.warn({ err, companyId }, 'Failed to send payment success email');
    }

    return subscription;
  } catch (error) {
    throw new Error(`Failed to activate subscription: ${error.message}`);
  }
}

/**
 * Handle subscription renewal (for recurring billing).
 * Updates the billing period and resets the status to ACTIVE.
 *
 * @param {string} companyId - The company ID
 * @param {string} transactionId - The new transaction ID
 * @returns {Promise<Object>} - Updated subscription
 */
async function handleSubscriptionRenewal(companyId, transactionId) {
  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  return prisma.companySubscription.update({
    where: { companyId },
    data: {
      status: 'ACTIVE',
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
    },
  });
}

/**
 * Handle subscription cancellation.
 * Sets status to CANCELLED and stores cancellation timestamp.
 *
 * @param {string} companyId - The company ID
 * @param {string} reason - Reason for cancellation
 * @returns {Promise<Object>} - Updated subscription
 */
async function handleSubscriptionCancellation(companyId, reason = 'Customer requested cancellation') {
  return prisma.companySubscription.update({
    where: { companyId },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date(),
      metadata: {
        cancellationReason: reason,
        cancelledAt: new Date().toISOString(),
      },
    },
  });
}

/**
 * Handle subscription failure (payment failed).
 * Sets status to PENDING_PAYMENT and stores failure details.
 *
 * @param {string} companyId - The company ID
 * @param {string} reason - Reason for failure
 * @returns {Promise<Object>} - Updated subscription
 */
async function handleSubscriptionFailure(companyId, reason = 'Payment failed') {
  const subscription = await prisma.companySubscription.update({
    where: { companyId },
    data: {
      status: 'PENDING_PAYMENT',
      metadata: {
        lastFailureReason: reason,
        lastFailureAt: new Date().toISOString(),
      },
    },
    include: { company: true },
  });

  // Send payment failed email (non-blocking)
  try {
    const transaction = await prisma.paymentTransaction.findFirst({
      where: { companyId, status: 'FAILED' },
      orderBy: { createdAt: 'desc' },
    });
    if (transaction) {
      await sendPaymentFailedEmail(subscription.company, transaction);
    }
  } catch (err) {
    logger.warn({ err, companyId }, 'Failed to send payment failed email');
  }

  return subscription;
}

/**
 * Mark a subscription as past due.
 * Called when payment is overdue but hasn't been retried yet.
 *
 * @param {string} companyId - The company ID
 * @returns {Promise<Object>} - Updated subscription
 */
async function markSubscriptionPastDue(companyId) {
  return prisma.companySubscription.update({
    where: { companyId },
    data: {
      status: 'PAST_DUE',
    },
  });
}
