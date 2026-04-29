const prisma = require('../../config/database');
const { getPaginationParams, buildPaginationMeta } = require('../../utils/helpers');
const { NotFoundError, BadRequestError } = require('../../utils/errors');
const emailService = require('../../utils/emailService');

const getDashboardOverview = async () => {
  const [
    totalCompanies,
    pendingApprovals,
    approvedCompanies,
    suspendedCompanies,
    rejectedCompanies,
    totalComplaints,
    complaintsToday,
    activeQRCodes,
    totalUsers,
  ] = await Promise.all([
    prisma.company.count(),
    prisma.company.count({ where: { status: 'PENDING' } }),
    prisma.company.count({ where: { status: 'APPROVED' } }),
    prisma.company.count({ where: { status: 'SUSPENDED' } }),
    prisma.company.count({ where: { status: 'REJECTED' } }),
    prisma.complaint.count(),
    prisma.complaint.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    prisma.qRCode.count({ where: { status: 'ACTIVE' } }),
    prisma.user.count({ where: { role: { not: 'SUPER_ADMIN' } } }),
  ]);

  // Companies by industry
  const industriesRaw = await prisma.company.groupBy({
    by: ['industry'],
    _count: { id: true },
    where: { industry: { not: null } },
  });

  const companiesByIndustry = industriesRaw.map((i) => ({
    industry: i.industry,
    count: i._count.id,
  }));

  // Recent registrations (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentRegistrations = await prisma.company.count({
    where: { createdAt: { gte: thirtyDaysAgo } },
  });

  // Recent activity
  const recentActivity = await prisma.activityLog.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { fullName: true, email: true } },
    },
  });

  // Complaint status counts
  const [openComplaints, resolvedComplaints, totalBranches] = await Promise.all([
    prisma.complaint.count({ where: { status: { in: ['NEW', 'ACKNOWLEDGED', 'IN_REVIEW', 'ASSIGNED'] } } }),
    prisma.complaint.count({ where: { status: 'RESOLVED' } }),
    prisma.branch.count(),
  ]);

  // Recent pending companies (for Pending Approvals list)
  const recentPendingCompanies = await prisma.company.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, name: true, email: true, industry: true, createdAt: true },
  });

  // Recently registered companies (all statuses)
  const recentCompanies = await prisma.company.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, name: true, industry: true, status: true, createdAt: true },
  });

  return {
    totalCompanies,
    pendingApprovals,
    pendingCompanies: pendingApprovals,
    activeCompanies: approvedCompanies,
    approvedCompanies,
    suspendedCompanies,
    rejectedCompanies,
    totalComplaints,
    openComplaints,
    resolvedComplaints,
    complaintsToday,
    activeQRCodes,
    totalUsers,
    totalBranches,
    companiesByIndustry,
    recentRegistrations,
    recentActivity,
    recentPendingCompanies,
    recentCompanies,
  };
};

const getCompanies = async (query) => {
  const { page, limit, skip } = getPaginationParams(query);
  const where = {};

  if (query.status) {
    where.status = query.status;
  }

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { email: { contains: query.search, mode: 'insensitive' } },
      { city: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  if (query.industry) {
    where.industry = query.industry;
  }

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            branches: true,
            complaints: true,
            users: true,
            qrCodes: true,
          },
        },
      },
    }),
    prisma.company.count({ where }),
  ]);

  return { companies, pagination: buildPaginationMeta(total, page, limit) };
};

const getCompanyDetail = async (companyId) => {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      users: {
        select: { id: true, fullName: true, email: true, role: true, isActive: true, createdAt: true },
      },
      branches: {
        select: { id: true, name: true, code: true, city: true, status: true },
      },
      _count: {
        select: { complaints: true, qrCodes: true, branches: true, users: true },
      },
      approvalLogs: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      settings: true,
    },
  });

  if (!company) {
    throw new NotFoundError('Company not found');
  }

  // Get complaint stats
  const complaintStats = await prisma.complaint.groupBy({
    by: ['status'],
    where: { companyId },
    _count: { id: true },
  });

  return { ...company, complaintStats };
};

