const { Router } = require('express');
const controller = require('./qrcodes.controller');
const { authenticate, authorize, tenantGuard } = require('../../middleware/auth');
const billingGuard = require('../../middleware/billingGuard');
const dashboardLockGuard = require('../../middleware/dashboardLockGuard');

const router = Router();

// Public routes (no auth)
router.get('/resolve/:publicSlug', controller.resolveQR);
router.get('/svg/:publicSlug', controller.getQRSVG);

// Read operations
router.get('/', authenticate, authorize('COMPANY_ADMIN', 'COMPANY_STAFF'), tenantGuard, dashboardLockGuard, billingGuard('read'), controller.getQRCodes);
router.get('/:id', authenticate, authorize('COMPANY_ADMIN', 'COMPANY_STAFF'), tenantGuard, dashboardLockGuard, billingGuard('read'), controller.getQRCode);

// Write operations
router.post('/', authenticate, authorize('COMPANY_ADMIN', 'COMPANY_STAFF'), tenantGuard, dashboardLockGuard, billingGuard('write'), controller.generateQRCode);
router.post('/:id/disable', authenticate, authorize('COMPANY_ADMIN', 'COMPANY_STAFF'), tenantGuard, dashboardLockGuard, billingGuard('write'), controller.disableQRCode);
router.post('/:id/enable', authenticate, authorize('COMPANY_ADMIN', 'COMPANY_STAFF'), tenantGuard, dashboardLockGuard, billingGuard('write'), controller.enableQRCode);
router.post('/:id/regenerate', authenticate, authorize('COMPANY_ADMIN', 'COMPANY_STAFF'), tenantGuard, dashboardLockGuard, billingGuard('write'), controller.regenerateQRCode);

// Delete operations
router.delete('/:id', authenticate, authorize('COMPANY_ADMIN', 'COMPANY_STAFF'), tenantGuard, dashboardLockGuard, billingGuard('delete'), controller.deleteQRCode);

module.exports = router;
