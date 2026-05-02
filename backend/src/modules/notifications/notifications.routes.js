const { Router } = require('express');
const controller = require('./notifications.controller');
const { authenticate } = require('../../middleware/auth');
const billingGuard = require('../../middleware/billingGuard');
const dashboardLockGuard = require('../../middleware/dashboardLockGuard');

const router = Router();

// All notification operations require authentication and billing check
// Notifications are read-only by default, but we enforce billing for access consistency
router.use(authenticate, dashboardLockGuard, billingGuard('read'));

router.get('/', controller.getNotifications);
router.get('/unread-count', controller.getUnreadCount);
router.patch('/:id/read', controller.markAsRead);
router.patch('/read-all', controller.markAllAsRead);

module.exports = router;
