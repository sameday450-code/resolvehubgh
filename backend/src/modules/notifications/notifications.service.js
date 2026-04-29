const prisma = require('../../config/database');
const { getPaginationParams, buildPaginationMeta } = require('../../utils/helpers');

const getNotifications = async (userId, query) => {
  const { page, limit, skip } = getPaginationParams(query);
  const where = { userId };

  if (query.isRead !== undefined) {
    where.isRead = query.isRead === 'true';
  }

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  return {
    notifications,
    unreadCount,
    pagination: buildPaginationMeta(total, page, limit),
  };
};

const markAsRead = async (userId, notificationId) => {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true, readAt: new Date() },
  });
};

const markAllAsRead = async (userId) => {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
};

const getUnreadCount = async (userId) => {
  return prisma.notification.count({ where: { userId, isRead: false } });
};

module.exports = { getNotifications, markAsRead, markAllAsRead, getUnreadCount };
