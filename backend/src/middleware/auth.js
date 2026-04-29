const jwt = require('jsonwebtoken');
const config = require('../config');
const prisma = require('../config/database');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        companyId: true,
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (!user.isActive) {
      throw new ForbiddenError('Account is deactivated');
    }

    // Check company status for non-super-admins
    if (user.role !== 'SUPER_ADMIN' && user.company) {
      if (user.company.status !== 'APPROVED') {
        throw new ForbiddenError(
          `Company account is ${user.company.status.toLowerCase()}. Contact support.`
        );
      }
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return next(new UnauthorizedError('Invalid token'));
    }
    if (err.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Token expired'));
    }
    next(err);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Not authenticated'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }
    next();
  };
};

const tenantGuard = (req, res, next) => {
  if (req.user.role === 'SUPER_ADMIN') {
    return next();
  }
  if (!req.user.companyId) {
    return next(new ForbiddenError('No company association'));
  }
  req.tenantId = req.user.companyId;
  next();
};

module.exports = { authenticate, authorize, tenantGuard };
