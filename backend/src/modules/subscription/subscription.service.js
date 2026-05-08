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

// ============================================
// MANUAL ACTIVATION REQUEST SYSTEM
// ============================================

/**
 * Company: Get subscription info including trial and payment status
 */
const getCompanySubscriptionInfo = async (companyId) => {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      id: true,
      plan: true,
      trialStartDate: true,
      trialEndDate: true,
      paymentStatus: true,
      paymentProvider: true,
      isDashboardLocked: true,
      branchLimit: true,
    },
  });

  if (!company) {
    throw new NotFoundError('Company not found');
  }

  // Check if trial has expired
  if (
    company.trialEndDate &&
    new Date(company.trialEndDate) < new Date() &&
    company.paymentStatus !== 'MANUAL_APPROVED'
  ) {
    // Auto-lock dashboard if trial expired and not activated
    await prisma.company.update({
      where: { id: companyId },
      data: { isDashboardLocked: true },
    });

    company.isDashboardLocked = true;
  }

  // Calculate days remaining in trial
  let daysRemaining = null;
  if (company.trialStartDate && company.trialEndDate) {
    const now = new Date();
    const trialEnd = new Date(company.trialEndDate);
    if (trialEnd > now) {
      daysRemaining = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));
    } else {
      daysRemaining = 0;
    }
  }

  return {
    ...company,
    daysRemaining,
    isTrialActive: company.trialEndDate && new Date(company.trialEndDate) > new Date(),
    isTrialExpired: company.trialEndDate && new Date(company.trialEndDate) <= new Date(),
  };
};

/**
 * Company: Submit activation request with manual payment proof
 */
const requestActivation = async (companyId, data) => {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true, paymentStatus: true },
  });

  if (!company) {
    throw new NotFoundError('Company not found');
  }

  // Check if there's already a pending request
  const existingPending = await prisma.activationRequest.findFirst({
    where: { companyId, status: 'PENDING' },
  });

  if (existingPending) {
    throw new ConflictError(
      'You already have a pending activation request. Please wait for approval.'
    );
  }

  // Create activation request
  const request = await prisma.activationRequest.create({
    data: {
      companyId,
      selectedPlan: data.selectedPlan || 'STARTER',
      amountPaid: parseFloat(data.amountPaid),
      paymentMethod: data.paymentMethod, // MOBILE_MONEY or BANK_TRANSFER
      paymentReference: data.paymentReference,
      paymentDate: new Date(data.paymentDate),
      proofOfPaymentUrl: data.proofOfPaymentUrl || null,
      note: data.note || null,
    },
  });

  // Update company payment status to PENDING
  await prisma.company.update({
    where: { id: companyId },
    data: {
      paymentStatus: 'PENDING',
    },
  });

  // Log action
  await prisma.activityLog.create({
    data: {
      companyId,
      action: 'ACTIVATION_REQUEST_SUBMITTED',
      entity: 'ActivationRequest',
      entityId: request.id,
      metadata: {
        plan: data.selectedPlan,
        paymentMethod: data.paymentMethod,
      },
    },
  });

  return request;
};

/**
 * Company: Get activation requests
 */
const getCompanyActivationRequests = async (companyId, status = null) => {
  const where = { companyId };
  if (status) where.status = status;

  return prisma.activationRequest.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Super Admin: Get company subscription details
 */
const getCompanySubscriptionAdminView = async (companyId) => {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      id: true,
      name: true,
      plan: true,
      planName: true,
      trialStartDate: true,
      trialEndDate: true,
      paymentStatus: true,
      paymentProvider: true,
      isDashboardLocked: true,
      isLocked: true,
      isActive: true,
      branchLimit: true,
      subscriptionStartDate: true,
      subscriptionEndDate: true,
      subscriptionStatus: true,
      paymentMethod: true,
      paymentReference: true,
      activatedAt: true,
      activatedBy: true,
      status: true,
    },
  });

  if (!company) {
    throw new NotFoundError('Company not found');
  }

  // Get latest activation request
  const latestRequest = await prisma.activationRequest.findFirst({
    where: { companyId },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate days remaining in trial
  let daysRemaining = null;
  if (company.trialStartDate && company.trialEndDate) {
    const now = new Date();
    const trialEnd = new Date(company.trialEndDate);
    if (trialEnd > now) {
      daysRemaining = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));
    } else {
      daysRemaining = 0;
    }
  }

  return {
    ...company,
    daysRemaining,
    isTrialActive: company.trialEndDate && new Date(company.trialEndDate) > new Date(),
    isTrialExpired: company.trialEndDate && new Date(company.trialEndDate) <= new Date(),
    latestActivationRequest: latestRequest,
  };
};

