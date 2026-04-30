const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const prisma = require('../../config/database');
const config = require('../../config');
const { generateSlug } = require('../../utils/helpers');
const { sendNewCompanyRegistrationAlert } = require('../../utils/emailService');
const {
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
} = require('../../utils/errors');

const generateTokens = (userId, role) => {
  const accessToken = jwt.sign({ userId, role }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
  const refreshToken = jwt.sign({ userId, role, type: 'refresh' }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
  return { accessToken, refreshToken };
};

const register = async (data) => {
  const existing = await prisma.company.findFirst({
    where: {
      OR: [{ email: data.email }],
    },
  });

  if (existing) {
    throw new ConflictError('A company with this email already exists');
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new ConflictError('An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(data.password, 12);
  let slug = generateSlug(data.companyName);

  // Ensure unique slug
  const slugExists = await prisma.company.findUnique({ where: { slug } });
  if (slugExists) {
    slug = `${slug}-${uuidv4().substring(0, 6)}`;
  }

  const result = await prisma.$transaction(
    async (tx) => {
      // Determine if this is a starter trial registration
      const isStarterTrial = !data.planType || data.planType === 'STARTER_TRIAL';
      const isEnterpriseMonthly = data.planType === 'ENTERPRISE_MONTHLY';

      // Look up the starter trial plan (needed inside transaction)
      let starterPlan = null;
      if (isStarterTrial) {
        starterPlan = await tx.subscriptionPlan.findUnique({
          where: { planType: 'STARTER_TRIAL' },
        });
      }

      // Look up the enterprise monthly plan
      let enterprisePlan = null;
      if (isEnterpriseMonthly) {
        enterprisePlan = await tx.subscriptionPlan.findUnique({
          where: { planType: 'ENTERPRISE_MONTHLY' },
        });
      }

      const company = await tx.company.create({
        data: {
          name: data.companyName,
          slug,
          email: data.email,
          phone: data.adminPhone,
          industry: data.industry,
          country: data.country,
          city: data.city,
          address: data.address,
          branchCount: data.branchCount,
          // All registrations require super-admin approval
          status: 'PENDING',
          approvedAt: null,
        },
      });

      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash,
          fullName: data.adminFullName,
          phone: data.adminPhone,
          role: 'COMPANY_ADMIN',
          companyId: company.id,
        },
      });

      // Create default company settings
      await tx.companySettings.create({
        data: { companyId: company.id },
      });

      // Copy default categories to company using batch insert
      const defaultCategories = await tx.complaintCategory.findMany({
        where: { isDefault: true, companyId: null },
      });

      if (defaultCategories.length > 0) {
        await tx.complaintCategory.createMany({
          data: defaultCategories.map((cat) => ({
            name: cat.name,
            slug: cat.slug,
            companyId: company.id,
            isDefault: false,
          })),
        });
      }

    // Create starter trial subscription if applicable
    let subscription = null;
    if (isStarterTrial && starterPlan) {
      const now = new Date();
      const trialEndsAt = new Date(now);
      trialEndsAt.setDate(trialEndsAt.getDate() + config.billing.trialDays);

      subscription = await tx.companySubscription.create({
        data: {
          companyId: company.id,
          subscriptionPlanId: starterPlan.id,
          status: 'TRIALING',
          trialStartedAt: now,
          trialEndsAt,
          activatedAt: now,
          paymentStatus: 'UNPAID',
          paymentProvider: 'MANUAL',
        },
        include: { subscriptionPlan: true },
      });
    }

    // Create enterprise monthly subscription and billing profile
    if (isEnterpriseMonthly && enterprisePlan) {
      // Save billing profile from registration form
      await tx.billingProfile.create({
        data: {
          companyId: company.id,
          legalCompanyName: data.billingName || data.companyName,
          billingEmail: data.billingEmail || data.email,
          billingPhone: data.billingPhone || data.adminPhone,
          country: data.billingCountry || data.country,
          addressLine1: data.billingAddress,
          defaultGateway: data.gateway || null,
        },
      });

      subscription = await tx.companySubscription.create({
        data: {
          companyId: company.id,
          subscriptionPlanId: enterprisePlan.id,
          status: 'PENDING_PAYMENT',
          gateway: data.gateway || null,
        },
        include: { subscriptionPlan: true },
      });
    }

      // Get super admins for notifications (but create notifications outside transaction)
      const superAdmins = await tx.user.findMany({
        where: { role: 'SUPER_ADMIN' },
        select: { id: true },
      });

      return { company, user, subscription, isEnterpriseMonthly, superAdmins, isStarterTrial };
    },
    {
      timeout: 15000, // Increase timeout to 15 seconds
    }
  );

  // Create notifications outside transaction (non-critical, faster)
  if (result.superAdmins.length > 0) {
    const notificationData = result.superAdmins.map((admin) => ({
      userId: admin.id,
      type: 'NEW_COMPANY_REGISTRATION',
      title: 'New Company Registration',
      message: result.isStarterTrial
        ? `${data.companyName} has registered and started a 14-day free trial.`
        : result.isEnterpriseMonthly
        ? `${data.companyName} has registered for Enterprise Monthly — awaiting payment.`
        : `${data.companyName} has registered and is pending approval.`,
      data: { companyId: result.company.id, companyName: data.companyName, isTrialActivation: result.isStarterTrial, isEnterpriseMonthly: result.isEnterpriseMonthly },
    }));

    // Create notifications in batch outside transaction
    await prisma.notification.createMany({
      data: notificationData,
    });

    // Send email alert to super-admins about new company registration
    await sendNewCompanyRegistrationAlert(result.company, data.planType);
  }

  // For enterprise monthly, generate JWT tokens so user can immediately access payment endpoints
  let tokens = null;
  // Tokens are now generated only after super-admin approval
  // if (result.isEnterpriseMonthly) {
  //   tokens = generateTokens(result.user.id, result.user.role);
  //   ...
  // }

  return {
    company: {
      id: result.company.id,
      name: result.company.name,
      status: result.company.status,
    },
    user: {
      id: result.user.id,
      email: result.user.email,
      fullName: result.user.fullName,
    },
    subscription: result.subscription
      ? {
          id: result.subscription.id,
          status: result.subscription.status,
          trialStartedAt: result.subscription.trialStartedAt,
          trialEndsAt: result.subscription.trialEndsAt,
          planType: result.subscription.subscriptionPlan?.planType,
          planName: result.subscription.subscriptionPlan?.name,
        }
      : null,
    isTrialActivated: false,
    isPendingPayment: false,
    isPendingApproval: true, // All registrations now require super-admin approval
    message: 'Registration successful. Please wait for super-admin approval to access the dashboard.',
  };
};

const login = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          logoUrl: true,
          brandColor: true,
          subscription: {
            select: {
              id: true,
              status: true,
              trialStartedAt: true,
              trialEndsAt: true,
              currentPeriodEnd: true,
              subscriptionPlan: { select: { planType: true, name: true } },
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  if (!user.isActive) {
    throw new ForbiddenError('Your account is deactivated');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Check company status for company users
  if (user.role !== 'SUPER_ADMIN') {
    if (!user.company) {
      throw new ForbiddenError('No company associated with this account');
    }
    if (user.company.status === 'PENDING') {
      throw new ForbiddenError(
        'Your company account is pending approval. You will be notified once approved.'
      );
    }
    if (user.company.status === 'REJECTED') {
      throw new ForbiddenError('Your company registration has been rejected.');
    }
    if (user.company.status === 'SUSPENDED') {
      throw new ForbiddenError('Your company account has been suspended. Contact support.');
    }
  }

  const { accessToken, refreshToken } = generateTokens(user.id, user.role);

  // Store refresh token
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt,
    },
  });

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      avatarUrl: user.avatarUrl,
      company: user.company
        ? {
            id: user.company.id,
            name: user.company.name,
            slug: user.company.slug,
            status: user.company.status,
            logoUrl: user.company.logoUrl,
            brandColor: user.company.brandColor,
          }
        : null,
      subscription: user.company?.subscription
        ? {
            id: user.company.subscription.id,
            status: user.company.subscription.status,
            trialStartedAt: user.company.subscription.trialStartedAt,
            trialEndsAt: user.company.subscription.trialEndsAt,
            currentPeriodEnd: user.company.subscription.currentPeriodEnd,
            planType: user.company.subscription.subscriptionPlan?.planType,
            planName: user.company.subscription.subscriptionPlan?.name,
          }
        : null,
    },
  };
};

