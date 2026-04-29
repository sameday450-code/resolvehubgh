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
  return subscription; // null is valid — company has no subscription yet
};

/**
 * Activate the starter trial for a company that has no active subscription.
 * Creates a CompanySubscription with status TRIALING.
 */
const activateTrial = async (companyId) => {
  const existing = await prisma.companySubscription.findUnique({ where: { companyId } });
  if (existing) {
    throw new ConflictError('Company already has a subscription record');
  }

  const plan = await getPlanByType('STARTER_TRIAL');
  if (!plan.isActive) throw new NotFoundError('Starter trial plan is not available');

  const now = new Date();
  const trialEndsAt = new Date(now);
  trialEndsAt.setDate(trialEndsAt.getDate() + plan.trialDays);

  const subscription = await prisma.companySubscription.create({
    data: {
      companyId,
      subscriptionPlanId: plan.id,
      status: 'TRIALING',
      trialStartedAt: now,
      trialEndsAt,
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
 * Super-admin: manually set a company subscription status/plan.
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

module.exports = {
  getPlans,
  getPlanByType,
  getMySubscription,
  activateTrial,
  listSubscriptions,
  updateSubscription,
};