/**
 * Super Admin: Manually activate company subscription
 * 
 * Updates both Company and CompanySubscription records in a transaction.
 * Ensures all required fields are updated for full activation.
 */
const activateCompanySubscription = async (companyId, data, adminId) => {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: { subscription: true },
  });

  if (!company) {
    throw new NotFoundError('Company not found');
  }

  // Validate required data
  if (!data.plan) {
    throw new Error('Plan is required for subscription activation');
  }

  // Parse subscription duration
  const durationMap = {
    '30_days': 30,
    '90_days': 90,
    '1_year': 365,
  };
  const durationDays = durationMap[data.subscriptionDuration] || 30;
  
  const now = new Date();
  const subscriptionEndDate = new Date(now);
  subscriptionEndDate.setDate(subscriptionEndDate.getDate() + durationDays);

  // Plan configuration
  const planConfig = {
    STARTER: { branchLimit: 2, name: 'Starter Plan' },
    ENTERPRISE: { branchLimit: 5, name: 'Enterprise Plan' },
    CUSTOM: { branchLimit: 10, name: 'Custom Plan' },
  };

  const selectedPlanConfig = planConfig[data.plan] || planConfig.STARTER;

  // Update both company and subscription in one transaction
  const updated = await prisma.$transaction(async (tx) => {
    // Update Company record with all required activation fields
    const updatedCompany = await tx.company.update({
      where: { id: companyId },
      data: {
        // Approval/Active status
        status: 'APPROVED',
        isActive: true,
        approvedAt: company.approvedAt || now,
        
        // Unlock dashboard
        isDashboardLocked: false,
        isLocked: false,
        lockReason: null,
        
        // Plan information
        plan: data.plan,
        planName: selectedPlanConfig.name,
        branchLimit: selectedPlanConfig.branchLimit,
        
        // Payment information
        paymentStatus: 'MANUAL_APPROVED',
        paymentProvider: 'MANUAL',
        paymentMethod: data.paymentMethod || 'MANUAL',
        paymentReference: data.paymentReference || 'MANUAL_ADMIN_ACTIVATION',
        
        // Subscription dates
        subscriptionStartDate: now,
        subscriptionEndDate,
        subscriptionStatus: 'ACTIVE',
        
        // Activation tracking
        activatedAt: now,
        activatedBy: adminId,
      },
    });

    // Update or create CompanySubscription record
    if (company.subscription) {
      // Update existing subscription
      await tx.companySubscription.update({
        where: { id: company.subscription.id },
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
            paymentMethod: data.paymentMethod || 'MANUAL',
            paymentReference: data.paymentReference || 'MANUAL_ADMIN_ACTIVATION',
          },
        },
      });
    }

    // If there's a pending activation request, approve it
    const pendingRequest = await tx.activationRequest.findFirst({
      where: { companyId, status: 'PENDING' },
    });

    if (pendingRequest) {
      await tx.activationRequest.update({
        where: { id: pendingRequest.id },
        data: {
          status: 'APPROVED',
          reviewedBy: adminId,
          reviewedAt: now,
        },
      });
    }

    // Log the action
    await tx.activityLog.create({
      data: {
        userId: adminId,
        companyId,
        action: 'SUBSCRIPTION_ACTIVATED',
        entity: 'Company',
        entityId: companyId,
        metadata: {
          plan: data.plan,
          planName: selectedPlanConfig.name,
          durationDays,
          branchLimit: selectedPlanConfig.branchLimit,
          paymentMethod: data.paymentMethod || 'MANUAL',
          paymentReference: data.paymentReference || 'MANUAL_ADMIN_ACTIVATION',
        },
      },
    });

    // Create notification for company admins
    const companyAdmins = await tx.user.findMany({
      where: { companyId, role: 'COMPANY_ADMIN' },
    });

    for (const admin of companyAdmins) {
      await tx.notification.create({
        data: {
          userId: admin.id,
          companyId,
          type: 'SYSTEM_ALERT',
          title: 'Subscription Activated',
          message: `Your subscription has been activated! You can now create up to ${selectedPlanConfig.branchLimit} branches and use all ResolveHub features.`,
        },
      });
    }

    return updatedCompany;
  });

  logger.info(
    {
      companyId,
      companyName: company.name,
      plan: data.plan,
      adminId,
      paymentReference: data.paymentReference,
    },
    'Super-admin manually activated company subscription'
  );

  return updated;
};

/**
 * Super Admin: Lock dashboard
 */
