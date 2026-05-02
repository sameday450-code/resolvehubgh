const { Router } = require('express');
const controller = require('./analytics.controller');
const { authenticate, authorize, tenantGuard } = require('../../middleware/auth');
const billingGuard = require('../../middleware/billingGuard');
const dashboardLockGuard = require('../../middleware/dashboardLockGuard');

const router = Router();
router.use(authenticate, authorize('COMPANY_ADMIN'), tenantGuard, dashboardLockGuard, billingGuard);
router.get('/', controller.getCompanyAnalytics);

module.exports = router;
