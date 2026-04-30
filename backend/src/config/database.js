const { PrismaClient } = require('@prisma/client');

/**
 * Instantiate Prisma Client as a singleton
 * Prevents multiple PrismaClient instances in development (next.js hot reload)
 * 
 * PRODUCTION OPTIMIZATION:
 * - Connection pooling via Neon pooler
 * - Query logging only on errors
 * - Optimized for low-latency operations
 */

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['error'], // Only log errors in production
    // Neon Pooler Configuration
    // Uses connection pooling for database efficiency
  });
} else {
  // Development configuration
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
  }
  prisma = global.prisma;
}

/**
 * Graceful disconnect on application shutdown
 * Ensures all connections are properly closed
 */
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = prisma;