const lockCompanyDashboard = async (companyId, adminId, reason = 'Manual lock by super-admin') => {
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) throw new NotFoundError('Company not found');

  const now = new Date();
  
  const updated = await prisma.$transaction(async (tx) => {
    const updatedCompany = await tx.company.update({
      where: { id: companyId },
      data: {
        isDashboardLocked: true,
        isLocked: true,
        lockReason: reason,
      },
    });

    await tx.activityLog.create({
      data: {
        userId: adminId,
        companyId,
        action: 'DASHBOARD_LOCKED',
        entity: 'Company',
        entityId: companyId,
        metadata: { reason },
      },
    });

    // Notify company admins
    const companyAdmins = await tx.user.findMany({
      where: { companyId, role: 'COMPANY_ADMIN' },
    });

    for (const admin of companyAdmins) {
      await tx.notification.create({
        data: {
          userId: admin.id,
          companyId,
          type: 'SYSTEM_ALERT',
          title: 'Dashboard Locked',
          message: `Your dashboard has been locked. Reason: ${reason}. Please contact support if this is an error.`,
        },
      });
    }

    return updatedCompany;
  });

  logger.info(
    { companyId, companyName: company.name, reason, adminId },
    'Dashboard locked by super-admin'
  );

  return updated;
};

/**
 * Super Admin: Unlock dashboard
 */
const unlockCompanyDashboard = async (companyId, adminId) => {
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) throw new NotFoundError('Company not found');

  const updated = await prisma.$transaction(async (tx) => {
    const updatedCompany = await tx.company.update({
      where: { id: companyId },
      data: {
        isDashboardLocked: false,
        isLocked: false,
        lockReason: null,
      },
    });

    await tx.activityLog.create({
      data: {
        userId: adminId,
        companyId,
        action: 'DASHBOARD_UNLOCKED',
        entity: 'Company',
        entityId: companyId,
      },
    });

    // Notify company admins
    const companyAdmins = await tx.user.findMany({
      where: { companyId, role: 'COMPANY_ADMIN' },
    });

    for (const admin of companyAdmins) {
      await tx.notification.create({
        data: {
          userId: admin.id,
          companyId,
          type: 'SYSTEM_ALERT',
          title: 'Dashboard Unlocked',
          message: `Your dashboard has been unlocked. You can now access all features.`,
        },
      });
    }

    return updatedCompany;
  });

  logger.info(
    { companyId, companyName: company.name, adminId },
    'Dashboard unlocked by super-admin'
  );

  return updated;
};

/**
 * Super Admin: Extend trial
 * 
 * Extends the trial period and ensures company remains accessible.
 * Updates Company and CompanySubscription records.
 */
const extendCompanyTrial = async (companyId, days, adminId) => {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: { subscription: true },
  });

  if (!company) throw new NotFoundError('Company not found');

  // Calculate new trial end date
  let newTrialEndDate = company.trialEndDate ? new Date(company.trialEndDate) : new Date();
  newTrialEndDate.setDate(newTrialEndDate.getDate() + days);

  const now = new Date();
  
  // Set trial start date if not already set
  const trialStartDate = company.trialStartDate || now;

  const updated = await prisma.$transaction(async (tx) => {
    // Update Company record
    const updatedCompany = await tx.company.update({
      where: { id: companyId },
      data: {
        // Ensure company is active and accessible
        status: 'APPROVED',
        isActive: true,
        isDashboardLocked: false,
        isLocked: false,
        lockReason: null,
        
        // Trial dates
        trialStartDate,
        trialEndDate: newTrialEndDate,
        
        // Keep as trial subscription
        plan: 'STARTER',
        planName: 'Free Trial',
        subscriptionStatus: 'TRIAL',
        paymentStatus: 'UNPAID',
        branchLimit: 1,
        
        // Track extension
        approvedAt: company.approvedAt || now,
      },
    });

    // Update CompanySubscription if exists
    if (company.subscription) {
      await tx.companySubscription.update({
        where: { id: company.subscription.id },
        data: {
          status: 'TRIALING',
          trialStartedAt: trialStartDate,
          trialEndsAt: newTrialEndDate,
          metadata: {
            ...company.subscription.metadata,
            trialExtendedAt: now.toISOString(),
            trialExtendedBy: adminId,
            trialExtensionDays: days,
          },
        },
      });
    }

    // Log the action
    await tx.activityLog.create({
      data: {
        userId: adminId,
        companyId,
        action: 'TRIAL_EXTENDED',
        entity: 'Company',
        entityId: companyId,
        metadata: { 
          daysAdded: days,
          newTrialEndDate: newTrialEndDate.toISOString(),
        },
      },
    });

    // Notify company admins
    const companyAdmins = await tx.user.findMany({
      where: { companyId, role: 'COMPANY_ADMIN' },
    });

    for (const admin of companyAdmins) {
      await tx.notification.create({
        data: {
          userId: admin.id,
          companyId,
          type: 'SYSTEM_ALERT',
          title: 'Trial Extended',
          message: `Your trial has been extended by ${days} days. New trial end date: ${newTrialEndDate.toLocaleDateString()}`,
        },
      });
    }

    return updatedCompany;
  });

  logger.info(
    {
      companyId,
      companyName: company.name,
      daysAdded: days,
      newTrialEndDate,
      adminId,
    },
    'Super-admin extended company trial'
  );

  return updated;
};

