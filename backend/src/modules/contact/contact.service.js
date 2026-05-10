const prisma = require('../../config/database');
const { NotFoundError } = require('../../utils/errors');
const logger = require('../../config/logger');

/**
 * Submit a new contact message from the public form.
 */
const submitMessage = async (data, ipAddress = null) => {
  const message = await prisma.contactMessage.create({
    data: {
      fullName: data.fullName.trim(),
      email: data.email.trim().toLowerCase(),
      company: data.company ? data.company.trim() : null,
      subject: data.subject.trim(),
      message: data.message.trim(),
      ipAddress,
      status: 'NEW',
    },
  });

  logger.info({ id: message.id, email: message.email }, 'New contact message submitted');
  return message;
};

/**
 * Super-admin: list all contact messages with pagination, search, status filter.
 */
const listMessages = async ({ page = 1, limit = 20, status, search, sortBy = 'createdAt', sortOrder = 'desc' } = {}) => {
  const skip = (page - 1) * limit;

  const where = {};
  if (status && status !== 'ALL') {
    where.status = status;
  }
  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { subject: { contains: search, mode: 'insensitive' } },
      { company: { contains: search, mode: 'insensitive' } },
    ];
  }

  const validSortFields = ['createdAt', 'updatedAt', 'fullName', 'status'];
  const orderField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
  const orderDir = sortOrder === 'asc' ? 'asc' : 'desc';

  const [total, items] = await Promise.all([
    prisma.contactMessage.count({ where }),
    prisma.contactMessage.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [orderField]: orderDir },
      select: {
        id: true,
        fullName: true,
        email: true,
        company: true,
        subject: true,
        message: true,
        status: true,
        adminReply: true,
        repliedAt: true,
        createdAt: true,
        updatedAt: true,
        repliedByAdmin: {
          select: { id: true, fullName: true, email: true },
        },
      },
    }),
  ]);

  return {
    data: items,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Super-admin: get a single message by ID.
 */
const getMessageById = async (id) => {
  const message = await prisma.contactMessage.findUnique({
    where: { id },
    include: {
      repliedByAdmin: {
        select: { id: true, fullName: true, email: true },
      },
    },
  });
  if (!message) throw new NotFoundError('Contact message not found');
  return message;
};

/**
 * Super-admin: update message status.
 */
const updateStatus = async (id, status) => {
  await getMessageById(id); // ensure exists
  return prisma.contactMessage.update({
    where: { id },
    data: { status },
    include: {
      repliedByAdmin: {
        select: { id: true, fullName: true, email: true },
      },
    },
  });
};

/**
 * Super-admin: mark message as READ when opened.
 */
const markAsRead = async (id) => {
  const message = await prisma.contactMessage.findUnique({ where: { id } });
  if (!message) throw new NotFoundError('Contact message not found');

  // Only mark as READ if currently NEW
  if (message.status === 'NEW') {
    return prisma.contactMessage.update({
      where: { id },
      data: { status: 'READ' },
    });
  }
  return message;
};

/**
 * Super-admin: save reply and update message status to REPLIED.
 */
const saveReply = async (id, replyMessage, adminId) => {
  await getMessageById(id); // ensure exists
  return prisma.contactMessage.update({
    where: { id },
    data: {
      adminReply: replyMessage,
      status: 'REPLIED',
      repliedByAdminId: adminId,
      repliedAt: new Date(),
    },
    include: {
      repliedByAdmin: {
        select: { id: true, fullName: true, email: true },
      },
    },
  });
};

/**
 * Get count of NEW (unread) messages for notification badge.
 */
const getNewCount = async () => {
  return prisma.contactMessage.count({ where: { status: 'NEW' } });
};

module.exports = {
  submitMessage,
  listMessages,
  getMessageById,
  updateStatus,
  markAsRead,
  saveReply,
  getNewCount,
};
