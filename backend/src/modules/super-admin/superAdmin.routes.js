const { Router } = require('express');
const controller = require('./superAdmin.controller');
const { authenticate, authorize } = require('../../middleware/auth');

const router = Router();

router.use(authenticate, authorize('SUPER_ADMIN'));

router.get('/dashboard', controller.getDashboard);
router.get('/companies', controller.getCompanies);
router.get('/companies/:id', controller.getCompanyDetail);
router.post('/companies/:id/approve', controller.approveCompany);
router.post('/companies/:id/reject', controller.rejectCompany);
router.post('/companies/:id/suspend', controller.suspendCompany);
router.post('/companies/:id/reactivate', controller.reactivateCompany);
router.delete('/companies/:id', controller.deleteCompany);
router.get('/analytics', controller.getAnalytics);
router.get('/support-messages', controller.getSupportMessages);

module.exports = router;
