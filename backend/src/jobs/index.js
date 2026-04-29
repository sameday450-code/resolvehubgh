/**
 * Job Registry
 * Central point for registering and initializing all scheduled jobs
 */

const { initializeTrialReminderJobs } = require('./trialReminders');
const logger = require('../config/logger');

/**
 * Initialize all jobs
 * Should be called on application startup after database connection
 */
const initializeJobs = () => {
  logger.info('Initializing scheduled jobs...');

  try {
    // Initialize trial reminder jobs
    initializeTrialReminderJobs();

    // Add more job initializations here as needed
    // Example:
    // initializePaymentReminders();
    // initializeReportGeneration();

    logger.info('All scheduled jobs initialized successfully');
  } catch (err) {
    logger.error({ err }, 'Failed to initialize scheduled jobs');
    throw err;
  }
};

module.exports = {
  initializeJobs,
};
