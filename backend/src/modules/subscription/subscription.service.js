const prisma = require('../../config/database');
const { NotFoundError, ConflictError } = require('../../utils/errors');
const logger = require('../../config/logger');
const { sendTrialStartedEmail } = require('../../utils/emailService');

/**
 * Return all active subscription plans visible to public/company.
 */
const getPlans = async () => {
  return prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    orderBy: { price: 'asc' },
  });
};

/**
 * Return the plan matching the given planType.
 */
const getPlanByType = async (planType) => {
  const plan = await prisma.subscriptionPlan.findUnique({ where: { planType } });
  if (!plan) throw new NotFoundError(`Plan type '${planType}' not found`);
  return plan;
};

/**
 * Return the active subscription for a company (including plan details).
 */
const getMySubscription = async (companyId) => {
  const subscription = await prisma.companySubscription.findUnique({
    where: { companyId },
    include: { subscriptionPlan: true },
  });

  if (subscription && subscription.status === 'TRIALING' && subscription.trialEndsAt) {
    // Calculate days remaining
    const now = new Date();
    const daysRemaining = Math.ceil((subscription.trialEndsAt - now) / (1000 * 60 * 60 * 24));
    subscription.daysRemainingInTrial = Math.max(0, daysRemaining);
  }

  return subscription; // null is valid — company has no subscription yet
};

/**
 * Activate the starter trial for a company that has no active subscription.
 * Creates a CompanySubscription with status TRIALING.
 */
const activateTrial = async (companyId, trialDays = 14) => {
  const existing = await prisma.companySubscription.findUnique({ where: { companyId } });
  if (existing) {
    throw new ConflictError('Company already has a subscription record');
  }

  const plan = await getPlanByType('STARTER_TRIAL');
  if (!plan.isActive) throw new NotFoundError('Starter trial plan is not available');

  const now = new Date();
  const trialEndsAt = new Date(now);
  trialEndsAt.setDate(trialEndsAt.getDate() + trialDays);

  const subscription = await prisma.companySubscription.create({
    data: {
      companyId,
      subscriptionPlanId: plan.id,
      status: 'TRIALING',
      trialStartedAt: now,
      trialEndsAt,
      activatedAt: now,
      paymentStatus: 'UNPAID',
      paymentProvider: 'MANUAL',
    },
    include: { subscriptionPlan: true, company: true },
  });

  // Send trial started email (non-blocking)
  try {
    await sendTrialStartedEmail(subscription.company, subscription);
  } catch (err) {
    // Log error but don't fail the subscription creation
    logger.warn({ err, companyId }, 'Failed to send trial started email');
  }

  return subscription;
};

/**
 * Super-admin: list all company subscriptions with pagination.
 */
const listSubscriptions = async ({ page = 1, limit = 20, status } = {}) => {
  const skip = (page - 1) * limit;
  const where = status ? { status } : {};

  const [total, items] = await Promise.all([
    prisma.companySubscription.count({ where }),
    prisma.companySubscription.findMany({
      where,
      skip,
      take: limit,
      include: {
        subscriptionPlan: true,
        company: { select: { id: true, name: true, email: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return {
    data: items,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  };
};

/**
 * Super-admin: manually activate a company subscription.
 * Sets status to ACTIVE, payment status to PAID/MANUAL_APPROVED, and optionally sets subscription dates.
 */
const manuallyActivate = async (companyId, data = {}) => {
  const subscription = await prisma.companySubscription.findUnique({ where: { companyId } });
  if (!subscription) throw new NotFoundError('No subscription found for this company');

  const now = new Date();
  const subscriptionStartDate = data.subscriptionStartDate || now;
  
  // Calculate end date (30 days from start for monthly)
  let subscriptionEndDate = data.subscriptionEndDate || new Date(subscriptionStartDate);
  subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);

  const nextBillingDate = data.nextBillingDate || subscriptionEndDate;

  const updated = await prisma.companySubscription.update({
    where: { companyId },
    data: {
      status: 'ACTIVE',
      paymentStatus: data.paymentStatus || 'MANUAL_APPROVED',
      paymentProvider: 'MANUAL',
      subscriptionStartDate,
      subscriptionEndDate,
      nextBillingDate,
      activatedAt: now,
      metadata: {
        ...subscription.metadata,
        manuallyActivatedAt: now.toISOString(),
        manuallyActivatedBy: data.activatedBy || 'SUPER_ADMIN',
      },
    },
    include: { subscriptionPlan: true, company: true },
  });

  logger.info(
    { companyId, updatedBy: data.activatedBy },
    'Company subscription manually activated by super-admin'
  );

  return updated;
};

/**
 * Super-admin: update subscription (generic update).
 */
const updateSubscription = async (companyId, updates) => {
  const subscription = await prisma.companySubscription.findUnique({ where: { companyId } });
  if (!subscription) throw new NotFoundError('No subscription found for this company');

  return prisma.companySubscription.update({
    where: { companyId },
    data: updates,
    include: { subscriptionPlan: true },
  });
};

/**
 * Get subscription status for dashboard (includes trial countdown info).
 */
const getSubscriptionStatus = async (companyId) => {
  const subscription = await prisma.companySubscription.findUnique({
    where: { companyId },
    include: { subscriptionPlan: true },
  });

  if (!subscription) {
    return null;
  }

  const result = { ...subscription };

  // Enrich with trial info
  if (subscription.status === 'TRIALING' && subscription.trialEndsAt) {
    const now = new Date();
    const daysRemaining = Math.ceil((subscription.trialEndsAt - now) / (1000 * 60 * 60 * 24));
    result.daysRemainingInTrial = Math.max(0, daysRemaining);
    result.isTrialAboutToExpire = daysRemaining <= 3;
    result.isTrialExpired = daysRemaining <= 0;
  }

  // Enrich with active subscription info
  if (subscription.status === 'ACTIVE' && subscription.subscriptionEndDate) {
    const now = new Date();
    result.daysUntilRenewal = Math.ceil((subscription.subscriptionEndDate - now) / (1000 * 60 * 60 * 24));
    result.isRenewalDue = result.daysUntilRenewal <= 7;
  }

  return result;
};

module.exports = {
  getPlans,
  getPlanByType,
  getMySubscription,
  activateTrial,
  listSubscriptions,
  updateSubscription,
  manuallyActivate,
  getSubscriptionStatus,
};
