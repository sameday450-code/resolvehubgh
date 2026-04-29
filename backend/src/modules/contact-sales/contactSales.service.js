const prisma = require('../../config/database');
const { NotFoundError } = require('../../utils/errors');
const logger = require('../../config/logger');
const { sendSuperAdminNewEnterpriseAlert } = require('../../utils/emailService');

/**
 * Submit a contact-sales request. CompanyId is optional (can come from unauthenticated users).
 */
const submitRequest = async (data, companyId = null) => {
  const request = await prisma.contactSalesRequest.create({
    data: { ...data, companyId },
  });

  // Send email notification to all super admins (non-blocking)
  try {
    const superAdmins = await prisma.user.findMany({
      where: { role: 'SUPER_ADMIN' },
      select: { email: true },
    });

    if (superAdmins.length > 0) {
      const emailPromises = superAdmins.map(admin =>
        sendSuperAdminNewEnterpriseAlert(admin.email, {
          companyName: data.companyName,
          contactName: data.contactName,
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone,
          industry: data.industry,
          estimatedBranches: data.estimatedBranches,
          estimatedUsers: data.estimatedUsers,
          requirements: data.requirements,
        }).catch(err =>
          logger.warn({ err, adminEmail: admin.email }, 'Failed to send enterprise alert email')
        )
      );
      await Promise.allSettled(emailPromises);
    }
  } catch (err) {
    logger.warn({ err }, 'Failed to send super admin emails for new inquiry');
  }

  return request;
};

/**
 * Super-admin: list all contact-sales requests with pagination.
 */
const listRequests = async ({ page = 1, limit = 20, status } = {}) => {
  const skip = (page - 1) * limit;
  const where = status ? { status } : {};

  const [total, items] = await Promise.all([
    prisma.contactSalesRequest.count({ where }),
    prisma.contactSalesRequest.findMany({
      where,
      skip,
      take: limit,
      include: {
        company: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return {
    data: items,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  };
};

/**
 * Super-admin: get a single request by ID.
 */
const getRequestById = async (id) => {
  const req = await prisma.contactSalesRequest.findUnique({
    where: { id },
    include: { company: { select: { id: true, name: true, email: true } } },
  });
  if (!req) throw new NotFoundError('Contact sales request not found');
  return req;
};

/**
 * Super-admin: update status or add admin notes.
 */
const updateRequest = async (id, updates) => {
  await getRequestById(id); // ensure exists
  return prisma.contactSalesRequest.update({
    where: { id },
    data: updates,
  });
};

module.exports = { submitRequest, listRequests, getRequestById, updateRequest };
