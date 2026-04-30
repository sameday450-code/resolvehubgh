const prisma = require('../../config/database');
const logger = require('../../config/logger');

/**
 * Middleware to check subscription status and lock expired/unpaid accounts.
 * Attached to protected routes that should be locked when trial expires.
 */
const checkSubscriptionStatus = async (req, res, next) => {
  try {
    if (!req.user.companyId) {
      return next(); // Not a company user, skip
    }

    const subscription = await prisma.companySubscription.findUnique({
      where: { companyId: req.user.companyId },
      include: { subscriptionPlan: true },
    });

    if (!subscription) {
      // No subscription yet (shouldn't happen for active companies)
      return next();
    }

    // Attach subscription to request for later use
    req.subscription = subscription;

    // Check if trial has expired
    if (subscription.status === 'TRIALING' && subscription.trialEndsAt) {
      const now = new Date();
      if (now > subscription.trialEndsAt) {
        // Trial expired - update status
        await prisma.companySubscription.update({
          where: { companyId: req.user.companyId },
          data: { status: 'EXPIRED' },
        });
        req.subscription.status = 'EXPIRED';
      }
    }

    // Calculate days remaining in trial for frontend
    if (subscription.status === 'TRIALING' && subscription.trialEndsAt) {
      const now = new Date();
      const daysRemaining = Math.ceil((subscription.trialEndsAt - now) / (1000 * 60 * 60 * 24));
      req.subscription.daysRemainingInTrial = Math.max(0, daysRemaining);
    }

    next();
  } catch (error) {
    logger.error({ error, companyId: req.user?.companyId }, 'Error in checkSubscriptionStatus middleware');
    next(); // Don't block on middleware error
  }
};

/**
 * Middleware to lock dashboard features for expired trials.
 * Returns 403 if account has expired and they're not accessing allowed endpoints.
 */
const subscriptionGuard = (allowedRoutes = []) => async (req, res, next) => {
  try {
    if (!req.user.companyId) {
      return next();
    }

    const subscription = await prisma.companySubscription.findUnique({
      where: { companyId: req.user.companyId },
    });

    if (!subscription) {
      return next();
    }

    // Check if subscription is locked (expired or pending payment)
    const isLocked = subscription.status === 'EXPIRED' || subscription.status === 'PENDING_PAYMENT';
    const isAllowedRoute = allowedRoutes.some((route) => {
      if (typeof route === 'string') {
        return req.path.startsWith(route);
      }
      return route.test(req.path);
    });

    if (isLocked && !isAllowedRoute) {
      return res.status(403).json({
        success: false,
        message: 'Your account access is restricted. Please contact ResolveHub support or upgrade your subscription.',
        code: 'SUBSCRIPTION_EXPIRED',
        allowedRoutes: ['/billing', '/company/settings', '/account/settings'],
      });
    }

    next();
  } catch (error) {
    logger.error({ error, companyId: req.user?.companyId }, 'Error in subscriptionGuard middleware');
    next();
  }
};

module.exports = {
  checkSubscriptionStatus,
  subscriptionGuard,
};
