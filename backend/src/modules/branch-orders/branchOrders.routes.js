const express = require('express');
const { authenticate, authorize } = require('../../middleware/auth');
const controller = require('./branchOrders.controller');

const router = express.Router();

// ============================================
// COMPANY ROUTES
// ============================================

/**
 * POST /api/branch-orders
 * Create a new branch payment order
 */
router.post('/', authenticate, controller.createBranchOrder);

/**
 * GET /api/branch-orders
 * Get all branch payment orders for the company
 */
router.get('/', authenticate, controller.getMyBranchOrders);

/**
 * GET /api/branch-orders/:id
 * Get a single branch payment order
 */
router.get('/:id', authenticate, controller.getBranchOrder);

/**
 * POST /api/branch-orders/calculate-cost
 * Calculate cost for a number of branches
 * Note: This is a public endpoint to calculate costs without authentication
 */
router.post('/calculate-cost', controller.calculateCost);

// ============================================
// SUPER ADMIN ROUTES
// ============================================

/**
 * GET /api/admin/branch-orders
 * Get all branch payment orders
 */
router.get(
  '/admin/list',
  authenticate,
  authorize(['SUPER_ADMIN']),
  controller.getAllBranchOrders
);

/**
 * POST /api/admin/branch-orders/:id/approve
 * Approve a branch payment order
 */
router.post(
  '/:id/approve',
  authenticate,
  authorize(['SUPER_ADMIN']),
  controller.approveBranchOrder
);

/**
 * POST /api/admin/branch-orders/:id/reject
 * Reject a branch payment order
 */
router.post(
  '/:id/reject',
  authenticate,
  authorize(['SUPER_ADMIN']),
  controller.rejectBranchOrder
);

module.exports = router;