const approveCompany = async (companyId, adminId) => {
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) throw new NotFoundError('Company not found');
  if (company.status === 'APPROVED') throw new BadRequestError('Company is already approved');

  const updated = await prisma.$transaction(async (tx) => {
    const updatedCompany = await tx.company.update({
      where: { id: companyId },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        rejectionReason: null,
      },
    });

    await tx.approvalActionLog.create({
      data: {
        companyId,
        action: 'APPROVED',
        adminId,
      },
    });

    // Notify company admin
    const companyAdmins = await tx.user.findMany({
      where: { companyId, role: 'COMPANY_ADMIN' },
    });

    for (const admin of companyAdmins) {
      await tx.notification.create({
        data: {
          userId: admin.id,
          companyId,
          type: 'COMPANY_APPROVED',
          title: 'Company Approved',
          message: `Your company "${company.name}" has been approved. You can now log in and start using the platform.`,
        },
      });
    }

    await tx.activityLog.create({
      data: {
        userId: adminId,
        action: 'COMPANY_APPROVED',
        entity: 'Company',
        entityId: companyId,
        metadata: { companyName: company.name },
      },
    });

    return updatedCompany;
  });

  // Send approval email asynchronously (non-blocking)
  emailService.sendCompanyApprovedEmail(company);

  return updated;
};

const rejectCompany = async (companyId, adminId, reason) => {
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) throw new NotFoundError('Company not found');

  const updated = await prisma.$transaction(async (tx) => {
    const updatedCompany = await tx.company.update({
      where: { id: companyId },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date(),
        rejectionReason: reason,
      },
    });

    await tx.approvalActionLog.create({
      data: { companyId, action: 'REJECTED', adminId, reason },
    });

    const companyAdmins = await tx.user.findMany({
      where: { companyId, role: 'COMPANY_ADMIN' },
    });

    for (const admin of companyAdmins) {
      await tx.notification.create({
        data: {
          userId: admin.id,
          companyId,
          type: 'COMPANY_REJECTED',
          title: 'Company Rejected',
          message: `Your company "${company.name}" registration has been rejected.${reason ? ` Reason: ${reason}` : ''}`,
        },
      });
    }

    await tx.activityLog.create({
      data: {
        userId: adminId,
        action: 'COMPANY_REJECTED',
        entity: 'Company',
        entityId: companyId,
        metadata: { companyName: company.name, reason },
      },
    });

    return updatedCompany;
  });

  // Send rejection email asynchronously (non-blocking)
  emailService.sendCompanyRejectedEmail(company, reason);

  return updated;
};

const suspendCompany = async (companyId, adminId, reason) => {
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) throw new NotFoundError('Company not found');
  if (company.status === 'SUSPENDED') throw new BadRequestError('Company is already suspended');

  const updated = await prisma.$transaction(async (tx) => {
    const updatedCompany = await tx.company.update({
      where: { id: companyId },
      data: { status: 'SUSPENDED', suspendedAt: new Date() },
    });

    await tx.approvalActionLog.create({
      data: { companyId, action: 'SUSPENDED', adminId, reason },
    });

    const companyAdmins = await tx.user.findMany({
      where: { companyId, role: 'COMPANY_ADMIN' },
    });

    for (const admin of companyAdmins) {
      await tx.notification.create({
        data: {
          userId: admin.id,
          companyId,
          type: 'COMPANY_SUSPENDED',
          title: 'Company Suspended',
          message: `Your company "${company.name}" has been suspended.${reason ? ` Reason: ${reason}` : ''}`,
        },
      });
    }

    await tx.activityLog.create({
      data: {
        userId: adminId,
        action: 'COMPANY_SUSPENDED',
        entity: 'Company',
        entityId: companyId,
        metadata: { companyName: company.name, reason },
      },
    });

    return updatedCompany;
  });

  // Send suspension email asynchronously (non-blocking)
  emailService.sendCompanySuspendedEmail(company, reason);

  return updated;
};