/**
 * Super Admin: Get all activation requests
 */
const getAllActivationRequests = async (query) => {
  const { page = 1, limit = 20, status = null, companyId = null } = query;
  const skip = (page - 1) * limit;

  const where = {};
  if (status) where.status = status;
  if (companyId) where.companyId = companyId;

  const [requests, total] = await Promise.all([
    prisma.activationRequest.findMany({
      where,
      include: {
        company: { select: { id: true, name: true, email: true } },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.activationRequest.count({ where }),
  ]);

  return {
    requests,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Super Admin: Approve activation request
 */
const approveActivationRequest = async (requestId, adminId) => {
  const request = await prisma.activationRequest.findUnique({
    where: { id: requestId },
    include: { company: true },
  });

  if (!request) throw new NotFoundError('Activation request not found');
  if (request.status !== 'PENDING') {
    throw new ConflictError('Only pending requests can be approved');
  }

  const updated = await prisma.$transaction(async (tx) => {
    // Update activation request
    const updatedRequest = await tx.activationRequest.update({
      where: { id: requestId },
      data: {
        status: 'APPROVED',
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
    });

    // Activate subscription
    await tx.company.update({
      where: { id: request.companyId },
      data: {
        plan: request.selectedPlan,
        paymentStatus: 'MANUAL_APPROVED',
        paymentProvider: 'MANUAL',
        isDashboardLocked: false,
        branchLimit: request.selectedPlan === 'STARTER' ? 2 : request.selectedPlan === 'ENTERPRISE' ? 5 : 10,
      },
    });

    // Notify company
    const companyAdmins = await tx.user.findMany({
      where: { companyId: request.companyId, role: 'COMPANY_ADMIN' },
    });

    for (const admin of companyAdmins) {
      await tx.notification.create({
        data: {
          userId: admin.id,
          companyId: request.companyId,
          type: 'SYSTEM_ALERT',
          title: 'Payment Approved',
          message: `Your activation request has been approved! Your subscription is now active.`,
        },
      });
    }

    // Log action
    await tx.activityLog.create({
      data: {
        userId: adminId,
        companyId: request.companyId,
        action: 'ACTIVATION_REQUEST_APPROVED',
        entity: 'ActivationRequest',
        entityId: requestId,
        metadata: { companyName: request.company.name },
      },
    });

    return updatedRequest;
  });

  return updated;
};

/**
 * Super Admin: Reject activation request
 */
const rejectActivationRequest = async (requestId, adminId, reason) => {
  const request = await prisma.activationRequest.findUnique({
    where: { id: requestId },
    include: { company: true },
  });

  if (!request) throw new NotFoundError('Activation request not found');
  if (request.status !== 'PENDING') {
    throw new ConflictError('Only pending requests can be rejected');
  }

  const updated = await prisma.$transaction(async (tx) => {
    const updatedRequest = await tx.activationRequest.update({
      where: { id: requestId },
      data: {
        status: 'REJECTED',
        reviewedBy: adminId,
        reviewedAt: new Date(),
        rejectionReason: reason,
      },
    });

    // Update company payment status
    await tx.company.update({
      where: { id: request.companyId },
      data: { paymentStatus: 'FAILED' },
    });

    // Notify company
    const companyAdmins = await tx.user.findMany({
      where: { companyId: request.companyId, role: 'COMPANY_ADMIN' },
    });

    for (const admin of companyAdmins) {
      await tx.notification.create({
        data: {
          userId: admin.id,
          companyId: request.companyId,
          type: 'SYSTEM_ALERT',
          title: 'Activation Request Rejected',
          message: `Your activation request was rejected. Reason: ${reason}. Please contact support.`,
        },
      });
    }

    // Log action
    await tx.activityLog.create({
      data: {
        userId: adminId,
        companyId: request.companyId,
        action: 'ACTIVATION_REQUEST_REJECTED',
        entity: 'ActivationRequest',
        entityId: requestId,
        metadata: { rejectionReason: reason, companyName: request.company.name },
      },
    });

    return updatedRequest;
  });

  return updated;
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
  // Manual activation system
  getCompanySubscriptionInfo,
  requestActivation,
  getCompanyActivationRequests,
  getCompanySubscriptionAdminView,
  activateCompanySubscription,
  lockCompanyDashboard,
  unlockCompanyDashboard,
  extendCompanyTrial,
  getAllActivationRequests,
  approveActivationRequest,
  rejectActivationRequest,
};
