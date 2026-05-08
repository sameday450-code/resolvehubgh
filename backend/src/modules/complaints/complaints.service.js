const prisma = require('../../config/database');
const {
  getPaginationParams,
  buildPaginationMeta,
  generateReferenceNumber,
} = require('../../utils/helpers');
const { NotFoundError, BadRequestError } = require('../../utils/errors');

const VALID_COMPLAINT_TYPES = ['COMPLAINT', 'FEEDBACK', 'SUGGESTION'];

// Public submission - no auth
const submitComplaint = async (data, ip) => {
  console.log('[submitComplaint] payload keys:', Object.keys(data));
  console.log('[submitComplaint] qrCodeId=%s companyId=%s branchId=%s type=%s',
    data.qrCodeId, data.companyId, data.branchId, data.type);

  // Normalise field aliases: subject → title, details → description
  const subject = (data.subject || data.title || '').trim();
  const description = (data.description || data.details || '').trim();
  const isAnonymous = data.isAnonymous === true || data.isAnonymous === 'true';

  // Normalise & validate type
  const rawType = (data.type || 'COMPLAINT').toString().toUpperCase();
  const type = VALID_COMPLAINT_TYPES.includes(rawType) ? rawType : 'COMPLAINT';

  // Validate required complaint content before hitting the DB
  if (!subject) {
    throw new BadRequestError('Subject is required.');
  }
  if (!description) {
    throw new BadRequestError('Description is required.');
  }

  // Resolve QR code — accept qrCodeId (preferred) or publicSlug (legacy)
  const QR_INCLUDE = {
    company: { include: { settings: true } },
    branch: true,
    complaintPoint: true,
  };

  let qrCode = null;
  if (data.qrCodeId) {
    qrCode = await prisma.qRCode.findUnique({ where: { id: data.qrCodeId }, include: QR_INCLUDE });
  } else if (data.publicSlug) {
    qrCode = await prisma.qRCode.findUnique({ where: { publicSlug: data.publicSlug }, include: QR_INCLUDE });
  }

  if (!qrCode) {
    throw new BadRequestError('Invalid QR code.');
  }

  // Guard: resolved QR must carry all three IDs
  if (!qrCode.id || !qrCode.companyId || !qrCode.branchId) {
    throw new BadRequestError('Invalid QR portal. Missing company, branch, or QR code reference.');
  }

  // If the frontend also sent explicit IDs, verify they match
  if (data.companyId && data.companyId !== qrCode.companyId) {
    throw new BadRequestError('Invalid QR portal. Missing company, branch, or QR code reference.');
  }
  if (data.branchId && data.branchId !== qrCode.branchId) {
    throw new BadRequestError('Invalid QR portal. Missing company, branch, or QR code reference.');
  }

  if (qrCode.status === 'DISABLED') {
    throw new BadRequestError('This QR code is disabled.');
  }

  if (qrCode.status !== 'ACTIVE') {
    throw new BadRequestError('Invalid or inactive QR code.');
  }

  if (qrCode.company.status !== 'APPROVED') {
    throw new BadRequestError('This company account is currently inactive.');
  }

  if (qrCode.company.isDashboardLocked) {
    throw new BadRequestError('This company account is currently inactive.');
  }

  // Rate limiting check (per IP, max 10 complaints per hour)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentCount = await prisma.complaint.count({
    where: {
      submitterIp: ip,
      createdAt: { gte: oneHourAgo },
    },
  });

  if (recentCount >= 10) {
    throw new BadRequestError('Too many submissions. Please try again later.');
  }

  const referenceNumber = generateReferenceNumber();

  console.log('[submitComplaint] creating complaint referenceNumber=%s companyId=%s branchId=%s type=%s',
    referenceNumber, qrCode.companyId, qrCode.branchId, type);

  const complaint = await prisma.complaint.create({
    data: {
      referenceNumber,
      companyId: qrCode.companyId,
      branchId: qrCode.branchId,
      complaintPointId: qrCode.complaintPointId || null,
      qrCodeId: qrCode.id,
      categoryId: data.categoryId || null,
      type,
      title: subject,
      description,
      customerName: isAnonymous ? null : (data.customerName || null),
      customerEmail: isAnonymous ? null : (data.customerEmail || null),
      customerPhone: isAnonymous ? null : (data.customerPhone || null),
      isAnonymous,
      status: qrCode.company.settings?.autoAcknowledge ? 'ACKNOWLEDGED' : 'NEW',
      acknowledgedAt: qrCode.company.settings?.autoAcknowledge ? new Date() : null,
      submitterIp: ip,
    },
  });

  // Save attachments if any were uploaded
  if (Array.isArray(data.attachments) && data.attachments.length > 0) {
    await addAttachments(complaint.id, data.attachments);
  }

  // Create notification for company admins
  const companyAdmins = await prisma.user.findMany({
    where: { companyId: qrCode.companyId, role: { in: ['COMPANY_ADMIN', 'COMPANY_STAFF'] } },
  });

  for (const admin of companyAdmins) {
    await prisma.notification.create({
      data: {
        userId: admin.id,
        companyId: qrCode.companyId,
        type: type === 'FEEDBACK' ? 'NEW_FEEDBACK' : 'NEW_COMPLAINT',
        title: type === 'FEEDBACK' ? 'New Feedback Received' : 'New Complaint Received',
        message: `${type === 'FEEDBACK' ? 'Feedback' : 'Complaint'} "${subject}" submitted at ${qrCode.branch.name}${qrCode.complaintPoint ? ` - ${qrCode.complaintPoint.name}` : ''}.`,
        data: {
          complaintId: complaint.id,
          referenceNumber,
          branchName: qrCode.branch.name,
        },
      },
    });
  }

  return {
    referenceNumber: complaint.referenceNumber,
    status: complaint.status,
    companyId: qrCode.companyId,
    companyName: qrCode.company.name,
    branchName: qrCode.branch.name,
  };
};

