const prisma = require('../config/database');
const bcrypt = require('bcryptjs');
const logger = require('../config/logger');

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
    logger.error(`❌ Bootstrap failed: ${error.message}`);
    throw error;
  }
}

/**
 * Ensure Super Admin user exists with credentials from .env
 */
async function ensureSuperAdmin() {
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@resolvehubgh.com';
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'GoodGod1$';
  const superAdminName = process.env.SUPER_ADMIN_NAME || 'System Administrator';

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
      logger.info(`✅ Super Admin credentials synchronized: ${superAdminEmail}`);
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
    logger.error(`❌ Failed to ensure Super Admin: ${error.message}`);
    throw error;
  }
}

/**
 * Ensure default subscription plans exist
 */
async function ensureSubscriptionPlans() {
  const systemPlans = [
    {
      name: 'Starter Trial',
      slug: 'starter-trial',
      planType: 'STARTER_TRIAL',
      description: '30-day free trial for new businesses to explore the platform',
      price: 0,
      currency: 'GHS',
      billingCycle: 'MONTHLY',
      trialDays: 30,
      maxBranches: 2,
      maxQRCodes: 10,
      maxStaff: 5,
      features: {
        analytics: false,
        export: false,
        customBranding: false,
        prioritySupport: false,
      },
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
      maxBranches: -1,
      maxQRCodes: -1,
      maxStaff: -1,
      features: {
        analytics: true,
        export: true,
        customBranding: true,
        prioritySupport: true,
        dedicatedSupport: true,
        sla: true,
      },
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
      }
    }
  } catch (error) {
    logger.error(`❌ Failed to ensure subscription plans: ${error.message}`);
    throw error;
  }
}

module.exports = { bootstrap };
