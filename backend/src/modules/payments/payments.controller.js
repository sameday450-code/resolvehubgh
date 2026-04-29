const paymentsService = require('./payments.service');
const gatewayService = require('./gateway.service');
const response = require('../../utils/response');
const prisma = require('../../config/database');
const config = require('../../config');
const { NotFoundError, BadRequestError, ConflictError } = require('../../utils/errors');
const logger = require('../../config/logger');

// Paystack checkout sessions are valid for ~30 minutes
const IDEMPOTENCY_WINDOW_MS = 30 * 60 * 1000;

const getMyTransactions = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await paymentsService.listTransactionsByCompany(req.user.companyId, {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
    return response.paginated(res, result.data, result.pagination);
  } catch (err) {
    next(err);
  }
};

const getMyTransaction = async (req, res, next) => {
  try {
    const tx = await paymentsService.getTransactionById(req.params.id, req.user.companyId);
    return response.success(res, tx);
  } catch (err) {
    next(err);
  }
};

const listAllTransactions = async (req, res, next) => {
  try {
    const { page, limit, status, companyId } = req.query;
    const result = await paymentsService.listAllTransactions({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      status,
      companyId,
    });
    return response.paginated(res, result.data, result.pagination);
  } catch (err) {
    next(err);
  }
};

module.exports = { getMyTransactions, getMyTransaction, listAllTransactions, initializePayment, verifyPayment, paystackWebhook, stripeWebhook };

/**
 * POST /api/payments/initialize
 * Body: { gateway: 'PAYSTACK' | 'STRIPE' }
 *
 * Initializes a checkout session for the authenticated company's pending subscription.
 * Returns { checkoutUrl, providerReference, transactionId }.
 *
 * Error handling:
 * - 404: Company has no subscription
 * - 400: Subscription already active or plan unavailable
 * - 500: Gateway initialization failed
 */
