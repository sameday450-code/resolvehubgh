const { Router } = require('express');
const controller = require('./superAdmin.controller');
const contactController = require('../contact/contact.controller');
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

// Contact message management
router.get('/contact-messages/stats', contactController.getStats);
router.get('/contact-messages', contactController.listMessages);
router.get('/contact-messages/:id', contactController.getMessageById);
router.patch('/contact-messages/:id/status', contactController.updateStatus);
router.post('/contact-messages/:id/reply', contactController.replyToMessage);

// Branch upgrade payments
router.get('/branch-payments', controller.listBranchPayments);
router.post('/branch-payments/:id/approve', controller.approveBranchPayment);
router.post('/branch-payments/:id/reject', controller.rejectBranchPayment);

module.exports = router;
