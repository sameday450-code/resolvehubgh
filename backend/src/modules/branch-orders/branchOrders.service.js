const prisma = require('../../config/database');
const { NotFoundError, BadRequestError } = require('../../utils/errors');
const logger = require('../../config/logger');

const COST_PER_BRANCH = 50; // 50 GHS per branch

/**
 * Create a new branch payment order with branch details
 * @param {string} companyId - Company ID
 * @param {object} data - Order data { quantity, paymentMethod, paymentDetails, branches }
 * @returns {object} Created branch payment order
 */
const createBranchOrder = async (companyId, data) => {
  const { quantity, paymentMethod, paymentDetails, branches } = data;

  // Validate input
  if (!quantity || quantity < 1) {
    throw new BadRequestError('Quantity must be at least 1');
  }

  if (quantity > 100) {
    throw new BadRequestError('Cannot order more than 100 branches at once');
  }

  if (!paymentMethod) {
    throw new BadRequestError('Payment method is required');
  }

  if (!['MOBILE_MONEY', 'BANK_TRANSFER', 'MANUAL'].includes(paymentMethod)) {
    throw new BadRequestError('Invalid payment method');
  }

  // Validate branches array
  if (!Array.isArray(branches) || branches.length !== quantity) {
    throw new BadRequestError('Branch details count must match quantity');
  }

  // Validate payment details based on method
  if (paymentMethod === 'MOBILE_MONEY') {
    if (!paymentDetails.network || !paymentDetails.phoneNumber || !paymentDetails.mobileMoneyTxnId) {
      throw new BadRequestError('Mobile money details (network, phoneNumber, transactionId) are required');
    }
  } else if (paymentMethod === 'BANK_TRANSFER') {
    if (!paymentDetails.bankName || !paymentDetails.bankTxnReference) {
      throw new BadRequestError('Bank transfer details (bankName, transactionReference) are required');
    }
  }

  if (!paymentDetails.proofOfPaymentUrl) {
    throw new BadRequestError('Proof of payment URL is required');
  }

  const totalCost = quantity * COST_PER_BRANCH;

  try {
    // Create the order
    const order = await prisma.branchPaymentOrder.create({
      data: {
        companyId,
        quantity,
        costPerBranch: COST_PER_BRANCH,
        totalCost,
        status: 'PAYMENT_PENDING_APPROVAL',
        paymentMethod,
        network: paymentDetails.network,
        phoneNumber: paymentDetails.phoneNumber,
        mobileMoneyTxnId: paymentDetails.mobileMoneyTxnId,
        bankName: paymentDetails.bankName,
        accountNameUsed: paymentDetails.accountNameUsed,
        bankTxnReference: paymentDetails.bankTxnReference,
        transactionReference: paymentDetails.transactionReference,
        proofOfPaymentUrl: paymentDetails.proofOfPaymentUrl,
        paymentDate: new Date(paymentDetails.paymentDate),
        note: paymentDetails.note,
        branchRequests: {
          create: branches.map(branch => ({
            name: branch.name,
            address: branch.address || null,
            city: branch.city || null,
            region: branch.region || null,
            country: branch.country || 'Ghana',
            contactPhone: branch.contactPhone || null,
            contactEmail: branch.contactEmail || null,
            managerName: branch.managerName || null,
          })),
        },
      },
      include: {
        company: { select: { id: true, name: true, email: true } },
        branchRequests: true,
      },
    });

    logger.info(`Branch payment order created: ${order.id} for company ${companyId}, quantity: ${quantity}`);

    return order;
  } catch (err) {
    logger.error('Error creating branch order:', err);
    throw err;
  }
};

/**
 * Get all branch payment orders for a company
 * @param {string} companyId - Company ID
 * @param {object} query - Pagination and filter { page, limit, status }
 * @returns {object} Orders with pagination
 */