const superAdminLogin = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || user.role !== 'SUPER_ADMIN') {
    throw new UnauthorizedError('Invalid credentials');
  }

  if (!user.isActive) {
    throw new ForbiddenError('Account is deactivated');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const { accessToken, refreshToken } = generateTokens(user.id, user.role);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      avatarUrl: user.avatarUrl,
    },
  };
};

const refreshAccessToken = async (token) => {
  const stored = await prisma.refreshToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!stored || stored.expiresAt < new Date()) {
    if (stored) {
      await prisma.refreshToken.delete({ where: { id: stored.id } });
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  const decoded = jwt.verify(token, config.jwt.refreshSecret);
  const { accessToken, refreshToken: newRefreshToken } = generateTokens(
    decoded.userId,
    decoded.role
  );

  // Rotate refresh token - delete old and create new
  await prisma.$transaction(async (tx) => {
    await tx.refreshToken.delete({ where: { id: stored.id } });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await tx.refreshToken.create({
      data: { token: newRefreshToken, userId: decoded.userId, expiresAt },
    });
  });

  return { accessToken, refreshToken: newRefreshToken };
};

const logout = async (userId, refreshToken) => {
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken, userId },
    });
  }
};

const getProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      role: true,
      avatarUrl: true,
      createdAt: true,
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          logoUrl: true,
          brandColor: true,
          industry: true,
          subscription: {
            select: {
              id: true,
              status: true,
              trialStartedAt: true,
              trialEndsAt: true,
              currentPeriodEnd: true,
              subscriptionPlan: { select: { planType: true, name: true } },
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return {
    ...user,
    subscription: user.company?.subscription
      ? {
          id: user.company.subscription.id,
          status: user.company.subscription.status,
          trialStartedAt: user.company.subscription.trialStartedAt,
          trialEndsAt: user.company.subscription.trialEndsAt,
          currentPeriodEnd: user.company.subscription.currentPeriodEnd,
          planType: user.company.subscription.subscriptionPlan?.planType,
          planName: user.company.subscription.subscriptionPlan?.name,
        }
      : null,
    company: user.company
      ? {
          id: user.company.id,
          name: user.company.name,
          slug: user.company.slug,
          status: user.company.status,
          logoUrl: user.company.logoUrl,
          brandColor: user.company.brandColor,
          industry: user.company.industry,
        }
      : null,
  };
};

const googleAuth = async (accessToken) => {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new UnauthorizedError('Invalid Google token');
  }

  const payload = await res.json();
  if (!payload.email) {
    throw new UnauthorizedError('Invalid Google token');
  }

  const { sub: googleId, email, name, picture } = payload;

  // Check if user exists by googleId or email
  let user = await prisma.user.findFirst({
    where: {
      OR: [{ googleId }, { email }],
    },
    include: {
      company: {
        select: { id: true, name: true, slug: true, status: true, logoUrl: true, brandColor: true },
      },
    },
  });

  if (user) {
    // Link Google account if user exists by email but not yet linked
    if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId, authProvider: 'google', avatarUrl: user.avatarUrl || picture },
        include: {
          company: {
            select: { id: true, name: true, slug: true, status: true, logoUrl: true, brandColor: true },
          },
        },
      });
    }

    if (!user.isActive) {
      throw new ForbiddenError('Your account is deactivated');
    }

    // Check company status for company users
    if (user.role !== 'SUPER_ADMIN') {
      if (!user.company) {
        throw new ForbiddenError('No company associated with this account');
      }
      if (user.company.status === 'PENDING') {
        throw new ForbiddenError(
          'Your company account is pending approval. You will be notified once approved.'
        );
      }
      if (user.company.status === 'REJECTED') {
        throw new ForbiddenError('Your company registration has been rejected.');
      }
      if (user.company.status === 'SUSPENDED') {
        throw new ForbiddenError('Your company account has been suspended. Contact support.');
      }
    }
  } else {
    // Create new company + user via Google sign-up
    const companyName = name ? `${name}'s Company` : 'My Company';
    let slug = generateSlug(companyName);
    const slugExists = await prisma.company.findUnique({ where: { slug } });
    if (slugExists) {
      slug = `${slug}-${uuidv4().substring(0, 6)}`;
    }

    const result = await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: companyName,
          slug,
          email,
          status: 'PENDING',
        },
      });

      const newUser = await tx.user.create({
        data: {
          email,
          fullName: name || email.split('@')[0],
          googleId,
          authProvider: 'google',
          avatarUrl: picture,
          role: 'COMPANY_ADMIN',
          companyId: company.id,
        },
      });

      await tx.companySettings.create({
        data: { companyId: company.id },
      });

      const defaultCategories = await tx.complaintCategory.findMany({
        where: { isDefault: true, companyId: null },
      });
      for (const cat of defaultCategories) {
        await tx.complaintCategory.create({
          data: { name: cat.name, slug: cat.slug, companyId: company.id, isDefault: false },
        });
      }

      const superAdmins = await tx.user.findMany({ where: { role: 'SUPER_ADMIN' } });
      for (const admin of superAdmins) {
        await tx.notification.create({
          data: {
            userId: admin.id,
            type: 'NEW_COMPANY_REGISTRATION',
            title: 'New Company Registration',
            message: `${companyName} has registered via Google and is pending approval.`,
            data: { companyId: company.id, companyName },
          },
        });
      }

      return { company, user: newUser };
    });

    user = {
      ...result.user,
      company: {
        id: result.company.id,
        name: result.company.name,
        slug: result.company.slug,
        status: result.company.status,
        logoUrl: result.company.logoUrl,
        brandColor: result.company.brandColor,
      },
    };
  }

  const { accessToken: jwtAccessToken, refreshToken } = generateTokens(user.id, user.role);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  return {
    accessToken: jwtAccessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      avatarUrl: user.avatarUrl,
      company: user.company,
    },
    isNewUser: !user.company?.status || user.company.status === 'PENDING',
  };
};

module.exports = {
  register,
  login,
  superAdminLogin,
  refreshAccessToken,
  logout,
  getProfile,
  googleAuth,
};
