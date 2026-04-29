const { Router } = require('express');
const billingController = require('./billing.controller');
const { authenticate, authorize, tenantGuard } = require('../../middleware/auth');

const router = Router();

// Company routes
router.get(
  '/profile',
  authenticate,
  authorize('COMPANY_ADMIN'),
  tenantGuard,
  billingController.getMyBillingProfile
);

router.put(
  '/profile',
  authenticate,
  authorize('COMPANY_ADMIN'),
  tenantGuard,
  billingController.upsertMyBillingProfile
);

// Super-admin routes
router.get(
  '/:companyId/profile',
  authenticate,
  authorize('SUPER_ADMIN'),
  billingController.getBillingProfileByCompany
);

module.exports = router;
