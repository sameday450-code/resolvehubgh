const { Router } = require('express');
const subscriptionController = require('./subscription.controller');
const { authenticate, authorize, tenantGuard } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const { activateTrialSchema } = require('./subscription.validation');

const router = Router();

// Public — list available plans
router.get('/plans', subscriptionController.getPlans);

// ============================================
// COMPANY ROUTES
// ============================================

/**
 * Company: Get subscription info
 * GET /api/subscriptions/company/info
 */
router.get(
  '/company/info',
  authenticate,
  authorize('COMPANY_ADMIN', 'COMPANY_STAFF'),
  tenantGuard,
  subscriptionController.getCompanySubscriptionInfo
);

/**
 * Company: Submit activation request
 * POST /api/subscriptions/company/request-activation
 */
router.post(
  '/company/request-activation',
  authenticate,
  authorize('COMPANY_ADMIN'),
  tenantGuard,
  subscriptionController.submitActivationRequest
);

/**
 * Company: Get activation requests
 * GET /api/subscriptions/company/activation-requests
 */
router.get(
  '/company/activation-requests',
  authenticate,
  authorize('COMPANY_ADMIN', 'COMPANY_STAFF'),
  tenantGuard,
  subscriptionController.getCompanyActivationRequests
);

// Company routes (authenticated)
router.get(
  '/my',
  authenticate,
  authorize('COMPANY_ADMIN', 'COMPANY_STAFF'),
  tenantGuard,
  subscriptionController.getMySubscription
);

router.get(
  '/my/status',
  authenticate,
  authorize('COMPANY_ADMIN', 'COMPANY_STAFF'),
  tenantGuard,
  subscriptionController.getSubscriptionStatus
);

router.post(
  '/trial/activate',
  authenticate,
  authorize('COMPANY_ADMIN'),
  tenantGuard,
  validate(activateTrialSchema),
  subscriptionController.activateTrial
);

// ============================================
// SUPER ADMIN ROUTES
// ============================================

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

/**
 * Super-admin: manually activate a company subscription.
 * POST /api/subscriptions/:companyId/activate
 * Body: { subscriptionStartDate?, subscriptionEndDate?, nextBillingDate?, paymentStatus? }
 */
router.post(
  '/:companyId/activate',
  authenticate,
  authorize('SUPER_ADMIN'),
  subscriptionController.manuallyActivate
);

/**
 * Super Admin: Get company subscription details
 * GET /api/subscriptions/admin/:companyId/info
 */
router.get(
  '/admin/:companyId/info',
  authenticate,
  authorize('SUPER_ADMIN'),
  subscriptionController.getCompanySubscriptionAdminView
);

/**
 * Super Admin: Manually activate company subscription
 * PATCH /api/subscriptions/admin/:companyId/activate
 */
router.patch(
  '/admin/:companyId/activate',
  authenticate,
  authorize('SUPER_ADMIN'),
  subscriptionController.activateSubscription
);

/**
 * Super Admin: Lock dashboard
 * PATCH /api/subscriptions/admin/:companyId/lock-dashboard
 */
router.patch(
  '/admin/:companyId/lock-dashboard',
  authenticate,
  authorize('SUPER_ADMIN'),
  subscriptionController.lockDashboard
);

/**
 * Super Admin: Unlock dashboard
 * PATCH /api/subscriptions/admin/:companyId/unlock-dashboard
 */
router.patch(
  '/admin/:companyId/unlock-dashboard',
  authenticate,
  authorize('SUPER_ADMIN'),
  subscriptionController.unlockDashboard
);

/**
 * Super Admin: Extend trial
 * PATCH /api/subscriptions/admin/:companyId/extend-trial
 * Body: { days }
 */
router.patch(
  '/admin/:companyId/extend-trial',
  authenticate,
  authorize('SUPER_ADMIN'),
  subscriptionController.extendTrial
);

/**
 * Super Admin: Get all activation requests
 * GET /api/subscriptions/admin/activation-requests
 */
router.get(
  '/admin/activation-requests',
  authenticate,
  authorize('SUPER_ADMIN'),
  subscriptionController.getAllActivationRequests
);

/**
 * Super Admin: Approve activation request
 * PATCH /api/subscriptions/admin/activation-requests/:requestId/approve
 */
router.patch(
  '/admin/activation-requests/:requestId/approve',
  authenticate,
  authorize('SUPER_ADMIN'),
  subscriptionController.approveActivationRequest
);

/**
 * Super Admin: Reject activation request
 * PATCH /api/subscriptions/admin/activation-requests/:requestId/reject
 * Body: { reason }
 */
router.patch(
  '/admin/activation-requests/:requestId/reject',
  authenticate,
  authorize('SUPER_ADMIN'),
  subscriptionController.rejectActivationRequest
);

module.exports = router;
