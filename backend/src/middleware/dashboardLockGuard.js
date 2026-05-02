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

    // Allowed paths when dashboard is locked
    const allowedPaths = [
      '/billing',
      '/subscriptions/company',
      '/subscription/company',
      '/support',
      '/contact-sales',
      '/profile',
      '/settings',
      '/users/profile',
      '/auth/logout',
      '/auth/profile',
    ];

    const isAllowedRoute = allowedPaths.some((allowedPath) => path.includes(allowedPath));

    if (isAllowedRoute) {
      // Attach lock status to request for use in handlers
      req.dashboardLocked = true;
      req.lockReason = isExpired ? 'TRIAL_EXPIRED' : 'SUBSCRIPTION_EXPIRED';
      return next();
    }

    // Block access with 403
    return res.status(403).json({
      success: false,
      error: 'DASHBOARD_LOCKED',
      message: isExpired
        ? 'Your trial has expired. Your dashboard is temporarily locked. Please go to Billing to activate your subscription.'
        : 'Your subscription has expired. Your dashboard is temporarily locked. Please go to Billing to renew.',
      lockReason: req.dashboardLocked ? 'TRIAL_EXPIRED' : 'SUBSCRIPTION_EXPIRED',
      allowedRoutes: [
        '/api/billing',
        '/api/subscriptions/company',
        '/api/support',
        '/api/profile',
      ],
    });
  } catch (err) {
    next(err);
  }
};

module.exports = dashboardLockGuard;
