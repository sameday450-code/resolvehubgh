const contactService = require('./contact.service');
const { submitContactSchema, updateStatusSchema, replySchema } = require('./contact.validation');
const { sendContactReplyEmail } = require('../../utils/emailService');
const response = require('../../utils/response');
const logger = require('../../config/logger');

/**
 * POST /api/contact/messages
 * Public endpoint — submit a new contact message.
 */
const submitMessage = async (req, res, next) => {
  try {
    const { error, value } = submitContactSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        errors: error.details.map((d) => ({ field: d.path[0], message: d.message })),
      });
    }

    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress;
    const message = await contactService.submitMessage(value, ipAddress);

    // Emit real-time event to super-admin room (non-blocking)
    try {
      const io = req.app.get('io');
      if (io) {
        io.emitToSuperAdmin('contact:new', {
          id: message.id,
          fullName: message.fullName,
          email: message.email,
          company: message.company,
          subject: message.subject,
          status: message.status,
          createdAt: message.createdAt,
        });
        logger.debug('Emitted contact:new event to super admins');
      }
    } catch (socketErr) {
      logger.warn({ err: socketErr }, 'Failed to emit contact:new socket event');
    }

    return response.success(
      res,
      { id: message.id },
      'Thank you for contacting ResolveHub. Our team will respond to you shortly.',
      201
    );
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/super-admin/contact-messages
 * Super-admin only — list all contact messages.
 */
const listMessages = async (req, res, next) => {
  try {
    const { page, limit, status, search, sortBy, sortOrder } = req.query;
    const result = await contactService.listMessages({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      status,
      search,
      sortBy,
      sortOrder,
    });
    return response.paginated(res, result.data, result.pagination);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/super-admin/contact-messages/:id
 * Super-admin only — view full message details and mark as READ.
 */
const getMessageById = async (req, res, next) => {
  try {
    const message = await contactService.getMessageById(req.params.id);

    // Auto-mark as READ if it's NEW (non-blocking)
    if (message.status === 'NEW') {
      contactService.markAsRead(req.params.id).catch((err) =>
        logger.warn({ err }, 'Failed to mark contact message as read')
      );

      // Emit status change to super-admin room
      try {
        const io = req.app.get('io');
        if (io) {
          io.emitToSuperAdmin('contact:statusChanged', {
            id: message.id,
            status: 'READ',
          });
        }
      } catch (socketErr) {
        logger.warn({ err: socketErr }, 'Failed to emit contact:statusChanged socket event');
      }
    }

    return response.success(res, message);
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/super-admin/contact-messages/:id/status
 * Super-admin only — update message status.
 */
const updateStatus = async (req, res, next) => {
  try {
    const { error, value } = updateStatusSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const updated = await contactService.updateStatus(req.params.id, value.status);

    // Emit status change to super-admin room
    try {
      const io = req.app.get('io');
      if (io) {
        io.emitToSuperAdmin('contact:statusChanged', {
          id: updated.id,
          status: updated.status,
        });
      }
    } catch (socketErr) {
      logger.warn({ err: socketErr }, 'Failed to emit contact:statusChanged socket event');
    }

    return response.success(res, updated, 'Status updated successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/super-admin/contact-messages/:id/reply
 * Super-admin only — send an email reply to the customer.
 */
const replyToMessage = async (req, res, next) => {
  try {
    const { error, value } = replySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    // Get the original message
    const originalMessage = await contactService.getMessageById(req.params.id);

    // Send the reply email to the customer
    await sendContactReplyEmail({
      to: originalMessage.email,
      customerName: originalMessage.fullName,
      subject: originalMessage.subject,
      replyMessage: value.replyMessage,
    });

    // Save the reply and update status to REPLIED
    const updated = await contactService.saveReply(
      req.params.id,
      value.replyMessage,
      req.user.id
    );

    // Emit status change to super-admin room
    try {
      const io = req.app.get('io');
      if (io) {
        io.emitToSuperAdmin('contact:replied', {
          id: updated.id,
          status: updated.status,
          repliedAt: updated.repliedAt,
        });
      }
    } catch (socketErr) {
      logger.warn({ err: socketErr }, 'Failed to emit contact:replied socket event');
    }

    return response.success(res, updated, 'Reply sent successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/super-admin/contact-messages/stats
 * Super-admin only — get unread/new count for badge.
 */
const getStats = async (req, res, next) => {
  try {
    const newCount = await contactService.getNewCount();
    return response.success(res, { newCount });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  submitMessage,
  listMessages,
  getMessageById,
  updateStatus,
  replyToMessage,
  getStats,
};
