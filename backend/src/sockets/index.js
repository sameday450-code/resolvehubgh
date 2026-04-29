const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../config/logger');

const initializeSocket = (io) => {
  // Authentication middleware for Socket.IO
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      // Allow unauthenticated connections for public events, but limit rooms
      socket.userData = null;
      return next();
    }

    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      socket.userData = decoded;
      next();
    } catch (err) {
      // Allow connection but mark as unauthenticated
      socket.userData = null;
      next();
    }
  });

  io.on('connection', (socket) => {
    const user = socket.userData;

    if (user) {
      // Join user-specific room
      socket.join(`user:${user.userId}`);

      // Join role-based rooms
      if (user.role === 'SUPER_ADMIN') {
        socket.join('super-admin');
        logger.debug(`Super admin connected: ${user.userId}`);
      }

      // Company-specific room joining
      socket.on('join:company', (companyId) => {
        if (user.role === 'SUPER_ADMIN' || user.companyId === companyId) {
          socket.join(`company:${companyId}`);
          logger.debug(`User ${user.userId} joined company room: ${companyId}`);
        }
      });

      socket.on('leave:company', (companyId) => {
        socket.leave(`company:${companyId}`);
      });
    }

    socket.on('disconnect', () => {
      if (user) {
        logger.debug(`User disconnected: ${user.userId}`);
      }
    });
  });

  // Helper to emit to company room
  io.emitToCompany = (companyId, event, data) => {
    io.to(`company:${companyId}`).emit(event, data);
  };

  // Helper to emit to specific user
  io.emitToUser = (userId, event, data) => {
    io.to(`user:${userId}`).emit(event, data);
  };

  // Helper to emit to super admin
  io.emitToSuperAdmin = (event, data) => {
    io.to('super-admin').emit(event, data);
  };

  logger.info('Socket.IO initialized');
  return io;
};

module.exports = { initializeSocket };
