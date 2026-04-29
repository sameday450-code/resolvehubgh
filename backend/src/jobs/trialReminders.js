/**
 * Trial Reminder Job Scheduler
 * Sends trial reminder emails: 7 days, 3 days, 1 day before expiration
 * Runs daily and checks all active trials approaching expiration
 */

const schedule = require('node-schedule');
const prisma = require('../config/database');
const logger = require('../config/logger');
const { sendTrialReminderEmail, sendTrialExpiredEmail } = require('../utils/emailService');

// Track which reminders have been sent to avoid duplicates
const sentReminders = new Map(); // key: "companyId:daysLeft", value: timestamp

/**
 * Initialize trial reminder jobs
 * Registers scheduled job to run daily
 */
const initializeTrialReminderJobs = () => {
  logger.info('Initializing trial reminder jobs...');

  // Run daily at 08:00 (configurable)
  schedule.scheduleJob('0 8 * * *', async () => {
    logger.info('Running trial reminder check...');
    await checkAndSendTrialReminders();
  });

  logger.info('Trial reminder job scheduled daily at 08:00');
};

/**
 * Check for trials that need reminders and send emails
 */
const checkAndSendTrialReminders = async () => {
  try {
    const now = new Date();
    const company = await prisma.companySubscription.findMany({
      where: {
        status: 'TRIALING',
        trialEndsAt: {
          not: null,
        },
      },
      include: {
        company: true,
        subscriptionPlan: true,
      },
    });

    logger.info({ count: company.length }, 'Found trials to check');

    for (const subscription of company) {
      const trialEndsAt = new Date(subscription.trialEndsAt);
      const daysUntilExpiration = Math.ceil((trialEndsAt - now) / (1000 * 60 * 60 * 24));

      // Skip if already expired
      if (daysUntilExpiration <= 0) {
        await handleExpiredTrial(subscription);
        continue;
      }

      // Send 7-day reminder
      if (daysUntilExpiration === 7) {
        await sendReminderIfNotSent(subscription, 7);
      }
      // Send 3-day reminder
      else if (daysUntilExpiration === 3) {
        await sendReminderIfNotSent(subscription, 3);
      }
      // Send 1-day reminder
      else if (daysUntilExpiration === 1) {
        await sendReminderIfNotSent(subscription, 1);
      }
    }

    logger.info('Trial reminder check completed');
  } catch (err) {
    logger.error({ err }, 'Error in trial reminder check');
  }
};

/**
 * Send reminder email if not already sent today
 */
const sendReminderIfNotSent = async (subscription, daysRemaining) => {
  try {
    const remindKey = `${subscription.companyId}:${daysRemaining}`;
    const lastSent = sentReminders.get(remindKey);
    const now = Date.now();

    // Check if already sent today (within 24 hours)
    if (lastSent && now - lastSent < 24 * 60 * 60 * 1000) {
      logger.debug({ daysRemaining, company: subscription.company.name }, 'Reminder already sent today, skipping');
      return;
    }

    logger.info(
      { companyName: subscription.company.name, daysRemaining },
      'Sending trial reminder email'
    );

    await sendTrialReminderEmail(subscription.company, subscription, daysRemaining);
    sentReminders.set(remindKey, now);

    // Track in database for audit trail (optional - commented for now)
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
 * Send expiration email if not already sent, mark as expired
 */
const handleExpiredTrial = async (subscription) => {
  try {
    const remindKey = `${subscription.companyId}:expired`;
    const lastSent = sentReminders.get(remindKey);
    const now = Date.now();

    // Check if already sent today
    if (lastSent && now - lastSent < 24 * 60 * 60 * 1000) {
      return;
    }

    logger.info({ companyName: subscription.company.name }, 'Trial expired, sending notification');

    // Send expiration email
    await sendTrialExpiredEmail(subscription.company);
    sentReminders.set(remindKey, now);

    // Update subscription status to EXPIRED
    // (In production, this might stay TRIALING but with an expired flag)
    // For now, the billingGuard middleware handles the expiration check

  } catch (err) {
    logger.error(
      { err, companyId: subscription.companyId },
      'Failed to handle trial expiration'
    );
  }
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
