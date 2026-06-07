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

  // Transform response to include all necessary fields with correct names
  return {
    ...company,
    complaintStats,
    // Ensure contact fields are mapped correctly
    contactEmail: company.contactEmail || company.email,
    contactPhone: company.contactPhone || company.phone,
    website: company.website || null,
    // Ensure subscription fields are present
    plan: company.plan || 'STARTER',
    planName: company.planName || 'Free Trial',
    subscriptionStatus: company.subscriptionStatus || 'TRIAL',
    paymentStatus: company.paymentStatus || 'UNPAID',
    branchLimit: company.branchLimit || 1,
    trialStartDate: company.trialStartDate,
    trialEndDate: company.trialEndDate,
    subscriptionStartDate: company.subscriptionStartDate,
    subscriptionEndDate: company.subscriptionEndDate,
    isActive: company.isActive || false,
    isLocked: company.isLocked || false,
    isDashboardLocked: company.isDashboardLocked || false,
  };
};

const approveCompany = async (companyId, adminId) => {
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) throw new NotFoundError('Company not found');
  if (company.status === 'APPROVED') throw new BadRequestError('Company is already approved');

  // Calculate 14-day trial period
  const trialStartDate = new Date();
  const trialEndDate = new Date(trialStartDate);
  trialEndDate.setDate(trialEndDate.getDate() + 14);

  const updated = await prisma.$transaction(async (tx) => {
    const updatedCompany = await tx.company.update({
      where: { id: companyId },
      data: {
        status: 'APPROVED',
        isActive: true,
        approvedAt: new Date(),
        rejectedAt: null,
        rejectionReason: null,
        // Start 14-day free trial
        trialStartDate,
        trialEndDate,
        subscriptionStatus: 'TRIAL',
        paymentStatus: 'UNPAID',
        paymentProvider: 'MANUAL',
        isDashboardLocked: false,
        isLocked: false,
        branchLimit: 1, // Only 1 branch during trial
        planName: 'Free Trial',
      },
    });

    // FIX: Also update or create CompanySubscription with TRIALING status
    // This ensures billing guard checks pass for read operations
    let existingSubscription = await tx.companySubscription.findUnique({
      where: { companyId },
    });

    if (existingSubscription) {
      // Update existing subscription to TRIALING
      await tx.companySubscription.update({
        where: { companyId },
        data: {
          status: 'TRIALING',
          trialStartedAt: trialStartDate,
          trialEndsAt: trialEndDate,
          activatedAt: trialStartDate,
        },
      });
    } else {
      // Ensure the STARTER_TRIAL plan exists — create it if missing so the
      // subscription can always be created (subscriptionPlanId is required).
      let starterPlan = await tx.subscriptionPlan.findFirst({
        where: { planType: 'STARTER_TRIAL' },
      });

      if (!starterPlan) {
        starterPlan = await tx.subscriptionPlan.create({
          data: {
            name: 'Free Trial',
            slug: 'starter-trial',
            planType: 'STARTER_TRIAL',
            price: 0,
            currency: 'GHS',
            trialDays: 14,
            maxBranches: 1,
            maxQRCodes: 5,
            maxStaff: 3,
            features: ['1 Branch', 'QR Code Generation', 'Complaint Management'],
            isActive: true,
          },
        });
      }

      await tx.companySubscription.create({
        data: {
          companyId,
          subscriptionPlanId: starterPlan.id,
          status: 'TRIALING',
          trialStartedAt: trialStartDate,
          trialEndsAt: trialEndDate,
          activatedAt: trialStartDate,
          paymentStatus: 'UNPAID',
          paymentProvider: 'MANUAL',
        },
      });
    }

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
          title: 'Company Approved - Trial Started',
          message: `Your company "${company.name}" has been approved! Your 14-day free trial has started. You can now log in and create 1 branch to test the platform.`,
        },
      });
    }

    await tx.activityLog.create({
      data: {
        userId: adminId,
        action: 'COMPANY_APPROVED',
        entity: 'Company',
        entityId: companyId,
        metadata: { companyName: company.name, trialStartDate, trialEndDate },
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
        rejectedAt: null,
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
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  // Company status distribution
  const companyStatusDist = await prisma.company.groupBy({
    by: ['status'],
    _count: { id: true },
  });

  const companyStatusMap = {};
  companyStatusDist.forEach((s) => {
    companyStatusMap[s.status] = s._count.id;
  });

  // Complaint status distribution
  const complaintStatusDist = await prisma.complaint.groupBy({
    by: ['status'],
    _count: { id: true },
  });

  const complaintStatusMap = {};
  complaintStatusDist.forEach((s) => {
    complaintStatusMap[s.status] = s._count.id;
  });

  // Monthly registrations (last 6 months)
  const registrationsRaw = await prisma.company.findMany({
    where: { createdAt: { gte: sixMonthsAgo } },
    select: { createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  const registrationsByMonth = {};
  registrationsRaw.forEach((r) => {
    const d = r.createdAt;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    registrationsByMonth[key] = (registrationsByMonth[key] || 0) + 1;
  });

  const monthlyRegistrations = Object.entries(registrationsByMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, count]) => {
      const [year, month] = key.split('-');
      const label = new Date(Number(year), Number(month) - 1).toLocaleString('en-US', { month: 'short', year: 'numeric' });
      return { month: label, count };
    });

  // Top companies by complaint count
  const topCompaniesByComplaints = await prisma.complaint.groupBy({
    by: ['companyId'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 10,
  });

  const topCompanyIds = topCompaniesByComplaints.map((a) => a.companyId);
  const topCompanyRecords = await prisma.company.findMany({
    where: { id: { in: topCompanyIds } },
    select: { id: true, name: true },
  });

  const topCompanies = topCompaniesByComplaints.map((a) => {
    const company = topCompanyRecords.find((c) => c.id === a.companyId);
    return { name: company?.name || 'Unknown', complaints: a._count.id };
  });

  return {
    activeCompanies: companyStatusMap['APPROVED'] || 0,
    pendingCompanies: companyStatusMap['PENDING'] || 0,
    suspendedCompanies: companyStatusMap['SUSPENDED'] || 0,
    rejectedCompanies: companyStatusMap['REJECTED'] || 0,
    openComplaints: (complaintStatusMap['NEW'] || 0) + (complaintStatusMap['ACKNOWLEDGED'] || 0),
    inProgressComplaints: (complaintStatusMap['IN_REVIEW'] || 0) + (complaintStatusMap['ASSIGNED'] || 0),
    resolvedComplaints: complaintStatusMap['RESOLVED'] || 0,
    closedComplaints: (complaintStatusMap['CLOSED'] || 0) + (complaintStatusMap['ARCHIVED'] || 0),
    monthlyRegistrations,
    topCompanies,
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

const listBranchPayments = async (query) => {
  const { page, limit, skip } = getPaginationParams(query);
  const where = {};

  if (query.status) {
    where.status = query.status;
  }

  const [data, total] = await Promise.all([
    prisma.branchPaymentOrder.findMany({
      where,
      skip,
      take: limit,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            email: true,
            plan: true,
            branchLimit: true,
          },
        },
      },
      orderBy: { requestedAt: 'desc' },
    }),
    prisma.branchPaymentOrder.count({ where }),
  ]);

  return { data, pagination: buildPaginationMeta(total, page, limit) };
};

const approveBranchPayment = async (paymentOrderId, adminId) => {
  const order = await prisma.branchPaymentOrder.findUnique({
    where: { id: paymentOrderId },
    include: { company: true },
  });

  if (!order) throw new NotFoundError('Payment order not found');
  if (order.status !== 'PENDING_APPROVAL') {
    throw new BadRequestError(`Cannot approve payment with status: ${order.status}`);
  }

  const company = order.company;

  // Update both the company branchLimit and mark payment as approved
  const updated = await prisma.$transaction(async (tx) => {
    // Increase branch limit
    const updatedCompany = await tx.company.update({
      where: { id: company.id },
      data: {
        branchLimit: company.branchLimit + order.branches,
      },
    });

    // Mark payment as approved
    const updatedOrder = await tx.branchPaymentOrder.update({
      where: { id: paymentOrderId },
      data: {
        status: 'COMPLETED',
        approvedAt: new Date(),
        approvedBy: adminId,
      },
    });

    // Log activity
    await tx.activityLog.create({
      data: {
        userId: adminId,
        action: 'BRANCH_PAYMENT_APPROVED',
        entity: 'BranchPaymentOrder',
        entityId: paymentOrderId,
        metadata: {
          companyId: company.id,
          companyName: company.name,
          branchesAdded: order.branches,
          newBranchLimit: updatedCompany.branchLimit,
        },
      },
    });

    return { updatedCompany, updatedOrder };
  });

  // Send notification email to company
  try {
    await emailService.sendEmail({
      to: company.email,
      subject: 'Branch Payment Approved',
      html: `
        <p>Dear ${company.name},</p>
        <p>Your branch upgrade payment has been approved!</p>
        <p>
          <strong>${order.branches}</strong> new branch${order.branches > 1 ? 'es' : ''} (${order.amount} GHS) 
          ${order.branches > 1 ? 'have' : 'has'} been added to your account.
        </p>
        <p>Your new total branch limit: <strong>${updated.updatedCompany.branchLimit}</strong></p>
        <p>You can now create additional branches in your dashboard.</p>
        <p>Thank you for upgrading!</p>
      `,
    });
  } catch (err) {
    console.warn(`Failed to send approval email to ${company.email}:`, err.message);
  }

  return updated.updatedOrder;
};

const rejectBranchPayment = async (paymentOrderId, adminId, reason = '') => {
  const order = await prisma.branchPaymentOrder.findUnique({
    where: { id: paymentOrderId },
    include: { company: true },
  });

  if (!order) throw new NotFoundError('Payment order not found');
  if (order.status !== 'PENDING_APPROVAL') {
    throw new BadRequestError(`Cannot reject payment with status: ${order.status}`);
  }

  const updated = await prisma.$transaction(async (tx) => {
    const updatedOrder = await tx.branchPaymentOrder.update({
      where: { id: paymentOrderId },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date(),
        rejectedBy: adminId,
        rejectionReason: reason,
      },
    });

    // Log activity
    await tx.activityLog.create({
      data: {
        userId: adminId,
        action: 'BRANCH_PAYMENT_REJECTED',
        entity: 'BranchPaymentOrder',
        entityId: paymentOrderId,
        metadata: {
          companyId: order.company.id,
          companyName: order.company.name,
          reason: reason || 'No reason provided',
        },
      },
    });

    return updatedOrder;
  });

  // Send notification email to company
  try {
    await emailService.sendEmail({
      to: order.company.email,
      subject: 'Branch Payment Not Approved',
      html: `
        <p>Dear ${order.company.name},</p>
        <p>We have reviewed your branch upgrade payment and need more information.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        <p>Please contact our support team at resolvehub3@gmail.com to resolve this.</p>
      `,
    });
  } catch (err) {
    console.warn(`Failed to send rejection email to ${order.company.email}:`, err.message);
  }

  return updated;
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
  listBranchPayments,
  approveBranchPayment,
  rejectBranchPayment,
};
