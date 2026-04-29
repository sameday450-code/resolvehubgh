const { Router } = require('express');
const paymentsController = require('./payments.controller');
const { authenticate, authorize, tenantGuard } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const { initPaymentSchema } = require('./payments.validation');

const router = Router();

// ── Webhook routes (no auth — verified by signature) ──────────────────────────
// NOTE: Stripe webhook MUST receive raw body. Registered in index.js with
// express.raw() before the main express.json() middleware.
router.post('/webhook/paystack', paymentsController.paystackWebhook);
router.post('/webhook/stripe', paymentsController.stripeWebhook);

// ── Company routes ─────────────────────────────────────────────────────────────
router.post(
  '/initialize',
  authenticate,
  authorize('COMPANY_ADMIN'),
  tenantGuard,
  validate(initPaymentSchema),
  paymentsController.initializePayment
);

router.post(
  '/verify',
  authenticate,
  authorize('COMPANY_ADMIN'),
  tenantGuard,
  paymentsController.verifyPayment
);

router.get(
  '/my',
  authenticate,
  authorize('COMPANY_ADMIN'),
  tenantGuard,
  paymentsController.getMyTransactions
);

router.get(
  '/my/:id',
  authenticate,
  authorize('COMPANY_ADMIN'),
  tenantGuard,
  paymentsController.getMyTransaction
);

// ── Super-admin routes ─────────────────────────────────────────────────────────
router.get(
  '/',
  authenticate,
  authorize('SUPER_ADMIN'),
  paymentsController.listAllTransactions
);

module.exports = router;
