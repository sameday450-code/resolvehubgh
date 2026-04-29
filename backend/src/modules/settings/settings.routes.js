const { Router } = require('express');
const controller = require('./settings.controller');
const { authenticate, authorize, tenantGuard } = require('../../middleware/auth');
const billingGuard = require('../../middleware/billingGuard');

const router = Router();

// Read operations
router.get('/', authenticate, authorize('COMPANY_ADMIN'), tenantGuard, billingGuard('read'), controller.getSettings);
router.get('/categories', authenticate, authorize('COMPANY_ADMIN'), tenantGuard, billingGuard('read'), controller.getCategories);
router.get('/staff', authenticate, authorize('COMPANY_ADMIN'), tenantGuard, billingGuard('read'), controller.getStaff);

// Write operations
router.put('/profile', authenticate, authorize('COMPANY_ADMIN'), tenantGuard, billingGuard('write'), controller.updateProfile);
router.put('/preferences', authenticate, authorize('COMPANY_ADMIN'), tenantGuard, billingGuard('write'), controller.updateSettings);
router.post('/categories', authenticate, authorize('COMPANY_ADMIN'), tenantGuard, billingGuard('write'), controller.createCategory);
router.post('/staff', authenticate, authorize('COMPANY_ADMIN'), tenantGuard, billingGuard('write'), controller.addStaff);
router.patch('/staff/:id/status', authenticate, authorize('COMPANY_ADMIN'), tenantGuard, billingGuard('write'), controller.updateStaffStatus);

// Delete operations
router.delete('/categories/:id', authenticate, authorize('COMPANY_ADMIN'), tenantGuard, billingGuard('delete'), controller.deleteCategory);

module.exports = router;
