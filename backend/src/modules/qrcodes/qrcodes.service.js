const QRCode = require('qrcode');
const prisma = require('../../config/database');
const config = require('../../config');
const { generatePublicSlug, getPaginationParams, buildPaginationMeta } = require('../../utils/helpers');
const { NotFoundError, BadRequestError } = require('../../utils/errors');

const generateQRCode = async (companyId, data) => {
  // Verify branch belongs to company
  const branch = await prisma.branch.findFirst({
    where: { id: data.branchId, companyId },
  });
  if (!branch) throw new NotFoundError('Branch not found');

  // Verify complaint point if provided
  if (data.complaintPointId) {
    const point = await prisma.complaintPoint.findFirst({
      where: { id: data.complaintPointId, branchId: data.branchId },
    });
    if (!point) throw new NotFoundError('Complaint point not found');
  }

  const publicSlug = generatePublicSlug();
  const publicUrl = `${config.frontendUrl}/report/${publicSlug}`;

  // Generate QR code as data URL
  const qrDataUrl = await QRCode.toDataURL(publicUrl, {
    width: 400,
    margin: 2,
    color: { dark: '#000000', light: '#FFFFFF' },
    errorCorrectionLevel: 'H',
  });

  const qrCode = await prisma.qRCode.create({
    data: {
      companyId,
      branchId: data.branchId,
      complaintPointId: data.complaintPointId || null,
      publicSlug,
      label: data.label || `${branch.name}${data.complaintPointId ? '' : ' QR'}`,
      qrImageUrl: qrDataUrl,
    },
    include: {
      branch: { select: { name: true, code: true } },
      complaintPoint: { select: { name: true } },
    },
  });

  return qrCode;
};

const getQRCodes = async (companyId, query) => {
  const { page, limit, skip } = getPaginationParams(query);
  const where = { companyId };

  if (query.branchId) where.branchId = query.branchId;
  if (query.status) where.status = query.status;
  if (query.search) {
    where.OR = [
      { label: { contains: query.search, mode: 'insensitive' } },
      { publicSlug: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  const [qrCodes, total] = await Promise.all([
    prisma.qRCode.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        branch: { select: { name: true, code: true, city: true } },
        complaintPoint: { select: { name: true } },
        _count: { select: { complaints: true } },
      },
    }),
    prisma.qRCode.count({ where }),
  ]);

  return { qrCodes, pagination: buildPaginationMeta(total, page, limit) };
};

const getQRCodeById = async (companyId, qrCodeId) => {
  const qrCode = await prisma.qRCode.findFirst({
    where: { id: qrCodeId, companyId },
    include: {
      branch: { select: { name: true, code: true, city: true } },
      complaintPoint: { select: { name: true } },
      company: { select: { name: true, slug: true } },
      _count: { select: { complaints: true } },
    },
  });
  if (!qrCode) throw new NotFoundError('QR code not found');
  return qrCode;
};

const disableQRCode = async (companyId, qrCodeId) => {
  const qrCode = await prisma.qRCode.findFirst({ where: { id: qrCodeId, companyId } });
  if (!qrCode) throw new NotFoundError('QR code not found');

  return prisma.qRCode.update({
    where: { id: qrCodeId },
    data: { status: 'DISABLED' },
  });
};

const enableQRCode = async (companyId, qrCodeId) => {
  const qrCode = await prisma.qRCode.findFirst({ where: { id: qrCodeId, companyId } });
  if (!qrCode) throw new NotFoundError('QR code not found');

  return prisma.qRCode.update({
    where: { id: qrCodeId },
    data: { status: 'ACTIVE' },
  });
};

const regenerateQRCode = async (companyId, qrCodeId) => {
  const existing = await prisma.qRCode.findFirst({ where: { id: qrCodeId, companyId } });
  if (!existing) throw new NotFoundError('QR code not found');

  const newPublicSlug = generatePublicSlug();
  const publicUrl = `${config.frontendUrl}/report/${newPublicSlug}`;

  const qrDataUrl = await QRCode.toDataURL(publicUrl, {
    width: 400,
    margin: 2,
    color: { dark: '#000000', light: '#FFFFFF' },
    errorCorrectionLevel: 'H',
  });

  return prisma.qRCode.update({
    where: { id: qrCodeId },
    data: {
      publicSlug: newPublicSlug,
      qrImageUrl: qrDataUrl,
      status: 'ACTIVE',
    },
  });
};

const deleteQRCode = async (companyId, qrCodeId) => {
  const qrCode = await prisma.qRCode.findFirst({ where: { id: qrCodeId, companyId } });
  if (!qrCode) throw new NotFoundError('QR code not found');

  const complaintCount = await prisma.complaint.count({ where: { qrCodeId } });
  if (complaintCount > 0) {
    throw new BadRequestError('Cannot delete QR code with linked complaints. Disable it instead.');
  }

  await prisma.qRCode.delete({ where: { id: qrCodeId } });
};

// Public resolution - no auth needed
const resolvePublicQR = async (publicSlug) => {
  const qrCode = await prisma.qRCode.findUnique({
    where: { publicSlug },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
          brandColor: true,
          status: true,
          settings: {
            select: {
              allowAnonymous: true,
              customWelcomeMessage: true,
            },
          },
        },
      },
      branch: { select: { id: true, name: true, city: true } },
      complaintPoint: { select: { id: true, name: true } },
    },
  });

  if (!qrCode) return { valid: false, reason: 'invalid' };
  if (qrCode.status === 'DISABLED') return { valid: false, reason: 'disabled' };
  if (qrCode.status === 'EXPIRED') return { valid: false, reason: 'expired' };
  if (qrCode.company.status !== 'APPROVED') return { valid: false, reason: 'company_inactive' };

  // Update scan count
  await prisma.qRCode.update({
    where: { id: qrCode.id },
    data: { scanCount: { increment: 1 }, lastScannedAt: new Date() },
  });

  // Get categories for this company
  const categories = await prisma.complaintCategory.findMany({
    where: {
      OR: [{ companyId: qrCode.company.id }, { isDefault: true, companyId: null }],
      isActive: true,
    },
    select: { id: true, name: true, slug: true },
    orderBy: { name: 'asc' },
  });

  return {
    valid: true,
    data: {
      company: {
        name: qrCode.company.name,
        logoUrl: qrCode.company.logoUrl,
        brandColor: qrCode.company.brandColor,
        welcomeMessage: qrCode.company.settings?.customWelcomeMessage,
        allowAnonymous: qrCode.company.settings?.allowAnonymous ?? true,
      },
      branch: qrCode.branch,
      complaintPoint: qrCode.complaintPoint,
      qrCodeId: qrCode.id,
      companyId: qrCode.company.id,
      categories,
    },
  };
};

// Generate QR as SVG string
const getQRCodeSVG = async (publicSlug) => {
  const publicUrl = `${config.frontendUrl}/report/${publicSlug}`;
  return QRCode.toString(publicUrl, {
    type: 'svg',
    width: 400,
    margin: 2,
    errorCorrectionLevel: 'H',
  });
};

module.exports = {
  generateQRCode,
  getQRCodes,
  getQRCodeById,
  disableQRCode,
  enableQRCode,
  regenerateQRCode,
  deleteQRCode,
  resolvePublicQR,
  getQRCodeSVG,
};
