/**
 * Super Admin Subscription Management Service
 * 
 * This service handles Super Admin operations for subscription management.
 * Used to activate companies and manage trial/payment statuses.
 */

const prisma = require('../../config/database');
const logger = require('../../config/logger');
const { NotFoundError } = require('../../utils/errors');

/**
 * Get list of companies needing activation/review
 */
const getPendingActivations = async ({ page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;

  const [total, companies] = await Promise.all([
    prisma.companySubscription.count({
      where: {
        status: {
          in: ['PENDING_ACTIVATION', 'TRIALING', 'EXPIRED'],
        },
      },
    }),
    prisma.companySubscription.findMany({
      where: {
        status: {
          in: ['PENDING_ACTIVATION', 'TRIALING', 'EXPIRED'],
        },
      },
      skip,
      take: limit,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            email: true,
            slug: true,
            status: true,
            createdAt: true,
          },
        },
        subscriptionPlan: {
          select: {
            name: true,
            planType: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  // Enrich with trial info
  const enriched = companies.map((sub) => ({
    ...sub,
    daysRemainingInTrial: sub.trialEndsAt
      ? Math.ceil((sub.trialEndsAt - new Date()) / (1000 * 60 * 60 * 24))
      : null,
  }));

  return {
    data: enriched,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get subscription details for a company (for admin review)
 */
const getCompanySubscriptionDetails = async (companyId) => {
  const subscription = await prisma.companySubscription.findUnique({
    where: { companyId },
    include: {
      company: true,
      subscriptionPlan: true,
      paymentTransactions: {
        take: 10,
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!subscription) {
    throw new NotFoundError('Subscription not found for this company');
  }

  // Enrich with computed fields
  return {
    ...subscription,
    daysRemainingInTrial: subscription.trialEndsAt
      ? Math.ceil((subscription.trialEndsAt - new Date()) / (1000 * 60 * 60 * 24))
      : null,
    trialProgress: subscription.trialStartedAt && subscription.trialEndsAt
      ? Math.round(
          ((new Date() - subscription.trialStartedAt) /
            (subscription.trialEndsAt - subscription.trialStartedAt)) *
            100
        )
      : 0,
  };
};

/**
 * Super-admin: Approve and activate a company subscription
 */
const approveAndActivateSubscription = async (companyId, adminId, notes = '') => {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: { subscription: true },
  });

  if (!company) {
    throw new NotFoundError('Company not found');
  }

  if (!company.subscription) {
    throw new NotFoundError('No subscription found for this company');
  }

  const now = new Date();
  const subscriptionEndDate = new Date(now);
  subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);

  const updated = await prisma.companySubscription.update({
    where: { companyId },
    data: {
      status: 'ACTIVE',
      paymentStatus: 'MANUAL_APPROVED',
      paymentProvider: 'MANUAL',
      subscriptionStartDate: now,
      subscriptionEndDate,
      nextBillingDate: subscriptionEndDate,
      activatedAt: now,
      metadata: {
        ...company.subscription.metadata,
        manuallyActivatedAt: now.toISOString(),
        manuallyActivatedBy: adminId,
        adminNotes: notes,
      },
    },
    include: {
      company: true,
      subscriptionPlan: true,
    },
  });

  // Log approval action
  await prisma.approvalActionLog.create({
    data: {
      companyId,
      action: 'SUBSCRIPTION_ACTIVATED',
      adminId,
      reason: notes || 'Manual subscription activation',
    },
  });

  logger.info(
    {
      companyId,
      companyName: company.name,
      adminId,
      notes,
    },
    'Super-admin manually activated company subscription'
  );

  return updated;
};

/**
 * Super-admin: Deny and mark subscription as expired (for companies that don't meet requirements)
 */
const denyAndExpireSubscription = async (companyId, adminId, reason = '') => {
  const subscription = await prisma.companySubscription.findUnique({
    where: { companyId },
  });

  if (!subscription) {
    throw new NotFoundError('Subscription not found for this company');
  }

  const updated = await prisma.companySubscription.update({
    where: { companyId },
    data: {
      status: 'EXPIRED',
      paymentStatus: 'UNPAID',
      cancelledAt: new Date(),
      metadata: {
        ...subscription.metadata,
        deniedAt: new Date().toISOString(),
        deniedBy: adminId,
        denialReason: reason,
      },
    },
  });

  // Log denial action
  await prisma.approvalActionLog.create({
    data: {
      companyId,
      action: 'SUBSCRIPTION_DENIED',
      adminId,
      reason: reason || 'Manual subscription denial',
    },
  });

  logger.warn(
    {
      companyId,
      adminId,
      reason,
    },
    'Super-admin denied company subscription'
  );

  return updated;
};

/**
 * Super-admin: Extend trial for a company (if they need more time)
 */
const extendTrial = async (companyId, adminId, additionalDays = 7, reason = '') => {
  const subscription = await prisma.companySubscription.findUnique({
    where: { companyId },
  });

  if (!subscription) {
    throw new NotFoundError('Subscription not found for this company');
  }

  const newTrialEndDate = subscription.trialEndsAt
    ? new Date(subscription.trialEndsAt)
    : new Date();

  newTrialEndDate.setDate(newTrialEndDate.getDate() + additionalDays);

  const updated = await prisma.companySubscription.update({
    where: { companyId },
    data: {
      trialEndsAt: newTrialEndDate,
      metadata: {
        ...subscription.metadata,
        trialExtendedAt: new Date().toISOString(),
        trialExtendedBy: adminId,
        trialExtensionDays: additionalDays,
        trialExtensionReason: reason,
      },
    },
  });

  logger.info(
    {
      companyId,
      adminId,
      additionalDays,
      reason,
    },
    'Super-admin extended company trial'
  );

  return updated;
};

/**
 * Get subscription analytics (for super-admin dashboard)
 */
const getSubscriptionAnalytics = async () => {
  const [
    totalCompanies,
    activeTrials,
    activeSubscriptions,
    expiredSubscriptions,
    pendingActivation,
  ] = await Promise.all([
    prisma.companySubscription.count(),
    prisma.companySubscription.count({
      where: { status: 'TRIALING' },
    }),
    prisma.companySubscription.count({
      where: { status: 'ACTIVE' },
    }),
    prisma.companySubscription.count({
      where: { status: 'EXPIRED' },
    }),
    prisma.companySubscription.count({
      where: { status: 'PENDING_ACTIVATION' },
    }),
  ]);

  // Get companies expiring soon (within 3 days)
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

  const expiringTrials = await prisma.companySubscription.count({
    where: {
      status: 'TRIALING',
      trialEndsAt: {
        lte: threeDaysFromNow,
      },
    },
  });

  return {
    totalCompanies,
    activeTrials,
    activeSubscriptions,
    expiredSubscriptions,
    pendingActivation,
    expiringTrials,
    conversionRate: totalCompanies > 0 ? (activeSubscriptions / totalCompanies) * 100 : 0,
  };
};

module.exports = {
  getPendingActivations,
  getCompanySubscriptionDetails,
  approveAndActivateSubscription,
  denyAndExpireSubscription,
  extendTrial,
  getSubscriptionAnalytics,
};
