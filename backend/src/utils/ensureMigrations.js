const prisma = require('../config/database');
const logger = require('../config/logger');

/**
 * Ensures Prisma client is connected and ready for use.
 * Performs a health check on the database connection.
 * This should be called before starting the Express server in production.
 *
 * @returns {Promise<boolean>} - Returns true if connection is successful
 * @throws {Error} - Throws if connection fails after retries
 */
async function ensureMigrations() {
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      // Attempt to execute a simple query to verify DB connection
      await prisma.$queryRaw`SELECT 1`;

      logger.info('✓ Database connection verified and ready');
      return true;
    } catch (error) {
      attempt++;
      logger.warn(
        `Database connection attempt ${attempt}/${maxRetries} failed: ${error.message}`
      );

      if (attempt >= maxRetries) {
        logger.error(
          '✗ Failed to connect to database after retries. Migrations may not have completed.'
        );
        throw new Error(`Database migration verification failed: ${error.message}`);
      }

      // Wait before retrying (exponential backoff: 2s, 4s, 8s)
      const delay = Math.pow(2, attempt) * 1000;
      logger.info(`Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

module.exports = { ensureMigrations };
