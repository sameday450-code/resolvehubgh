const notifService = require('./notifications.service');
const response = require('../../utils/response');

const getNotifications = async (req, res, next) => {
  try {
    const data = await notifService.getNotifications(req.user.id, req.query);
    return response.paginated(res, data.notifications, data.pagination, 'Success');
  } catch (err) { next(err); }
};

const markAsRead = async (req, res, next) => {
  try {
    await notifService.markAsRead(req.user.id, req.params.id);
    return response.success(res, null, 'Marked as read');
  } catch (err) { next(err); }
};

const markAllAsRead = async (req, res, next) => {
  try {
    await notifService.markAllAsRead(req.user.id);
    return response.success(res, null, 'All marked as read');
  } catch (err) { next(err); }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const count = await notifService.getUnreadCount(req.user.id);
    return response.success(res, { count });
  } catch (err) { next(err); }
};

module.exports = { getNotifications, markAsRead, markAllAsRead, getUnreadCount };
