/**
 * Fix script to activate PENDING_ACTIVATION subscriptions
 * 
 * This script fixes companies that have subscriptions stuck in PENDING_ACTIVATION state.
 * These companies cannot access their dashboards (402 errors).
 * 
 * Run with: node fix-pending-activation.js
 */

const prisma = require('./src/config/database');

async function fixPendingActivationSubscriptions() {
  try {
    console.log('🔍 Searching for PENDING_ACTIVATION subscriptions...');

    // Find all subscriptions in PENDING_ACTIVATION state
    const pendingSubscriptions = await prisma.companySubscription.findMany({
      where: { status: 'PENDING_ACTIVATION' },
      include: { company: true, subscriptionPlan: true },
    });

    console.log(`Found ${pendingSubscriptions.length} subscriptions in PENDING_ACTIVATION state\n`);

    if (pendingSubscriptions.length === 0) {
      console.log('✅ No subscriptions need fixing!');
      return;
    }

    // Display affected companies
    console.log('📋 Affected companies:');
    pendingSubscriptions.forEach((sub, i) => {
      console.log(`${i + 1}. ${sub.company.name} (ID: ${sub.company.id})`);
    });
    console.log();

    // Fix each subscription
    for (const subscription of pendingSubscriptions) {
      const company = subscription.company;

      // Determine the target status based on company status
      let targetStatus = 'TRIALING';
      let trialStartedAt = new Date();
      let trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 14);

      // If company is approved, use trial dates or activation dates
      if (company.status === 'APPROVED' && company.approvedAt) {
        trialStartedAt = company.approvedAt;
        trialEndsAt = company.trialEndDate || new Date(company.approvedAt);
        if (!company.trialEndDate) {
          trialEndsAt.setDate(trialEndsAt.getDate() + 14);
        }
      }

      // Update the subscription
      const updated = await prisma.companySubscription.update({
        where: { id: subscription.id },
        data: {
          status: targetStatus,
          trialStartedAt,
          trialEndsAt,
          activatedAt: trialStartedAt,
        },
      });

      console.log(`✅ Fixed ${company.name}`);
      console.log(`   Status: PENDING_ACTIVATION → ${targetStatus}`);
      console.log(`   Trial ends: ${trialEndsAt.toISOString().split('T')[0]}\n`);
    }

    console.log(`✨ Successfully fixed ${pendingSubscriptions.length} subscription(s)!`);
    console.log('🎉 Affected users should now be able to access their dashboards.');

  } catch (error) {
    console.error('❌ Error fixing subscriptions:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixPendingActivationSubscriptions();
