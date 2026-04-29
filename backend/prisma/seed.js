const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Super Admin
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@resolvehub.com';
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'Admin@123';
  const superAdminName = process.env.SUPER_ADMIN_NAME || 'System Administrator';

  const existingAdmin = await prisma.user.findUnique({
    where: { email: superAdminEmail },
  });

  if (!existingAdmin) {
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
    console.log(`✅ Super Admin created: ${superAdminEmail}`);
  } else {
    console.log(`ℹ️  Super Admin already exists: ${superAdminEmail}`);
  }

  // Create default complaint categories (system-wide)
  const defaultCategories = [
    { name: 'Staff Behavior', slug: 'staff-behavior' },
    { name: 'Service Delay', slug: 'service-delay' },
    { name: 'Product Quality', slug: 'product-quality' },
    { name: 'Overcharging', slug: 'overcharging' },
    { name: 'Safety Issue', slug: 'safety-issue' },
    { name: 'Cleanliness', slug: 'cleanliness' },
    { name: 'Technical Issue', slug: 'technical-issue' },
    { name: 'General Feedback', slug: 'general-feedback' },
    { name: 'Suggestion', slug: 'suggestion' },
    { name: 'Other', slug: 'other' },
  ];

  for (const cat of defaultCategories) {
    const existing = await prisma.complaintCategory.findFirst({
      where: { slug: cat.slug, companyId: null },
    });
    if (!existing) {
      await prisma.complaintCategory.create({
        data: {
          name: cat.name,
          slug: cat.slug,
          isDefault: true,
          companyId: null,
        },
      });
    }
  }
  console.log('✅ Default complaint categories seeded');

  // Bootstrap system subscription plans
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

  for (const plan of systemPlans) {
    const existing = await prisma.subscriptionPlan.findUnique({
      where: { planType: plan.planType },
    });
    if (!existing) {
      await prisma.subscriptionPlan.create({ data: plan });
    }
  }
  console.log('✅ System subscription plans seeded');

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
