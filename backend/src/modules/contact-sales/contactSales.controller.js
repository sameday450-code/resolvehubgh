const contactSalesService = require('./contactSales.service');
const response = require('../../utils/response');
const logger = require('../../config/logger');

const submitRequest = async (req, res, next) => {
  try {
    // Attach companyId if the user is authenticated as a company admin
    const companyId =
      req.user && req.user.role === 'COMPANY_ADMIN' ? req.user.companyId : null;
    const request = await contactSalesService.submitRequest(req.body, companyId);

    // Emit Socket.IO event to super admins (non-blocking)
    try {
      const io = req.app.get('io');
      if (io) {
        io.emitToSuperAdmin('newEnterpriseInquiry', {
          id: request.id,
          companyName: request.companyName,
          contactEmail: request.contactEmail,
          contactName: request.contactName,
          industry: request.industry,
          createdAt: request.createdAt,
        });
        logger.debug('Emitted newEnterpriseInquiry event to super admins');
      }
    } catch (err) {
      logger.warn({ err }, 'Failed to emit Socket.IO event for new inquiry');
    }

    return response.success(res, request, 'Your request has been received. Our team will contact you shortly.', 201);
  } catch (err) {
    next(err);
  }
};

const listRequests = async (req, res, next) => {
  try {
    const { page, limit, status } = req.query;
    const result = await contactSalesService.listRequests({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      status,
    });
    return response.paginated(res, result.data, result.pagination);
  } catch (err) {
    next(err);
  }
};

const getRequestById = async (req, res, next) => {
  try {
    const request = await contactSalesService.getRequestById(req.params.id);
    return response.success(res, request);
  } catch (err) {
    next(err);
  }
};

const updateRequest = async (req, res, next) => {
  try {
    const request = await contactSalesService.updateRequest(req.params.id, req.body);
    return response.success(res, request, 'Request updated');
  } catch (err) {
    next(err);
  }
};

module.exports = { submitRequest, listRequests, getRequestById, updateRequest };
