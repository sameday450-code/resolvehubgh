const prisma = require('../../config/database');

const getCompanyAnalytics = async (companyId, query) => {
  const days = parseInt(query.days, 10) || 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Complaints over time
  const complaintsRaw = await prisma.complaint.findMany({
    where: { companyId, createdAt: { gte: startDate } },
    select: { createdAt: true, type: true, status: true },
    orderBy: { createdAt: 'asc' },
  });

  const complaintsByDay = {};
  complaintsRaw.forEach((c) => {
    const day = c.createdAt.toISOString().split('T')[0];
    if (!complaintsByDay[day]) complaintsByDay[day] = { complaints: 0, feedback: 0 };
    if (c.type === 'FEEDBACK') complaintsByDay[day].feedback++;
    else complaintsByDay[day].complaints++;
  });

  // Resolution rate
  const totalResolvable = await prisma.complaint.count({
    where: { companyId, createdAt: { gte: startDate } },
  });
  const resolved = await prisma.complaint.count({
    where: { companyId, status: { in: ['RESOLVED', 'CLOSED'] }, createdAt: { gte: startDate } },
  });
  const resolutionRate = totalResolvable > 0 ? Math.round((resolved / totalResolvable) * 100) : 0;

  // Average response time (time to first status change from NEW)
  const respondedComplaints = await prisma.complaint.findMany({
    where: { companyId, acknowledgedAt: { not: null } },
    select: { createdAt: true, acknowledgedAt: true },
  });

  let avgResponseHours = 0;
  if (respondedComplaints.length > 0) {
    const totalHours = respondedComplaints.reduce((sum, c) => {
      return sum + (c.acknowledgedAt.getTime() - c.createdAt.getTime()) / (1000 * 60 * 60);
    }, 0);
    avgResponseHours = Math.round((totalHours / respondedComplaints.length) * 10) / 10;
  }

  // Average closure time
  const closedComplaints = await prisma.complaint.findMany({
    where: { companyId, resolvedAt: { not: null } },
    select: { createdAt: true, resolvedAt: true },
  });

  let avgClosureHours = 0;
  if (closedComplaints.length > 0) {
    const totalHours = closedComplaints.reduce((sum, c) => {
      return sum + (c.resolvedAt.getTime() - c.createdAt.getTime()) / (1000 * 60 * 60);
    }, 0);
    avgClosureHours = Math.round((totalHours / closedComplaints.length) * 10) / 10;
  }

  // Most reported issues (by category)
  const topCategories = await prisma.complaint.groupBy({
    by: ['categoryId'],
    where: { companyId, createdAt: { gte: startDate }, categoryId: { not: null } },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 5,
  });

  const catIds = topCategories.map((c) => c.categoryId);
  const cats = await prisma.complaintCategory.findMany({
    where: { id: { in: catIds } },
    select: { id: true, name: true },
  });

  const topIssues = topCategories.map((c) => ({
    category: cats.find((cat) => cat.id === c.categoryId)?.name || 'Unknown',
    count: c._count.id,
  }));

  // Peak complaint periods (by hour of day)
  const allComplaints = await prisma.complaint.findMany({
    where: { companyId },
    select: { createdAt: true },
  });

  const byHour = new Array(24).fill(0);
  allComplaints.forEach((c) => {
    byHour[c.createdAt.getHours()]++;
  });

  const peakHours = byHour.map((count, hour) => ({ hour, count }));

  // Anonymous vs identified
  const anonymous = await prisma.complaint.count({ where: { companyId, isAnonymous: true } });
  const identified = await prisma.complaint.count({ where: { companyId, isAnonymous: false } });

  // By branch performance
  const branchPerformance = await prisma.$queryRaw`
    SELECT b.name as "branchName",
           COUNT(c.id) as "totalComplaints",
           COUNT(CASE WHEN c.status IN ('RESOLVED', 'CLOSED') THEN 1 END) as "resolvedCount"
    FROM "Branch" b
    LEFT JOIN "Complaint" c ON c."branchId" = b.id
    WHERE b."companyId" = ${companyId}
    GROUP BY b.id, b.name
    ORDER BY "totalComplaints" DESC
  `;

  return {
    complaintsByDay: Object.entries(complaintsByDay).map(([date, data]) => ({ date, ...data })),
    resolutionRate,
    avgResponseHours,
    avgClosureHours,
    topIssues,
    peakHours,
    anonymousVsIdentified: { anonymous, identified },
    branchPerformance: branchPerformance.map((b) => ({
      ...b,
      totalComplaints: Number(b.totalComplaints),
      resolvedCount: Number(b.resolvedCount),
    })),
  };
};

module.exports = { getCompanyAnalytics };
