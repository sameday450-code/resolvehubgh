const prisma = require('../../config/database');
const { NotFoundError, ValidationError } = require('../../utils/errors');

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
  const all = await prisma.complaintCategory.findMany({
    where: { OR: [{ companyId }, { isDefault: true, companyId: null }] },
    orderBy: { name: 'asc' },
  });

  // Deduplicate: if a company has a custom category with the same name as a default, keep only the company one
  const companyNames = new Set(
    all.filter((c) => c.companyId === companyId).map((c) => c.name.toLowerCase())
  );
  return all.filter((c) => !(c.isDefault && c.companyId === null && companyNames.has(c.name.toLowerCase())));
};

const createCategory = async (companyId, data) => {
  const trimmedName = data.name.trim();
  if (!trimmedName) throw new ValidationError('Category name is required');

  // Prevent duplicate names (case-insensitive) across default and company categories
  const all = await prisma.complaintCategory.findMany({
    where: { OR: [{ companyId }, { isDefault: true, companyId: null }] },
    select: { name: true },
  });
  const nameTaken = all.some((c) => c.name.toLowerCase() === trimmedName.toLowerCase());
  if (nameTaken) throw new ValidationError(`A category named "${trimmedName}" already exists`);

  const slug = trimmedName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  return prisma.complaintCategory.create({
    data: { companyId, name: trimmedName, slug },
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

const updateBranding = async (companyId, { brandColor, logoUrl, removeLogo }) => {
  const updateData = {};

  if (brandColor !== undefined && brandColor !== null) {
    updateData.brandColor = brandColor;
  }

  if (removeLogo) {
    updateData.logoUrl = null;
  } else if (logoUrl !== undefined && logoUrl !== null) {
    updateData.logoUrl = logoUrl;
  }

  // Nothing changed — return the current values without a DB write
  if (Object.keys(updateData).length === 0) {
    const current = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, logoUrl: true, brandColor: true, updatedAt: true },
    });
    if (!current) throw new NotFoundError('Company not found');
    return current;
  }

  return prisma.company.update({
    where: { id: companyId },
    data: updateData,
    select: { id: true, logoUrl: true, brandColor: true, updatedAt: true },
  });
};

module.exports = {
  getSettings, updateCompanyProfile, updateSettings, updateBranding,
  getCategories, createCategory, deleteCategory,
  getStaff, addStaff, updateStaffStatus,
};
