const { Router } = require('express');
const controller = require('./analytics.controller');
const { authenticate, authorize, tenantGuard } = require('../../middleware/auth');
const billingGuard = require('../../middleware/billingGuard');

const router = Router();
router.use(authenticate, authorize('COMPANY_ADMIN'), tenantGuard, billingGuard);
router.get('/', controller.getCompanyAnalytics);

module.exports = router;
