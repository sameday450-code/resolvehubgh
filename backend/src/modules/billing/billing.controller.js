const billingService = require('./billing.service');
const response = require('../../utils/response');

const getMyBillingProfile = async (req, res, next) => {
  try {
    const profile = await billingService.getBillingProfile(req.user.companyId);
    return response.success(res, profile);
  } catch (err) {
    next(err);
  }
};

const upsertMyBillingProfile = async (req, res, next) => {
  try {
    const profile = await billingService.upsertBillingProfile(req.user.companyId, req.body);
    return response.success(res, profile, 'Billing profile saved');
  } catch (err) {
    next(err);
  }
};

const getBillingProfileByCompany = async (req, res, next) => {
  try {
    const profile = await billingService.getBillingProfileByCompany(req.params.companyId);
    return response.success(res, profile);
  } catch (err) {
    next(err);
  }
};

module.exports = { getMyBillingProfile, upsertMyBillingProfile, getBillingProfileByCompany };