const reactivateCompany = async (companyId, adminId) => {
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) throw new NotFoundError('Company not found');
  if (company.status === 'APPROVED') throw new BadRequestError('Company is already active');

  const updated = await prisma.$transaction(async (tx) => {
    const updatedCompany = await tx.company.update({
      where: { id: companyId },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        suspendedAt: null,
        rejectionReason: null,
      },
    });

    await tx.approvalActionLog.create({
      data: { companyId, action: 'REACTIVATED', adminId },
    });

    const companyAdmins = await tx.user.findMany({
      where: { companyId, role: 'COMPANY_ADMIN' },
    });

    for (const admin of companyAdmins) {
      await tx.notification.create({
        data: {
          userId: admin.id,
          companyId,
          type: 'COMPANY_REACTIVATED',
          title: 'Company Reactivated',
          message: `Your company "${company.name}" has been reactivated.`,
        },
      });
    }

    await tx.activityLog.create({
      data: {
        userId: adminId,
        action: 'COMPANY_REACTIVATED',
        entity: 'Company',
        entityId: companyId,
        metadata: { companyName: company.name },
      },
    });

    return updatedCompany;
  });

  // Send reactivation email asynchronously (non-blocking)
  emailService.sendCompanyReactivatedEmail(company);

  return updated;
};

const deleteCompany = async (companyId, adminId) => {
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) throw new NotFoundError('Company not found');

  await prisma.$transaction(async (tx) => {
    await tx.activityLog.create({
      data: {
        userId: adminId,
        action: 'COMPANY_DELETED',
        entity: 'Company',
        entityId: companyId,
        metadata: { companyName: company.name, companyEmail: company.email },
      },
    });

    await tx.company.delete({ where: { id: companyId } });
  });
};

const getPlatformAnalytics = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Registrations over time (last 30 days)
  const registrationsRaw = await prisma.company.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    select: { createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  const registrationsByDay = {};
  registrationsRaw.forEach((r) => {
    const day = r.createdAt.toISOString().split('T')[0];
    registrationsByDay[day] = (registrationsByDay[day] || 0) + 1;
  });

  // Complaints over time
  const complaintsRaw = await prisma.complaint.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    select: { createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  const complaintsByDay = {};
  complaintsRaw.forEach((c) => {
    const day = c.createdAt.toISOString().split('T')[0];
    complaintsByDay[day] = (complaintsByDay[day] || 0) + 1;
  });

  // Most active companies
  const activeCompanies = await prisma.complaint.groupBy({
    by: ['companyId'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 10,
  });

  const companyIds = activeCompanies.map((a) => a.companyId);
  const companies = await prisma.company.findMany({
    where: { id: { in: companyIds } },
    select: { id: true, name: true, industry: true },
  });

  const mostActiveCompanies = activeCompanies.map((a) => {
    const company = companies.find((c) => c.id === a.companyId);
    return {
      companyId: a.companyId,
      companyName: company?.name,
      industry: company?.industry,
      complaintCount: a._count.id,
    };
  });

  // Status distribution
  const statusDistribution = await prisma.complaint.groupBy({
    by: ['status'],
    _count: { id: true },
  });

  return {
    registrationsByDay: Object.entries(registrationsByDay).map(([date, count]) => ({ date, count })),
    complaintsByDay: Object.entries(complaintsByDay).map(([date, count]) => ({ date, count })),
    mostActiveCompanies,
    statusDistribution: statusDistribution.map((s) => ({
      status: s.status,
      count: s._count.id,
    })),
  };
};

const getSupportMessages = async (query) => {
  const { page, limit, skip } = getPaginationParams(query);
  const where = {};

  if (query.isRead !== undefined) {
    where.isRead = query.isRead === 'true';
  }

  const [messages, total] = await Promise.all([
    prisma.supportMessage.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.supportMessage.count({ where }),
  ]);

  return { messages, pagination: buildPaginationMeta(total, page, limit) };
};

module.exports = {
  getDashboardOverview,
  getCompanies,
  getCompanyDetail,
  approveCompany,
  rejectCompany,
  suspendCompany,
  reactivateCompany,
  deleteCompany,
  getPlatformAnalytics,
  getSupportMessages,
};