const addAttachments = async (complaintId, files) => {
  const attachments = [];
  for (const file of files) {
    const attachment = await prisma.complaintAttachment.create({
      data: {
        complaintId,
        fileUrl: file.url,
        fileName: file.originalName,
        fileType: file.mimetype,
        fileSize: file.size,
      },
    });
    attachments.push(attachment);
  }
  return attachments;
};

// Company-scoped queries
const getComplaints = async (companyId, query) => {
  const { page, limit, skip } = getPaginationParams(query);
  const where = { companyId };

  if (query.status) where.status = query.status;
  if (query.priority) where.priority = query.priority;
  if (query.type) where.type = query.type;
  if (query.branchId) where.branchId = query.branchId;
  if (query.categoryId) where.categoryId = query.categoryId;
  if (query.assignedToId) where.assignedToId = query.assignedToId;

  if (query.dateFrom || query.dateTo) {
    where.createdAt = {};
    if (query.dateFrom) where.createdAt.gte = new Date(query.dateFrom);
    if (query.dateTo) where.createdAt.lte = new Date(query.dateTo);
  }

  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
      { referenceNumber: { contains: query.search, mode: 'insensitive' } },
      { customerName: { contains: query.search, mode: 'insensitive' } },
      { customerEmail: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  const orderBy = {};
  if (query.sortBy) {
    orderBy[query.sortBy] = query.sortOrder === 'asc' ? 'asc' : 'desc';
  } else {
    orderBy.createdAt = 'desc';
  }

  const [complaints, total] = await Promise.all([
    prisma.complaint.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        branch: { select: { name: true, code: true } },
        complaintPoint: { select: { name: true } },
        category: { select: { name: true } },
        assignedTo: { select: { id: true, fullName: true } },
        _count: { select: { attachments: true, notes: true } },
      },
    }),
    prisma.complaint.count({ where }),
  ]);

  return { complaints, pagination: buildPaginationMeta(total, page, limit) };
};

const getComplaintById = async (companyId, complaintId) => {
  const complaint = await prisma.complaint.findFirst({
    where: { id: complaintId, companyId },
    include: {
      branch: { select: { name: true, code: true, city: true } },
      complaintPoint: { select: { name: true } },
      category: { select: { name: true, slug: true } },
      assignedTo: { select: { id: true, fullName: true, email: true } },
      attachments: { orderBy: { createdAt: 'asc' } },
      notes: {
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { fullName: true, avatarUrl: true } } },
      },
      qrCode: { select: { label: true, publicSlug: true } },
    },
  });

  if (!complaint) throw new NotFoundError('Complaint not found');
  return complaint;
};

const updateComplaintStatus = async (companyId, complaintId, status, userId) => {
  const complaint = await prisma.complaint.findFirst({
    where: { id: complaintId, companyId },
  });
  if (!complaint) throw new NotFoundError('Complaint not found');

  const updateData = { status };
  if (status === 'ACKNOWLEDGED') updateData.acknowledgedAt = new Date();
  if (status === 'RESOLVED') updateData.resolvedAt = new Date();
  if (status === 'CLOSED') updateData.closedAt = new Date();

  const updated = await prisma.$transaction(async (tx) => {
    const updatedComplaint = await tx.complaint.update({
      where: { id: complaintId },
      data: updateData,
    });

    await tx.activityLog.create({
      data: {
        userId,
        companyId,
        action: 'COMPLAINT_STATUS_CHANGED',
        entity: 'Complaint',
        entityId: complaintId,
        metadata: { from: complaint.status, to: status, referenceNumber: complaint.referenceNumber },
      },
    });

    return updatedComplaint;
  });

  return updated;
};

