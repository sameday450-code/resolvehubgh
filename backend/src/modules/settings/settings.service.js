const prisma = require('../../config/database');
const { NotFoundError } = require('../../utils/errors');

const getSettings = async (companyId) => {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: { settings: true },
  });
  if (!company) throw new NotFoundError('Company not found');
  return {
    company: {
      id: company.id,
      name: company.name,
      email: company.email,
      phone: company.phone,
      industry: company.industry,
      country: company.country,
      city: company.city,
      address: company.address,
      logoUrl: company.logoUrl,
      brandColor: company.brandColor,
    },
    settings: company.settings,
  };
};

const updateCompanyProfile = async (companyId, data) => {
  return prisma.company.update({
    where: { id: companyId },
    data: {
      name: data.name,
      phone: data.phone,
      industry: data.industry,
      city: data.city,
      address: data.address,
      brandColor: data.brandColor,
      logoUrl: data.logoUrl,
    },
  });
};

const updateSettings = async (companyId, data) => {
  return prisma.companySettings.update({
    where: { companyId },
    data: {
      supportEmail: data.supportEmail,
      supportPhone: data.supportPhone,
      allowAnonymous: data.allowAnonymous,
      customWelcomeMessage: data.customWelcomeMessage,
      timezone: data.timezone,
      notifyOnNewComplaint: data.notifyOnNewComplaint,
      notifyOnStatusChange: data.notifyOnStatusChange,
      autoAcknowledge: data.autoAcknowledge,
      dataRetentionDays: data.dataRetentionDays,
    },
  });
};

const getCategories = async (companyId) => {
  return prisma.complaintCategory.findMany({
    where: { OR: [{ companyId }, { isDefault: true, companyId: null }] },
    orderBy: { name: 'asc' },
  });
};

const createCategory = async (companyId, data) => {
  const slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  return prisma.complaintCategory.create({
    data: { companyId, name: data.name, slug },
  });
};

const deleteCategory = async (companyId, categoryId) => {
  const cat = await prisma.complaintCategory.findFirst({
    where: { id: categoryId, companyId },
  });
  if (!cat) throw new NotFoundError('Category not found');
  await prisma.complaintCategory.delete({ where: { id: categoryId } });
};

// Staff management
const getStaff = async (companyId) => {
  return prisma.user.findMany({
    where: { companyId },
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
      lastLoginAt: true,
      _count: { select: { assignedComplaints: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

const addStaff = async (companyId, data) => {
  const bcrypt = require('bcryptjs');
  const passwordHash = await bcrypt.hash(data.password, 12);

  return prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      fullName: data.fullName,
      phone: data.phone,
      role: 'COMPANY_STAFF',
      companyId,
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      createdAt: true,
    },
  });
};

const updateStaffStatus = async (companyId, userId, isActive) => {
  const user = await prisma.user.findFirst({ where: { id: userId, companyId } });
  if (!user) throw new NotFoundError('Staff member not found');

  return prisma.user.update({
    where: { id: userId },
    data: { isActive },
  });
};

module.exports = {
  getSettings, updateCompanyProfile, updateSettings,
  getCategories, createCategory, deleteCategory,
  getStaff, addStaff, updateStaffStatus,
};
