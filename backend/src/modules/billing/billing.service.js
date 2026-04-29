const prisma = require('../../config/database');
const { NotFoundError } = require('../../utils/errors');

/**
 * Return the billing profile for a company, or null if not set up yet.
 */
const getBillingProfile = async (companyId) => {
  return prisma.billingProfile.findUnique({ where: { companyId } });
};

/**
 * Create or update the billing profile for a company.
 */
const upsertBillingProfile = async (companyId, data) => {
  return prisma.billingProfile.upsert({
    where: { companyId },
    create: { companyId, ...data },
    update: data,
  });
};

/**
 * Super-admin: get a company's billing profile by companyId.
 */
const getBillingProfileByCompany = async (companyId) => {
  const profile = await prisma.billingProfile.findUnique({ where: { companyId } });
  if (!profile) throw new NotFoundError('Billing profile not found for this company');
  return profile;
};

module.exports = { getBillingProfile, upsertBillingProfile, getBillingProfileByCompany };
