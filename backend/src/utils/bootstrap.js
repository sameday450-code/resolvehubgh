const prisma = require('../config/database');
const bcrypt = require('bcryptjs');
const logger = require('../config/logger');
const config = require('../config');

/**
 * Bootstrap essential system data (super admin, plans, etc.)
 * Runs automatically on server startup to ensure data integrity
 */
async function bootstrap() {
  try {
    logger.info('🔄 Running bootstrap checks...');

    // Ensure Super Admin exists
    await ensureSuperAdmin();

    // Ensure subscription plans exist
    await ensureSubscriptionPlans();

    logger.info('✅ Bootstrap complete');
  } catch (error) {
    logger.error({ err: error }, 'Bootstrap failed');
    throw error;
  }
}

/**
 * Ensure Super Admin user exists with credentials from .env
 * SECURITY: Requires environment variables to be explicitly set
 */
async function ensureSuperAdmin() {
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;
  const superAdminName = process.env.SUPER_ADMIN_NAME || 'System Administrator';

  // In production, fail fast if credentials are not configured
  if (!superAdminEmail || !superAdminPassword) {
    if (config.nodeEnv === 'production') {
      throw new Error(
        'SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD must be set in environment variables'
      );
    }
    logger.warn('⚠️  SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD not configured. Skipping super admin setup.');
    return;
  }

  try {
    const existingAdmin = await prisma.user.findUnique({
      where: { email: superAdminEmail },
    });

    if (existingAdmin) {
      // Admin exists - ensure password is always in sync with .env
      const passwordHash = await bcrypt.hash(superAdminPassword, 12);
      await prisma.user.update({
        where: { id: existingAdmin.id },
        data: {
          passwordHash,
          fullName: superAdminName,
          isActive: true,
        },
      });
      logger.info(`✅ Super Admin synchronized: ${superAdminEmail}`);
    } else {
      // Create new super admin
      const passwordHash = await bcrypt.hash(superAdminPassword, 12);
      await prisma.user.create({
        data: {
          email: superAdminEmail,
          passwordHash,
          fullName: superAdminName,
          role: 'SUPER_ADMIN',
          isActive: true,
        },
      });
      logger.info(`✅ Created Super Admin: ${superAdminEmail}`);
    }
  } catch (error) {
    logger.error({ err: error, email: superAdminEmail }, 'Failed to ensure Super Admin');
    throw error;
  }
}

/**
 * Ensure default subscription plans exist
 * Updates plan configuration based on TRIAL_DAYS env variable
 */
async function ensureSubscriptionPlans() {
  const trialDays = config.billing.trialDays;

  const systemPlans = [
    {
      name: 'Starter Trial',
      slug: 'starter-trial',
      planType: 'STARTER_TRIAL',
      description: `${trialDays}-day free trial for new businesses to explore the platform`,
      price: 0,
      currency: 'GHS',
      billingCycle: 'MONTHLY',
      trialDays: trialDays,
      maxBranches: 1, // Trial limited to 1 branch only
      maxQRCodes: 10,
      maxStaff: 5,
      features: {
        analytics: false,
        export: false,
        customBranding: false,
        prioritySupport: false,
      },
      isActive: true,
    },
    {
      name: 'Enterprise Monthly',
      slug: 'enterprise-monthly',
      planType: 'ENTERPRISE_MONTHLY',
      description: 'Full-featured plan for growing businesses billed monthly',
      price: 299,
      currency: 'GHS',
      billingCycle: 'MONTHLY',
      trialDays: 0,
      maxBranches: 50,
      maxQRCodes: 200,
      maxStaff: 100,
      features: {
        analytics: true,
        export: true,
        customBranding: true,
        prioritySupport: true,
      },
      isActive: true,
    },
    {
      name: 'Custom Enterprise',
      slug: 'custom-enterprise',
      planType: 'CUSTOM_ENTERPRISE',
      description: 'Tailored plan for large organizations with bespoke requirements',
      price: 0,
      currency: 'GHS',
      billingCycle: 'CUSTOM',
      trialDays: 0,
      maxBranches: -1, // Unlimited
      maxQRCodes: -1, // Unlimited
      maxStaff: -1, // Unlimited
      features: {
        analytics: true,
        export: true,
        customBranding: true,
        prioritySupport: true,
        dedicatedSupport: true,
        sla: true,
      },
      isActive: true,
    },
  ];

  try {
    for (const plan of systemPlans) {
      const existing = await prisma.subscriptionPlan.findUnique({
        where: { planType: plan.planType },
      });

      if (!existing) {
        await prisma.subscriptionPlan.create({ data: plan });
        logger.info(`✅ Created subscription plan: ${plan.name}`);
      } else if (plan.planType === 'STARTER_TRIAL') {
        // Update starter trial plan with current TRIAL_DAYS config
        await prisma.subscriptionPlan.update({
          where: { planType: 'STARTER_TRIAL' },
          data: {
            description: plan.description,
            trialDays: trialDays,
            maxBranches: 1,
          },
        });
        logger.info(`✅ Updated Starter Trial plan: trialDays=${trialDays}`);
      }
    }
  } catch (error) {
    logger.error({ err: error }, 'Failed to ensure subscription plans');
    throw error;
  }
}

module.exports = { bootstrap };
