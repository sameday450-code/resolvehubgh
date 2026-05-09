const prisma = require('../config/database');
const { ForbiddenError } = require('../utils/errors');

/**
 * Dashboard lock guard middleware.
 * Prevents access to most dashboard features when subscription is locked or expired.
 * 
 * When dashboard is locked, only these routes are allowed:
 * - /billing
 * - /subscription/company/*
 * - /support/contact
 * - /profile
 * - Auth logout
 *
 * Usage:
 *   router.use(authenticate, authorize('COMPANY_ADMIN'), tenantGuard, dashboardLockGuard);
 */
const dashboardLockGuard = async (req, res, next) => {
  try {
    // Super-admins are never restricted
    if (req.user?.role === 'SUPER_ADMIN') return next();

    const companyId = req.user?.companyId;
    if (!companyId) return next();

    // Get company and check subscription status
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        isDashboardLocked: true,
        paymentStatus: true,
        trialEndDate: true,
      },
    });

    if (!company) return next();

    // Check if trial has expired
    let isExpired = false;
    if (
      company.trialEndDate &&
      new Date(company.trialEndDate) < new Date() &&
      company.paymentStatus !== 'MANUAL_APPROVED'
    ) {
      isExpired = true;
      // Auto-lock dashboard if trial expired
      await prisma.company.update({
        where: { id: companyId },
        data: { isDashboardLocked: true },
      });
      company.isDashboardLocked = true;
    }

    // If dashboard is not locked or subscription is not expired, allow access
    if (!company.isDashboardLocked && !isExpired) {
      return next();
    }

    // Dashboard is locked - check if this route is allowed
    const path = req.path.toLowerCase();

    // Allowed paths when dashboard is locked (include /api prefix)
    const allowedPaths = [
      '/api/billing',
      '/api/subscriptions/company',
      '/api/subscription/company',
      '/api/support',
      '/api/contact-sales',
      '/api/profile',
      '/api/settings',
      '/api/users/profile',
      '/api/auth/logout',
      '/api/auth/profile',
    ];

    const isAllowedRoute = allowedPaths.some((allowedPath) => path.startsWith(allowedPath));

    if (isAllowedRoute) {
      // Attach lock status to request for use in handlers
      req.dashboardLocked = true;
      req.lockReason = isExpired ? 'TRIAL_EXPIRED' : 'SUBSCRIPTION_EXPIRED';
      return next();
    }

    // Block access with 403
    return res.status(403).json({
      success: false,
      code: 'SUBSCRIPTION_LOCKED',
      message:
        'Subscription payment required to access dashboard. Please complete your payment and submit proof for admin review.',
      lockReason: isExpired ? 'TRIAL_EXPIRED' : 'SUBSCRIPTION_LOCKED',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = dashboardLockGuard;
