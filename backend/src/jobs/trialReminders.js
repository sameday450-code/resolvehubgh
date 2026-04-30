/**
 * Trial Reminder Job Scheduler
 * Optimized: Sends trial reminder emails: 7 days, 3 days, 1 day before expiration
 * Runs daily and only fetches trials approaching expiration (within 7 days)
 * 
 * PERFORMANCE OPTIMIZATION:
 * - Uses date range queries with indexes (not full table scan + loop)
 * - Only fetches subscriptions that need reminders
 * - Uses composite index on (status, trialEndsAt)
 */

const schedule = require('node-schedule');
const prisma = require('../config/database');
const logger = require('../config/logger');
const { sendTrialReminderEmail, sendTrialExpiredEmail } = require('../utils/emailService');

// Track which reminders have been sent to avoid duplicates (per day)
const sentReminders = new Map(); // key: "companyId:daysLeft", value: date string

/**
 * Initialize trial reminder jobs
 * Registers scheduled job to run daily
 */
const initializeTrialReminderJobs = () => {
  logger.info('Initializing trial reminder jobs...');

  // Run daily at 08:00 (configurable)
  schedule.scheduleJob('0 8 * * *', async () => {
    logger.info('Running optimized trial reminder check...');
    await checkAndSendTrialReminders();
  });

  logger.info('Trial reminder job scheduled daily at 08:00');
};

/**
 * Check for trials that need reminders and send emails
 * OPTIMIZED: Only fetches subscriptions expiring within 7 days
 */
const checkAndSendTrialReminders = async () => {
  try {
    const now = new Date();
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    // OPTIMIZED: Database-level filtering using composite index
    // Only fetch subscriptions expiring in next 7 days (uses index: [status, trialEndsAt])
    const upcomingTrials = await prisma.companySubscription.findMany({
      where: {
        status: 'TRIALING',
        trialEndsAt: {
          gte: now,        // Trial hasn't expired yet
          lte: sevenDaysFromNow, // Trial expires within 7 days
        },
      },
      select: {
        id: true,
        companyId: true,
        trialEndsAt: true,
        company: {
          select: {
            name: true,
            email: true,
          },
        },
        subscriptionPlan: {
          select: {
            name: true,
          },
        },
      },
      // Order by trialEndsAt to handle expiring trials first
      orderBy: {
        trialEndsAt: 'asc',
      },
    });

    logger.info({ count: upcomingTrials.length }, 'Found trials expiring within 7 days');

    // Process each trial
    for (const subscription of upcomingTrials) {
      const trialEndsAt = new Date(subscription.trialEndsAt);
      const daysUntilExpiration = Math.ceil((trialEndsAt - now) / (1000 * 60 * 60 * 24));

      // Determine which reminder to send
      if (daysUntilExpiration <= 0) {
        // Trial has expired
        await handleExpiredTrial(subscription);
      } else if (daysUntilExpiration === 7 || daysUntilExpiration === 3 || daysUntilExpiration === 1) {
        // Send reminder for 7, 3, or 1 day milestones
        await sendReminderIfNotSent(subscription, daysUntilExpiration);
      }
    }

    logger.info('Trial reminder check completed');
  } catch (err) {
    logger.error({ err }, 'Error in trial reminder check');
  }
};

/**
 * Send reminder email if not already sent today
 * Avoids duplicate emails on same day for same company
 */
const sendReminderIfNotSent = async (subscription, daysRemaining) => {
  try {
    const remindKey = `${subscription.companyId}:${daysRemaining}`;
    const today = new Date().toISOString().split('T')[0];
    const lastSentKey = `${remindKey}:${today}`;
    const lastSent = sentReminders.get(lastSentKey);

    // Skip if already sent today
    if (lastSent) {
      logger.debug({ daysRemaining, company: subscription.company.name }, 'Reminder already sent today, skipping');
      return;
    }

    logger.info(
      { companyName: subscription.company.name, daysRemaining },
      `Sending ${daysRemaining}-day trial reminder email`
    );

    await sendTrialReminderEmail(subscription.company, subscription, daysRemaining);
    sentReminders.set(lastSentKey, true);

    // Optional: Track in database for audit trail
    // await prisma.emailLog.create({
    //   data: {
    //     companyId: subscription.companyId,
    //     type: `TRIAL_REMINDER_${daysRemaining}D`,
    //     recipient: subscription.company.email,
    //     sentAt: new Date(),
    //   },
    // });
  } catch (err) {
    logger.error(
      { err, companyId: subscription.companyId, daysRemaining },
      'Failed to send trial reminder'
    );
  }
};

/**
 * Handle trial expiration
 * Send expiration email and update status if needed
 */
const handleExpiredTrial = async (subscription) => {
  try {
    const remindKey = `${subscription.companyId}:expired`;
    const today = new Date().toISOString().split('T')[0];
    const lastSentKey = `${remindKey}:${today}`;
    const lastSent = sentReminders.get(lastSentKey);

    // Check if already sent today
    if (lastSent) {
      return;
    }

    logger.info({ companyName: subscription.company.name }, 'Trial expired, sending notification');

    // Send expiration email
    await sendTrialExpiredEmail(subscription.company);
    sentReminders.set(lastSentKey, true);

    // Optional: Update subscription status
    // Note: In current system, billingGuard middleware handles expired trial checks
    // await prisma.companySubscription.update({
    //   where: { id: subscription.id },
    //   data: { status: 'EXPIRED' },
    // });
  } catch (err) {
    logger.error(
      { err, companyId: subscription.companyId },
      'Failed to handle trial expiration'
    );
  }
};

module.exports = {
  initializeTrialReminderJobs,
};

/**
 * Manually trigger trial reminder check (useful for testing/admin)
 */
const triggerTrialReminderCheck = async () => {
  logger.info('Manually triggering trial reminder check...');
  await checkAndSendTrialReminders();
  return { message: 'Trial reminder check triggered' };
};

/**
 * Clear sent reminders cache (useful for testing)
 */
const clearSentRemindersCache = () => {
  sentReminders.clear();
  logger.info('Cleared sent reminders cache');
};

module.exports = {
  initializeTrialReminderJobs,
  checkAndSendTrialReminders,
  triggerTrialReminderCheck,
  clearSentRemindersCache,
};
