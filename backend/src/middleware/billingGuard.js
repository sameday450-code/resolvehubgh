const prisma = require('../config/database');
const { isTrialExpired, getPermissionDetails, isActionAllowed, getBlockReason } = require('../utils/billingPermissions');

/**
 * Billing enforcement middleware.
 * Must be used AFTER authenticate + authorize + tenantGuard.
 *
 * Returns HTTP 402 with detailed billing information when subscription doesn't permit the action.
 * Supports action-based checks (read, write, delete) for granular control.
 *
 * Usage:
 *   router.get('/', authenticate, authorize(...), tenantGuard, billingGuard, handler);
 *   router.post('/', authenticate, authorize(...), tenantGuard, billingGuard('write'), handler);
 *   router.delete('/', authenticate, authorize(...), tenantGuard, billingGuard('delete'), handler);
 *
 * Allowed states:  TRIALING (while not expired), ACTIVE
 * Blocked states:  TRIAL_EXPIRED, EXPIRED, CANCELLED, PAST_DUE, PENDING_PAYMENT, PENDING_ACTIVATION, NO_SUBSCRIPTION
 */
const billingGuard = (action = 'read') => {
  return async (req, res, next) => {
    try {
      // Super-admins are never subject to billing restrictions
      if (req.user?.role === 'SUPER_ADMIN') return next();

      const companyId = req.user?.companyId;
      if (!companyId) {
        return res.status(402).json({
          success: false,
          billingRequired: true,
          reason: 'NO_COMPANY',
          message: 'No company is associated with your account.',
          action,
        });
      }

      const subscription = await prisma.companySubscription.findUnique({
        where: { companyId },
        select: { status: true, trialEndsAt: true, currentPeriodEnd: true },
      });

      if (!subscription) {
        return res.status(402).json({
          success: false,
          billingRequired: true,
          reason: 'NO_SUBSCRIPTION',
          message: 'No active subscription found. Please upgrade your plan to continue.',
          action,
        });
      }

      // Check if trial has expired
      if (isTrialExpired(subscription.status, subscription.trialEndsAt)) {
        return res.status(402).json({
          success: false,
          billingRequired: true,
          reason: 'TRIAL_EXPIRED',
          message: 'Your free trial has expired. Please upgrade to continue.',
          action,
        });
      }

      // Get permission details for the effective status
      const effectiveStatus = subscription.status;
      const allowed = isActionAllowed(effectiveStatus, action);

      if (!allowed) {
        const details = getPermissionDetails(effectiveStatus);
        return res.status(402).json({
          success: false,
          billingRequired: true,
          reason: getBlockReason(subscription),
          message: details.message,
          actionBlocked: details.actionBlocked,
          action,
          status: effectiveStatus,
        });
      }

      // Action is allowed, attach permission context for downstream handlers
      req.billing = {
        status: effectiveStatus,
        action,
        allowed: true,
      };

      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = billingGuard;
