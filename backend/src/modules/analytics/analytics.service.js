const prisma = require('../../config/database');

const getCompanyAnalytics = async (companyId, query) => {
  const days = parseInt(query.days, 10) || 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Complaints over time (grouped by day)
  const complaintsRaw = await prisma.complaint.findMany({
    where: { companyId, createdAt: { gte: startDate } },
    select: { createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  const byDay = {};
  complaintsRaw.forEach((c) => {
    const day = c.createdAt.toISOString().split('T')[0];
    byDay[day] = (byDay[day] || 0) + 1;
  });
  const complaintsOverTime = Object.entries(byDay).map(([date, count]) => ({ date, count }));

  // Total and pending complaints
  const totalComplaints = await prisma.complaint.count({ where: { companyId, createdAt: { gte: startDate } } });
  const pendingComplaints = await prisma.complaint.count({
    where: { companyId, status: { in: ['NEW', 'ACKNOWLEDGED', 'IN_REVIEW', 'ASSIGNED'] }, createdAt: { gte: startDate } },
  });

  // Resolution rate
  const resolved = await prisma.complaint.count({
    where: { companyId, status: { in: ['RESOLVED', 'CLOSED'] }, createdAt: { gte: startDate } },
  });
  const resolutionRate = totalComplaints > 0 ? (resolved / totalComplaints) * 100 : 0;

  // Status distribution
  const statusDist = await prisma.complaint.groupBy({
    by: ['status'],
    where: { companyId, createdAt: { gte: startDate } },
    _count: { id: true },
  });
  const statusDistribution = {};
  statusDist.forEach((s) => { statusDistribution[s.status] = s._count.id; });

  // Priority distribution
  const priorityDist = await prisma.complaint.groupBy({
    by: ['priority'],
    where: { companyId, createdAt: { gte: startDate } },
    _count: { id: true },
  });
  const priorityDistribution = {};
  priorityDist.forEach((p) => { priorityDistribution[p.priority] = p._count.id; });

  // Average response time (time to acknowledgedAt)
  const respondedComplaints = await prisma.complaint.findMany({
    where: { companyId, acknowledgedAt: { not: null } },
    select: { createdAt: true, acknowledgedAt: true },
  });
  let avgResponseTime = 0;
  if (respondedComplaints.length > 0) {
    const totalHours = respondedComplaints.reduce((sum, c) => {
      return sum + (c.acknowledgedAt.getTime() - c.createdAt.getTime()) / (1000 * 60 * 60);
    }, 0);
    avgResponseTime = Math.round((totalHours / respondedComplaints.length) * 10) / 10;
  }

  // Average closure time
  const closedComplaints = await prisma.complaint.findMany({
    where: { companyId, resolvedAt: { not: null } },
    select: { createdAt: true, resolvedAt: true },
  });
  let avgClosureTime = 0;
  if (closedComplaints.length > 0) {
    const totalHours = closedComplaints.reduce((sum, c) => {
      return sum + (c.resolvedAt.getTime() - c.createdAt.getTime()) / (1000 * 60 * 60);
    }, 0);
    avgClosureTime = Math.round((totalHours / closedComplaints.length) * 10) / 10;
  }

  // Top categories
  const topCategoryGroups = await prisma.complaint.groupBy({
    by: ['categoryId'],
    where: { companyId, createdAt: { gte: startDate }, categoryId: { not: null } },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 8,
  });
  const catIds = topCategoryGroups.map((c) => c.categoryId);
  const cats = await prisma.complaintCategory.findMany({
    where: { id: { in: catIds } },
    select: { id: true, name: true },
  });
  const topCategories = topCategoryGroups.map((c) => ({
    name: cats.find((cat) => cat.id === c.categoryId)?.name || 'Unknown',
    count: c._count.id,
  }));

  // Peak hours (by hour of day, all time)
  const allComplaints = await prisma.complaint.findMany({
    where: { companyId },
    select: { createdAt: true },
  });
  const byHour = new Array(24).fill(0);
  allComplaints.forEach((c) => { byHour[c.createdAt.getHours()]++; });
  const peakHours = byHour.map((count, hour) => ({ hour, count }));

  // Anonymous vs identified
  const [anonymous, identified] = await Promise.all([
    prisma.complaint.count({ where: { companyId, isAnonymous: true } }),
    prisma.complaint.count({ where: { companyId, isAnonymous: false } }),
  ]);

  // Branch performance
  const branchRaw = await prisma.$queryRaw`
    SELECT b.name,
           COUNT(c.id)::int AS "totalComplaints",
           COUNT(CASE WHEN c.status IN ('RESOLVED', 'CLOSED') THEN 1 END)::int AS "resolvedCount"
    FROM "Branch" b
    LEFT JOIN "Complaint" c ON c."branchId" = b.id AND c."companyId" = ${companyId}
    WHERE b."companyId" = ${companyId}
    GROUP BY b.id, b.name
    ORDER BY "totalComplaints" DESC
  `;
  const branchPerformance = branchRaw.map((b) => ({
    name: b.name,
    totalComplaints: Number(b.totalComplaints),
    resolutionRate: b.totalComplaints > 0 ? (Number(b.resolvedCount) / Number(b.totalComplaints)) * 100 : 0,
  }));

  return {
    complaintsOverTime,
    totalComplaints,
    pendingComplaints,
    resolutionRate,
    statusDistribution,
    priorityDistribution,
    avgResponseTime,
    avgClosureTime,
    topCategories,
    peakHours,
    anonymousVsIdentified: { anonymous, identified },
    branchPerformance,
  };
};

module.exports = { getCompanyAnalytics };