const getCompanyBranchOrders = async (companyId, query = {}) => {
  const { page = 1, limit = 10, status } = query;
  const skip = (page - 1) * limit;

  const where = { companyId };
  if (status) where.status = status;

  const [orders, total] = await Promise.all([
    prisma.branchPaymentOrder.findMany({
      where,
      skip,
      take: limit,
      include: {
        branchRequests: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.branchPaymentOrder.count({ where }),
  ]);

  return {
    data: orders,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get all branch payment orders (for super admin)
 * @param {object} query - Pagination and filter { page, limit, status, companyId }
 * @returns {object} Orders with pagination
 */
const getAllBranchOrders = async (query = {}) => {
  const { page = 1, limit = 10, status, companyId } = query;
  const skip = (page - 1) * limit;

  const where = {};
  if (status) where.status = status;
  if (companyId) where.companyId = companyId;

  const [orders, total] = await Promise.all([
    prisma.branchPaymentOrder.findMany({
      where,
      skip,
      take: limit,
      include: {
        company: { select: { id: true, name: true, email: true } },
        branchRequests: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.branchPaymentOrder.count({ where }),
  ]);

  return {
    data: orders,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get a single branch payment order
 * @param {string} orderId - Order ID
 * @param {string} companyId - Company ID (optional, for scope validation)
 * @returns {object} Branch payment order
 */
const getBranchOrder = async (orderId, companyId = null) => {
  const where = { id: orderId };
  if (companyId) where.companyId = companyId;

  const order = await prisma.branchPaymentOrder.findFirst({
    where,
    include: {
      company: { select: { id: true, name: true, email: true } },
      branchRequests: true,
    },
  });

  if (!order) throw new NotFoundError('Branch payment order not found');

  return order;
};

/**
 * Approve a branch payment order and create the branches
 * @param {string} orderId - Order ID
 * @param {string} adminId - Admin user ID
 * @param {object} data - Additional data { adminNotes }
 * @returns {object} Updated order with created branches
 */
const approveBranchOrder = async (orderId, adminId, data = {}) => {
  const order = await prisma.branchPaymentOrder.findUnique({
    where: { id: orderId },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          email: true,
          branchLimit: true,
          status: true,
          isActive: true,
        },
      },
      branchRequests: true,
    },
  });

  if (!order) throw new NotFoundError('Branch payment order not found');

  if (order.status !== 'PAYMENT_PENDING_APPROVAL') {
    throw new BadRequestError(`Cannot approve order with status: ${order.status}`);
  }

  // Validate company
  const company = order.company;
  if (!company.isActive || company.status !== 'APPROVED') {
    throw new BadRequestError('Company account is not active');
  }

  try {
    // Create the branches
    const createdBranches = [];
    const { generateSlug, generateBranchCode } = require('../../utils/helpers');

    for (const branchRequest of order.branchRequests) {
      const slug = generateSlug(branchRequest.name);
      const code = generateBranchCode(branchRequest.name);

      const branch = await prisma.branch.create({
        data: {
          companyId: company.id,
          name: branchRequest.name,
          code,
          slug,
          address: branchRequest.address,
          city: branchRequest.city,
          region: branchRequest.region,
          country: branchRequest.country,
          contactPhone: branchRequest.contactPhone,
          contactEmail: branchRequest.contactEmail,
          managerName: branchRequest.managerName,
        },
      });

      createdBranches.push(branch.id);

      // Update the branch request with the created branch ID
      await prisma.branchRequest.update({
        where: { id: branchRequest.id },
        data: { branchId: branch.id },
      });
    }

    // Update the order status
    const updatedOrder = await prisma.branchPaymentOrder.update({
      where: { id: orderId },
      data: {
        status: 'COMPLETED',
        reviewedBy: adminId,
        reviewNotes: data.adminNotes,
        reviewedAt: new Date(),
        createdBranchIds: createdBranches.join(','),
        completedAt: new Date(),
      },
      include: {
        company: { select: { id: true, name: true, email: true } },
        branchRequests: true,
      },
    });

    logger.info(
      `Branch payment order approved and completed: ${orderId}, ${createdBranches.length} branches created`
    );

    return updatedOrder;
  } catch (err) {
    logger.error('Error approving branch order:', err);
    throw err;
  }
};

/**
 * Reject a branch payment order
 * @param {string} orderId - Order ID
 * @param {string} adminId - Admin user ID
 * @param {object} data - { rejectionReason, adminNotes }
 * @returns {object} Updated order
 */
const rejectBranchOrder = async (orderId, adminId, data = {}) => {
  const order = await prisma.branchPaymentOrder.findUnique({
    where: { id: orderId },
  });

  if (!order) throw new NotFoundError('Branch payment order not found');

  if (order.status === 'COMPLETED' || order.status === 'REJECTED') {
    throw new BadRequestError(`Cannot reject order with status: ${order.status}`);
  }

  const updatedOrder = await prisma.branchPaymentOrder.update({
    where: { id: orderId },
    data: {
      status: 'REJECTED',
      reviewedBy: adminId,
      reviewNotes: data.adminNotes,
      rejectionReason: data.rejectionReason,
      reviewedAt: new Date(),
    },
    include: {
      company: { select: { id: true, name: true, email: true } },
      branchRequests: true,
    },
  });

  logger.info(`Branch payment order rejected: ${orderId}`);

  return updatedOrder;
};

/**
 * Calculate total cost for branches
 * @param {number} quantity - Number of branches
 * @returns {object} Cost breakdown
 */
const calculateBranchCost = (quantity) => {
  if (quantity < 1) {
    throw new BadRequestError('Quantity must be at least 1');
  }

  const costPerBranch = COST_PER_BRANCH;
  const totalCost = quantity * costPerBranch;

  return {
    quantity,
    costPerBranch,
    totalCost,
    currency: 'GHS',
  };
};

module.exports = {
  createBranchOrder,
  getCompanyBranchOrders,
  getAllBranchOrders,
  getBranchOrder,
  approveBranchOrder,
  rejectBranchOrder,
  calculateBranchCost,
  COST_PER_BRANCH,
};
