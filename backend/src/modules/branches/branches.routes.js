const { Router } = require('express');
const controller = require('./branches.controller');
const { authenticate, authorize, tenantGuard } = require('../../middleware/auth');
const billingGuard = require('../../middleware/billingGuard');
const dashboardLockGuard = require('../../middleware/dashboardLockGuard');

const router = Router();

// Read operations allowed for most subscription states
router.get('/', authenticate, authorize('COMPANY_ADMIN', 'COMPANY_STAFF'), tenantGuard, dashboardLockGuard, billingGuard('read'), controller.getBranches);
router.get('/:id', authenticate, authorize('COMPANY_ADMIN', 'COMPANY_STAFF'), tenantGuard, dashboardLockGuard, billingGuard('read'), controller.getBranch);
router.get('/:branchId/complaint-points', authenticate, authorize('COMPANY_ADMIN', 'COMPANY_STAFF'), tenantGuard, dashboardLockGuard, billingGuard('read'), controller.getComplaintPoints);

// Write operations require active subscription
router.post('/', authenticate, authorize('COMPANY_ADMIN', 'COMPANY_STAFF'), tenantGuard, dashboardLockGuard, billingGuard('write'), controller.createBranch);
router.put('/:id', authenticate, authorize('COMPANY_ADMIN', 'COMPANY_STAFF'), tenantGuard, dashboardLockGuard, billingGuard('write'), controller.updateBranch);
router.post('/:branchId/complaint-points', authenticate, authorize('COMPANY_ADMIN', 'COMPANY_STAFF'), tenantGuard, dashboardLockGuard, billingGuard('write'), controller.createComplaintPoint);

// Delete operations require active subscription
router.delete('/:id', authenticate, authorize('COMPANY_ADMIN', 'COMPANY_STAFF'), tenantGuard, dashboardLockGuard, billingGuard('delete'), controller.deleteBranch);
router.delete('/:branchId/complaint-points/:pointId', authenticate, authorize('COMPANY_ADMIN', 'COMPANY_STAFF'), tenantGuard, dashboardLockGuard, billingGuard('delete'), controller.deleteComplaintPoint);

module.exports = router;
