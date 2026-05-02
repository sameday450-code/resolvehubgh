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

  // Check subscription status and trial limits
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      id: true,
      paymentStatus: true,
      isDashboardLocked: true,
      branchLimit: true,
      trialEndDate: true,
    },
  });

  if (!company) throw new NotFoundError('Company not found');

  // Check if dashboard is locked
  if (company.isDashboardLocked) {
    throw new BadRequestError(
      'Your trial has expired. Please activate your subscription to continue.'
    );
  }

  // Check if trial has expired
  if (
    company.trialEndDate &&
    new Date(company.trialEndDate) < new Date() &&
    company.paymentStatus !== 'MANUAL_APPROVED'
  ) {
    throw new BadRequestError(
      'Your trial has expired. Please activate your subscription to continue.'
    );
  }

  // Count existing branches
  const branchCount = await prisma.branch.count({ where: { companyId } });

  // Check branch limit
  if (branchCount >= company.branchLimit) {
    if (company.branchLimit === 1) {
      throw new BadRequestError(
        'Your free trial allows only 1 branch. Please activate your subscription to add more branches.'
      );
    } else {
      throw new BadRequestError(
        `You have reached your branch limit (${company.branchLimit}). Please upgrade your plan to add more branches.`
      );
    }
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
