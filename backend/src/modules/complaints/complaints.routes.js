const { Router } = require('express');
const controller = require('./complaints.controller');
const { authenticate, authorize, tenantGuard } = require('../../middleware/auth');
const billingGuard = require('../../middleware/billingGuard');
const dashboardLockGuard = require('../../middleware/dashboardLockGuard');
const upload = require('../../middleware/upload');

const router = Router();

// Public submission - no auth required, no billing check
router.post('/public/submit', controller.submitComplaint);

// Read operations
router.get('/dashboard-stats', authenticate, authorize('COMPANY_ADMIN', 'COMPANY_STAFF'), tenantGuard, dashboardLockGuard, billingGuard('read'), controller.getDashboardStats);
router.get('/', authenticate, authorize('COMPANY_ADMIN', 'COMPANY_STAFF'), tenantGuard, dashboardLockGuard, billingGuard('read'), controller.getComplaints);
router.get('/:id', authenticate, authorize('COMPANY_ADMIN', 'COMPANY_STAFF'), tenantGuard, dashboardLockGuard, billingGuard('read'), controller.getComplaint);

// Write operations
router.patch('/:id/status', authenticate, authorize('COMPANY_ADMIN', 'COMPANY_STAFF'), tenantGuard, dashboardLockGuard, billingGuard('write'), controller.updateStatus);
router.patch('/:id/assign', authenticate, authorize('COMPANY_ADMIN', 'COMPANY_STAFF'), tenantGuard, dashboardLockGuard, billingGuard('write'), controller.assignComplaint);
router.patch('/:id/priority', authenticate, authorize('COMPANY_ADMIN', 'COMPANY_STAFF'), tenantGuard, dashboardLockGuard, billingGuard('write'), controller.updatePriority);
router.post('/:id/notes', authenticate, authorize('COMPANY_ADMIN', 'COMPANY_STAFF'), tenantGuard, dashboardLockGuard, billingGuard('write'), controller.addNote);

module.exports = router;
