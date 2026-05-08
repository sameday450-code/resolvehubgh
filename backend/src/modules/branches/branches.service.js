const prisma = require('../../config/database');
const { getPaginationParams, buildPaginationMeta, generateSlug, generateBranchCode } = require('../../utils/helpers');
const { NotFoundError, BadRequestError } = require('../../utils/errors');

const getBranches = async (companyId, query) => {
  const { page, limit, skip } = getPaginationParams(query);
  const where = { companyId };

  if (query.status) where.status = query.status;
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { code: { contains: query.search, mode: 'insensitive' } },
      { city: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  const [branches, total] = await Promise.all([
    prisma.branch.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { complaints: true, qrCodes: true, complaintPoints: true } },
      },
    }),
    prisma.branch.count({ where }),
  ]);

  return { branches, pagination: buildPaginationMeta(total, page, limit) };
};

const getBranchById = async (companyId, branchId) => {
  const branch = await prisma.branch.findFirst({
    where: { id: branchId, companyId },
    include: {
      complaintPoints: { orderBy: { createdAt: 'asc' } },
      _count: { select: { complaints: true, qrCodes: true } },
    },
  });
  if (!branch) throw new NotFoundError('Branch not found');
  return branch;
};

const createBranch = async (companyId, data) => {
  const slug = generateSlug(data.name);
  const code = data.code || generateBranchCode(data.name);

  // Fetch company with subscription for status enforcement
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      id: true,
      isActive: true,
      status: true,
      isDashboardLocked: true,
      branchLimit: true,
      subscription: {
        select: {
          status: true,
          trialEndsAt: true,
        },
      },
    },
  });

  if (!company) throw new NotFoundError('Company not found');

  // Company must be approved, active, and dashboard unlocked
  if (company.status !== 'APPROVED' || !company.isActive || company.isDashboardLocked) {
    throw new BadRequestError('Your company account is not active yet.');
  }

  const sub = company.subscription;

  // No subscription record — company was never fully activated
  if (!sub) {
    throw new BadRequestError('Your company account is not active yet.');
  }

  const now = new Date();
  const { status: subStatus, trialEndsAt } = sub;

  if (subStatus === 'TRIALING') {
    // Check if trial has expired
    if (trialEndsAt && new Date(trialEndsAt) < now) {
      throw new BadRequestError(
        'Your free trial has expired. Please activate a subscription.'
      );
    }
    // Trial active — enforce 1 branch limit
    const branchCount = await prisma.branch.count({ where: { companyId } });
    if (branchCount >= 1) {
      throw new BadRequestError(
        'Your free trial allows only 1 branch. Upgrade to add more branches.'
      );
    }
  } else if (subStatus === 'ACTIVE') {
    // Paid subscription — use company.branchLimit
    const branchCount = await prisma.branch.count({ where: { companyId } });
    if (branchCount >= company.branchLimit) {
      throw new BadRequestError(
        `You have reached your branch limit (${company.branchLimit}). Please upgrade your plan to add more branches.`
      );
    }
  } else {
    // PENDING_ACTIVATION, PENDING_PAYMENT, EXPIRED, CANCELLED, PAST_DUE
    throw new BadRequestError('Your company account is not active yet.');
  }

  const branch = await prisma.branch.create({
    data: {
      companyId,
      name: data.name,
      code,
      slug,
      address: data.address,
      city: data.city,
      region: data.region,
      country: data.country,
      contactPhone: data.contactPhone,
      contactEmail: data.contactEmail,
      managerName: data.managerName,
    },
  });

  return branch;
};

const updateBranch = async (companyId, branchId, data) => {
  const existing = await prisma.branch.findFirst({ where: { id: branchId, companyId } });
  if (!existing) throw new NotFoundError('Branch not found');

  const branch = await prisma.branch.update({
    where: { id: branchId },
    data: {
      name: data.name,
      address: data.address,
      city: data.city,
      region: data.region,
      country: data.country,
      contactPhone: data.contactPhone,
      contactEmail: data.contactEmail,
      managerName: data.managerName,
      status: data.status,
    },
  });

  return branch;
};

const deleteBranch = async (companyId, branchId) => {
  const existing = await prisma.branch.findFirst({ where: { id: branchId, companyId } });
  if (!existing) throw new NotFoundError('Branch not found');

  const complaintCount = await prisma.complaint.count({ where: { branchId } });
  if (complaintCount > 0) {
    throw new BadRequestError(
      `Cannot delete branch with ${complaintCount} complaints. Disable it instead.`
    );
  }

  await prisma.branch.delete({ where: { id: branchId } });
};

// Complaint Points
const getComplaintPoints = async (companyId, branchId) => {
  const branch = await prisma.branch.findFirst({ where: { id: branchId, companyId } });
  if (!branch) throw new NotFoundError('Branch not found');

  return prisma.complaintPoint.findMany({
    where: { branchId },
    include: { _count: { select: { qrCodes: true, complaints: true } } },
    orderBy: { createdAt: 'asc' },
  });
};

const createComplaintPoint = async (companyId, branchId, data) => {
  const branch = await prisma.branch.findFirst({ where: { id: branchId, companyId } });
  if (!branch) throw new NotFoundError('Branch not found');

  const slug = generateSlug(data.name);

  return prisma.complaintPoint.create({
    data: {
      branchId,
      name: data.name,
      slug,
    },
  });
};

const deleteComplaintPoint = async (companyId, branchId, pointId) => {
  const branch = await prisma.branch.findFirst({ where: { id: branchId, companyId } });
  if (!branch) throw new NotFoundError('Branch not found');

  const point = await prisma.complaintPoint.findFirst({ where: { id: pointId, branchId } });
  if (!point) throw new NotFoundError('Complaint point not found');

  await prisma.complaintPoint.delete({ where: { id: pointId } });
};

module.exports = {
  getBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch,
  getComplaintPoints,
  createComplaintPoint,
  deleteComplaintPoint,
};
