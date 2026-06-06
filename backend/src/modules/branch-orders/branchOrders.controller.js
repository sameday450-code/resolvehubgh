const branchOrdersService = require('./branchOrders.service');
const response = require('../../utils/response');
const logger = require('../../config/logger');

/**
 * POST /api/branch-orders
 * Create a new branch payment order
 */
const createBranchOrder = async (req, res, next) => {
  try {
    const { quantity, paymentMethod, paymentDetails, branches } = req.body;

    const order = await branchOrdersService.createBranchOrder(req.user.companyId, {
      quantity,
      paymentMethod,
      paymentDetails,
      branches,
    });

    return response.success(res, order, 'Branch payment order created successfully', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/branch-orders
 * Get all branch payment orders for the company
 */
const getMyBranchOrders = async (req, res, next) => {
  try {
    const { page, limit, status } = req.query;

    const result = await branchOrdersService.getCompanyBranchOrders(req.user.companyId, {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      status,
    });

    return response.paginated(res, result.data, result.pagination);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/branch-orders/:id
 * Get a single branch payment order
 */
const getBranchOrder = async (req, res, next) => {
  try {
    const order = await branchOrdersService.getBranchOrder(req.params.id, req.user.companyId);

    return response.success(res, order);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/branch-orders/calculate-cost
 * Calculate cost for a number of branches
 */
const calculateCost = async (req, res, next) => {
  try {
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return response.error(res, 'Quantity must be at least 1', 400);
    }

    const costBreakdown = branchOrdersService.calculateBranchCost(quantity);

    return response.success(res, costBreakdown);
  } catch (err) {
    next(err);
  }
};

// ============================================
// SUPER ADMIN ENDPOINTS
// ============================================

/**
 * GET /api/admin/branch-orders
 * Get all branch payment orders (Super Admin)
 */
const getAllBranchOrders = async (req, res, next) => {
  try {
    const { page, limit, status, companyId } = req.query;

    const result = await branchOrdersService.getAllBranchOrders({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      status,
      companyId,
    });

    return response.paginated(res, result.data, result.pagination);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/admin/branch-orders/:id/approve
 * Approve a branch payment order (Super Admin)
 */
const approveBranchOrder = async (req, res, next) => {
  try {
    const { adminNotes } = req.body;

    const order = await branchOrdersService.approveBranchOrder(req.params.id, req.user.id, {
      adminNotes,
    });

    return response.success(res, order, 'Branch payment order approved successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/admin/branch-orders/:id/reject
 * Reject a branch payment order (Super Admin)
 */
const rejectBranchOrder = async (req, res, next) => {
  try {
    const { rejectionReason, adminNotes } = req.body;

    const order = await branchOrdersService.rejectBranchOrder(req.params.id, req.user.id, {
      rejectionReason,
      adminNotes,
    });

    return response.success(res, order, 'Branch payment order rejected successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  // Company endpoints
  createBranchOrder,
  getMyBranchOrders,
  getBranchOrder,
  calculateCost,

  // Super Admin endpoints
  getAllBranchOrders,
  approveBranchOrder,
  rejectBranchOrder,
};