const assignComplaint = async (companyId, complaintId, assignedToId, userId) => {
  const complaint = await prisma.complaint.findFirst({
    where: { id: complaintId, companyId },
  });
  if (!complaint) throw new NotFoundError('Complaint not found');

  // Verify assignee belongs to same company
  const assignee = await prisma.user.findFirst({
    where: { id: assignedToId, companyId },
  });
  if (!assignee) throw new BadRequestError('Invalid assignee');

  const updated = await prisma.$transaction(async (tx) => {
    const updatedComplaint = await tx.complaint.update({
      where: { id: complaintId },
      data: {
        assignedToId,
        assignedAt: new Date(),
        status: complaint.status === 'NEW' ? 'ASSIGNED' : complaint.status,
      },
    });

    await tx.notification.create({
      data: {
        userId: assignedToId,
        companyId,
        type: 'COMPLAINT_ASSIGNED',
        title: 'Complaint Assigned to You',
        message: `Complaint "${complaint.title}" (${complaint.referenceNumber}) has been assigned to you.`,
        data: { complaintId, referenceNumber: complaint.referenceNumber },
      },
    });

    await tx.activityLog.create({
      data: {
        userId,
        companyId,
        action: 'COMPLAINT_ASSIGNED',
        entity: 'Complaint',
        entityId: complaintId,
        metadata: { assignedTo: assignee.fullName, referenceNumber: complaint.referenceNumber },
      },
    });

    return updatedComplaint;
  });

  return updated;
};

const updatePriority = async (companyId, complaintId, priority) => {
  const complaint = await prisma.complaint.findFirst({
    where: { id: complaintId, companyId },
  });
  if (!complaint) throw new NotFoundError('Complaint not found');

  return prisma.complaint.update({
    where: { id: complaintId },
    data: { priority },
  });
};

const addNote = async (companyId, complaintId, userId, content, isInternal = true) => {
  const complaint = await prisma.complaint.findFirst({
    where: { id: complaintId, companyId },
  });
  if (!complaint) throw new NotFoundError('Complaint not found');

  return prisma.complaintNote.create({
    data: {
      complaintId,
      userId,
      content,
      isInternal,
    },
    include: {
      user: { select: { fullName: true, avatarUrl: true } },
    },
  });
};

// Dashboard stats
const getDashboardStats = async (companyId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalComplaints,
    openComplaints,
    resolvedComplaints,
    complaintsToday,
    feedbackCount,
    urgentCount,
  ] = await Promise.all([
    prisma.complaint.count({ where: { companyId } }),
    prisma.complaint.count({
      where: { companyId, status: { in: ['NEW', 'ACKNOWLEDGED', 'IN_REVIEW', 'ASSIGNED'] } },
    }),
    prisma.complaint.count({ where: { companyId, status: { in: ['RESOLVED', 'CLOSED'] } } }),
    prisma.complaint.count({ where: { companyId, createdAt: { gte: today } } }),
    prisma.complaint.count({ where: { companyId, type: 'FEEDBACK' } }),
    prisma.complaint.count({ where: { companyId, priority: 'URGENT', status: { notIn: ['RESOLVED', 'CLOSED', 'ARCHIVED'] } } }),
  ]);

  // By status
  const byStatus = await prisma.complaint.groupBy({
    by: ['status'],
    where: { companyId },
    _count: { id: true },
  });

  // By category
  const byCategory = await prisma.complaint.groupBy({
    by: ['categoryId'],
    where: { companyId, categoryId: { not: null } },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 10,
  });

  const categoryIds = byCategory.map((c) => c.categoryId);
  const categories = await prisma.complaintCategory.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, name: true },
  });

  const byCategoryWithNames = byCategory.map((c) => ({
    category: categories.find((cat) => cat.id === c.categoryId)?.name || 'Unknown',
    count: c._count.id,
  }));

  // By branch
  const byBranch = await prisma.complaint.groupBy({
    by: ['branchId'],
    where: { companyId },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 10,
  });

  const branchIds = byBranch.map((b) => b.branchId);
  const branches = await prisma.branch.findMany({
    where: { id: { in: branchIds } },
    select: { id: true, name: true },
  });

  const byBranchWithNames = byBranch.map((b) => ({
    branch: branches.find((br) => br.id === b.branchId)?.name || 'Unknown',
    count: b._count.id,
  }));

  // Recent complaints
  const recentComplaints = await prisma.complaint.findMany({
    where: { companyId },
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      branch: { select: { name: true } },
      category: { select: { name: true } },
    },
  });

  // Average resolution time (in hours)
  const resolvedComps = await prisma.complaint.findMany({
    where: { companyId, resolvedAt: { not: null } },
    select: { createdAt: true, resolvedAt: true },
  });

  let avgResolutionHours = 0;
  if (resolvedComps.length > 0) {
    const totalHours = resolvedComps.reduce((sum, c) => {
      return sum + (c.resolvedAt.getTime() - c.createdAt.getTime()) / (1000 * 60 * 60);
    }, 0);
    avgResolutionHours = Math.round((totalHours / resolvedComps.length) * 10) / 10;
  }

  return {
    totalComplaints,
    openComplaints,
    resolvedComplaints,
    complaintsToday,
    feedbackCount,
    urgentCount,
    avgResolutionHours,
    byStatus: byStatus.map((s) => ({ status: s.status, count: s._count.id })),
    byCategory: byCategoryWithNames,
    byBranch: byBranchWithNames,
    recentComplaints,
  };
};

module.exports = {
  submitComplaint,
  addAttachments,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  assignComplaint,
  updatePriority,
  addNote,
  getDashboardStats,
};
