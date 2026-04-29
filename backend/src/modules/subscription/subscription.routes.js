const { Router } = require('express');
const subscriptionController = require('./subscription.controller');
const { authenticate, authorize, tenantGuard } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const { activateTrialSchema } = require('./subscription.validation');

const router = Router();

// Public — list available plans
router.get('/plans', subscriptionController.getPlans);

// Company routes (authenticated)
router.get(
  '/my',
  authenticate,
  authorize('COMPANY_ADMIN', 'COMPANY_STAFF'),
  tenantGuard,
  subscriptionController.getMySubscription
);

router.post(
  '/trial/activate',
  authenticate,
  authorize('COMPANY_ADMIN'),
  tenantGuard,
  validate(activateTrialSchema),
  subscriptionController.activateTrial
);

// Super-admin routes
router.get(
  '/',
  authenticate,
  authorize('SUPER_ADMIN'),
  subscriptionController.listSubscriptions
);

router.patch(
  '/:companyId',
  authenticate,
  authorize('SUPER_ADMIN'),
  subscriptionController.updateSubscription
);

module.exports = router;