async function initializePayment(req, res, next) {
  try {
    const { gateway } = req.body;
    const companyId = req.user.companyId;

    if (!gateway || !['PAYSTACK', 'STRIPE'].includes(gateway)) {
      throw new BadRequestError('gateway must be PAYSTACK or STRIPE');
    }

    // ── 1. Load subscription ──────────────────────────────────────────────────
    let subscription = await prisma.companySubscription.findUnique({
      where: { companyId },
      include: { subscriptionPlan: true },
    });

    if (!subscription) {
      throw new NotFoundError('No subscription found for this company. Please contact support.');
    }

    if (subscription.status === 'ACTIVE') {
      throw new BadRequestError('Your subscription is already active. No payment is needed.');
    }

    if (subscription.status === 'CANCELLED') {
      throw new BadRequestError('Your subscription has been cancelled. Please contact support to reactivate.');
    }

    // ── 2. Trial upgrade: switch STARTER_TRIAL (free) → ENTERPRISE_MONTHLY ───
    let targetPlan = subscription.subscriptionPlan;
    if (targetPlan.price === 0 || targetPlan.planType === 'STARTER_TRIAL') {
      const enterprisePlan = await prisma.subscriptionPlan.findUnique({
        where: { planType: 'ENTERPRISE_MONTHLY' },
      });

      if (!enterprisePlan) {
        throw new NotFoundError('Enterprise plan not found. Please contact support.');
      }

      if (!enterprisePlan.isActive) {
        throw new BadRequestError('Enterprise plan is currently unavailable. Please contact support.');
      }

      // Switch subscription to the paid plan
      subscription = await prisma.companySubscription.update({
        where: { companyId },
        data: { subscriptionPlanId: enterprisePlan.id },
        include: { subscriptionPlan: true },
      });

      targetPlan = enterprisePlan;
      logger.info({ companyId }, 'Trial company switched to ENTERPRISE_MONTHLY for upgrade payment');
    }

    // ── 3. Idempotency: reuse a recent PENDING checkout session ───────────────
    const recent = await prisma.paymentTransaction.findFirst({
      where: {
        companySubscriptionId: subscription.id,
        status: 'PENDING',
        gateway,
        createdAt: { gte: new Date(Date.now() - IDEMPOTENCY_WINDOW_MS) },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (recent?.metadata?.checkoutUrl) {
      logger.info({ companyId, transactionId: recent.id, gateway }, 'Returning existing pending payment session');
      return response.success(res, {
        checkoutUrl: recent.metadata.checkoutUrl,
        providerReference: recent.providerReference,
        transactionId: recent.id,
        isExisting: true,
      }, 'Existing payment session returned');
    }

    // ── 4. Initialize with gateway ────────────────────────────────────────────
    const billingProfile = await prisma.billingProfile.findUnique({ where: { companyId } });
    const billingEmail = billingProfile?.billingEmail || req.user.email;
    const amountGHS = targetPlan.price;
    const planName = targetPlan.name;

    if (amountGHS <= 0) {
      throw new BadRequestError('Invalid plan price. Please contact support.');
    }

    const metadata = {
      companyId,
      subscriptionId: subscription.id,
      planType: targetPlan.planType,
      billingCycle: targetPlan.billingCycle,
      companyName: req.user.company?.name || 'Unknown',
      email: billingEmail,
    };

    let initResult;
    try {
      if (gateway === 'PAYSTACK') {
        initResult = await gatewayService.initializePaystack({
          email: billingEmail,
          amountGHS,
          metadata,
          callbackUrl: `${config.frontendUrl}/payment/callback?gateway=paystack`,
        });
      } else if (gateway === 'STRIPE') {
        initResult = await gatewayService.initializeStripe({
          email: billingEmail,
          amountGHS,
          planName,
          metadata,
        });
      }
    } catch (gatewayErr) {
      logger.error({ gateway, error: gatewayErr }, 'Payment gateway initialization failed');
      throw new BadRequestError(`${gateway} initialization failed: ${gatewayErr.message}`);
    }

    // ── 5. Record pending transaction ──────────────────────────────────────────
    const transaction = await paymentsService.createTransaction({
      companyId,
      companySubscriptionId: subscription.id,
      billingProfileId: billingProfile?.id ?? null,
      gateway,
      status: 'PENDING',
      providerReference: initResult.providerReference,
      amount: Math.round(amountGHS * 100),
      currency: 'GHS',
      metadata: {
        checkoutUrl: initResult.checkoutUrl,
        planType: targetPlan.planType,
        billingCycle: targetPlan.billingCycle,
      },
    });

    logger.info(
      { companyId, gateway, planType: targetPlan.planType, transactionId: transaction.id, amount: amountGHS },
      'Payment initialized'
    );

    return response.success(res, {
      checkoutUrl: initResult.checkoutUrl,
      providerReference: initResult.providerReference,
      transactionId: transaction.id,
      isExisting: false,
    }, 'Payment initialized successfully');

  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/payments/verify
 * Body: { reference, gateway }
 *
 * Called by the frontend after returning from the payment gateway.
 * Verifies the payment directly with the gateway and activates the subscription.
 *
 * Error handling:
 * - 400: Missing reference/gateway or payment verification failed
 * - 404: Transaction not found
 * - 500: Subscription activation failed
 */
async function verifyPayment(req, res, next) {
  try {
    const { reference, gateway } = req.body;
    const companyId = req.user.companyId;

    if (!reference || !gateway) {
      throw new BadRequestError('reference and gateway are required');
    }

    if (!['PAYSTACK', 'STRIPE'].includes(gateway)) {
      throw new BadRequestError('gateway must be PAYSTACK or STRIPE');
    }

    // ── Find the transaction ──────────────────────────────────────────────────
    const transaction = await paymentsService.findByProviderReference(reference);

    if (!transaction) {
      throw new NotFoundError('Payment transaction not found');
    }

    if (transaction.companyId !== companyId) {
      logger.warn({ transactionId: transaction.id, requestedCompanyId: companyId }, 'Unauthorized payment verification attempt');
      throw new BadRequestError('You do not have access to this transaction');
    }

    // ── Idempotency: if already processed, return current subscription ────────
    if (transaction.status === 'SUCCESS') {
      const subscription = await prisma.companySubscription.findUnique({ where: { companyId } });
      logger.info({ transactionId: transaction.id, companyId }, 'Payment already verified (returning existing subscription)');
      return response.success(res, {
        alreadyActivated: true,
        subscription,
      }, 'Subscription is already active');
    }

    if (transaction.status === 'FAILED') {
      throw new BadRequestError(`Payment was previously failed: ${transaction.failureReason || 'Unknown reason'}`);
    }

    // ── Verify with gateway ───────────────────────────────────────────────────
    let verified = false;
    let verifyResult = {};

    try {
      if (gateway === 'PAYSTACK') {
        verifyResult = await gatewayService.verifyPaystack(reference);
        verified = verifyResult.success;
      } else if (gateway === 'STRIPE') {
        verifyResult = await gatewayService.verifyStripe(reference);
        verified = verifyResult.success;
      }
    } catch (verifyErr) {
      logger.error({ gateway, reference, error: verifyErr }, 'Gateway verification failed');
      throw new BadRequestError(`${gateway} verification failed: ${verifyErr.message}`);
    }

    if (!verified) {
      logger.warn({ transactionId: transaction.id, gateway, reference }, 'Payment verification failed at gateway');
      
      // Mark transaction as FAILED
      await paymentsService.updateTransactionStatus(transaction.id, 'FAILED', {
        failedAt: new Date(),
        failureReason: verifyResult.data?.status || 'Payment verification failed',
      });

      throw new BadRequestError('Payment verification failed. Please try again or contact support.');
    }

    // ── Activate subscription ─────────────────────────────────────────────────
    try {
      const subscription = await paymentsService.activateSubscriptionAfterPayment(
        companyId,
        transaction.id,
        gateway
      );

      logger.info({ transactionId: transaction.id, companyId, gateway }, 'Payment verified and subscription activated');

      // Emit socket event for real-time UI update
      const io = req.app.get('io');
      if (io) {
        io.to(`company:${companyId}`).emit('subscription_activated', {
          subscriptionId: subscription.id,
          status: 'ACTIVE',
          activatedAt: subscription.activatedAt,
          currentPeriodEnd: subscription.currentPeriodEnd,
        });
      }

      return response.success(res, {
        subscription,
        alreadyActivated: false,
      }, 'Payment verified and subscription activated successfully');

    } catch (activateErr) {
      logger.error({ transactionId: transaction.id, companyId, error: activateErr }, 'Failed to activate subscription after payment verification');
      throw new BadRequestError(`Subscription activation failed: ${activateErr.message}`);
    }

  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/payments/webhook/paystack
 * Receives Paystack server-to-server webhook events.
 * 
 * Handles the following events:
 * - charge.success: Payment successful
 * - charge.failed: Payment failed
 */
async function paystackWebhook(req, res, next) {
  let event;

  try {
    const signature = req.headers['x-paystack-signature'];
    const rawBody = req.rawBody || JSON.stringify(req.body);

    if (!signature || !rawBody) {
      logger.warn('Paystack webhook missing signature or body');
      return res.status(400).json({ success: false, message: 'Missing signature or body' });
    }

    // ── Verify Paystack signature ─────────────────────────────────────────────
    if (!gatewayService.verifyPaystackSignature(rawBody, signature)) {
      logger.warn('Paystack webhook signature verification failed');
      return res.status(403).json({ success: false, message: 'Invalid signature' });
    }

    try {
      event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch (parseErr) {
      logger.error({ error: parseErr }, 'Failed to parse Paystack webhook JSON');
      return res.status(400).json({ success: false, message: 'Invalid JSON' });
    }

    const eventType = event.event;
    const eventData = event.data;
    logger.info({ eventType }, 'Processing Paystack webhook event');

    // ── Handle charge.success ─────────────────────────────────────────────────
    if (eventType === 'charge.success') {
      const reference = eventData?.reference;
      if (!reference) {
        logger.warn('Paystack charge.success missing reference');
        return res.sendStatus(200); // Return 200 to stop retries
      }

      // Check for duplicate processing (idempotency)
      const existingTransaction = await paymentsService.findByProviderReference(reference);

      if (!existingTransaction) {
        logger.warn({ reference }, 'Paystack transaction not found in records');
        return res.sendStatus(200);
      }

      // Idempotency: prevent duplicate activation
      if (existingTransaction.status === 'SUCCESS') {
        logger.info({ reference, transactionId: existingTransaction.id }, 'Paystack payment already processed (idempotent)');
        return res.sendStatus(200);
      }

      if (existingTransaction.status === 'FAILED') {
        logger.warn({ reference, transactionId: existingTransaction.id }, 'Paystack transaction was marked failed, skipping activation');
        return res.sendStatus(200);
      }

      // Status is PENDING — activate it now
      try {
        const subscription = await paymentsService.activateSubscriptionAfterPayment(
          existingTransaction.companyId,
          existingTransaction.id,
          'PAYSTACK'
        );

        logger.info(
          { reference, companyId: existingTransaction.companyId, transactionId: existingTransaction.id },
          'Paystack payment activated via webhook'
        );

        // Emit socket event for real-time UI update
        const io = req.app.get('io');
        if (io) {
          io.to(`company:${existingTransaction.companyId}`).emit('subscription_activated', {
            subscriptionId: subscription.id,
            status: 'ACTIVE',
            activatedAt: subscription.activatedAt,
          });
        }

        return res.sendStatus(200);
      } catch (activateErr) {
        logger.error(
          { error: activateErr, reference, companyId: existingTransaction.companyId },
          'Failed to activate subscription after Paystack webhook'
        );
        return res.sendStatus(200); // Return 200 to stop Paystack from retrying
      }
    }

    // ── Handle charge.failed ──────────────────────────────────────────────────
    if (eventType === 'charge.failed') {
      const reference = eventData?.reference;
      if (!reference) {
        logger.warn('Paystack charge.failed missing reference');
        return res.sendStatus(200);
      }

      const transaction = await paymentsService.findByProviderReference(reference);

      if (!transaction) {
        logger.warn({ reference }, 'Paystack failed charge not found in records');
        return res.sendStatus(200);
      }

      if (transaction.status === 'PENDING') {
        const reason = eventData?.gateway_response || 'Payment failed';
        await paymentsService.failTransaction(transaction.id, reason);

        logger.info(
          { reference, companyId: transaction.companyId, reason },
          'Paystack payment failed via webhook'
        );

        // Emit socket event
        const io = req.app.get('io');
        if (io) {
          io.to(`company:${transaction.companyId}`).emit('payment_failed', {
            transactionId: transaction.id,
            reason,
          });
        }
      }

      return res.sendStatus(200);
    }

    // Acknowledge other event types
    logger.debug({ eventType }, 'Unhandled Paystack webhook event type');
    return res.sendStatus(200);

  } catch (err) {
    logger.error({ error: err }, 'Paystack webhook processing error');
    // Always return 200 to prevent Paystack from retrying
    return res.sendStatus(200);
  }
}

/**
 * POST /api/payments/webhook/stripe
 * Receives Stripe server-to-server webhook events (requires raw body).
 * 
 * Handles the following events:
 * - checkout.session.completed: Payment successful
 * - checkout.session.expired: Session expired without payment
 * - charge.refunded: Refund issued
 */
async function stripeWebhook(req, res, next) {
  let event;
  
  try {
    const signature = req.headers['stripe-signature'];
    const rawBody = req.body; // raw Buffer from express.raw()

    if (!signature || !rawBody) {
      logger.warn('Stripe webhook missing signature or body');
      return res.status(400).json({ success: false, message: 'Missing signature or body' });
    }

    // ── Verify Stripe signature ───────────────────────────────────────────────
    if (!gatewayService.verifyStripeSignature(rawBody.toString(), signature)) {
      logger.warn('Stripe webhook signature verification failed');
      return res.status(403).json({ success: false, message: 'Invalid Stripe signature' });
    }

    // ── Parse the event ───────────────────────────────────────────────────────
    try {
      event = JSON.parse(rawBody.toString());
    } catch (parseErr) {
      logger.error({ error: parseErr }, 'Failed to parse Stripe webhook JSON');
      return res.status(400).json({ success: false, message: 'Invalid JSON' });
    }

    const eventId = event.id;
    const eventType = event.type;
    logger.info({ eventId, eventType }, 'Processing Stripe webhook event');

    // ── Handle checkout.session.completed ─────────────────────────────────────
    if (eventType === 'checkout.session.completed') {
      const session = event.data?.object;
      if (!session?.id) {
        logger.warn({ eventId }, 'Stripe session missing ID');
        return res.sendStatus(200); // Return 200 to stop retries
      }

      const sessionId = session.id;
      
      // Check for duplicate processing (idempotency via providerReference)
      const existingTransaction = await paymentsService.findByProviderReference(sessionId);
      
      if (existingTransaction) {
        if (existingTransaction.status === 'SUCCESS') {
          logger.info({ sessionId, transactionId: existingTransaction.id }, 'Stripe payment already processed (idempotent)');
          return res.sendStatus(200);
        }

        if (existingTransaction.status === 'FAILED') {
          logger.warn({ sessionId, transactionId: existingTransaction.id }, 'Stripe session previously failed');
          return res.sendStatus(200);
        }

        // Status is PENDING — activate it now
        try {
          const subscription = await paymentsService.activateSubscriptionAfterPayment(
            existingTransaction.companyId,
            existingTransaction.id,
            'STRIPE'
          );

          logger.info(
            { sessionId, companyId: existingTransaction.companyId, transactionId: existingTransaction.id },
            'Stripe payment activated via webhook'
          );

          // Emit socket event for real-time UI update
          const io = req.app.get('io');
          if (io) {
            io.to(`company:${existingTransaction.companyId}`).emit('subscription_activated', {
              subscriptionId: subscription.id,
              status: 'ACTIVE',
              activatedAt: subscription.activatedAt,
            });
          }

          return res.sendStatus(200);
        } catch (activateErr) {
          logger.error(
            { error: activateErr, sessionId, companyId: existingTransaction.companyId },
            'Failed to activate subscription after Stripe webhook'
          );
          return res.sendStatus(200); // Still return 200 to stop retries
        }
      }

      // No transaction found — shouldn't happen, but log it
      logger.warn({ sessionId }, 'Stripe session not found in transaction records');
      return res.sendStatus(200);
    }

    // ── Handle checkout.session.expired ──────────────────────────────────────
    if (eventType === 'checkout.session.expired') {
      const session = event.data?.object;
      const sessionId = session?.id;

      if (sessionId) {
        const transaction = await paymentsService.findByProviderReference(sessionId);
        if (transaction && transaction.status === 'PENDING') {
          await paymentsService.updateTransactionStatus(transaction.id, 'FAILED', {
            failedAt: new Date(),
            failureReason: 'Stripe checkout session expired',
          });

          logger.info({ sessionId, companyId: transaction.companyId }, 'Stripe session expired');

          // Emit socket event
          const io = req.app.get('io');
          if (io) {
            io.to(`company:${transaction.companyId}`).emit('payment_expired', {
              transactionId: transaction.id,
              reason: 'Checkout session expired',
            });
          }
        }
      }

      return res.sendStatus(200);
    }

    // ── Handle charge.refunded (for subscription refunds) ───────────────────
    if (eventType === 'charge.refunded') {
      const charge = event.data?.object;
      if (charge?.metadata?.sessionId) {
        const transaction = await paymentsService.findByProviderReference(charge.metadata.sessionId);
        if (transaction && transaction.status === 'SUCCESS') {
          await paymentsService.updateTransactionStatus(transaction.id, 'REFUNDED', {
            failedAt: new Date(),
            failureReason: `Refunded: ${charge.refunded ? 'Full' : 'Partial'} refund`,
          });

          logger.info({ chargeId: charge.id, companyId: transaction.companyId }, 'Payment refunded');
        }
      }

      return res.sendStatus(200);
    }

    // ── Acknowledge other event types (for logging/audit) ────────────────────
    logger.debug({ eventId, eventType }, 'Unhandled Stripe webhook event type');
    return res.sendStatus(200);

  } catch (err) {
    logger.error({ error: err }, 'Stripe webhook processing error');
    // Always return 200 to prevent Stripe from retrying
    return res.sendStatus(200);
  }
}
