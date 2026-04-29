const superAdminService = require('./superAdmin.service');
const response = require('../../utils/response');

const getDashboard = async (req, res, next) => {
  try {
    const data = await superAdminService.getDashboardOverview();
    return response.success(res, data);
  } catch (err) {
    next(err);
  }
};

const getCompanies = async (req, res, next) => {
  try {
    const { companies, pagination } = await superAdminService.getCompanies(req.query);
    return response.paginated(res, companies, pagination);
  } catch (err) {
    next(err);
  }
};

const getCompanyDetail = async (req, res, next) => {
  try {
    const data = await superAdminService.getCompanyDetail(req.params.id);
    return response.success(res, data);
  } catch (err) {
    next(err);
  }
};

const approveCompany = async (req, res, next) => {
  try {
    const data = await superAdminService.approveCompany(req.params.id, req.user.id);
    req.app.get('io')?.emit('company:approved', { companyId: req.params.id });
    return response.success(res, data, 'Company approved successfully');
  } catch (err) {
    next(err);
  }
};

const rejectCompany = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const data = await superAdminService.rejectCompany(req.params.id, req.user.id, reason);
    req.app.get('io')?.emit('company:rejected', { companyId: req.params.id });
    return response.success(res, data, 'Company rejected');
  } catch (err) {
    next(err);
  }
};

const suspendCompany = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const data = await superAdminService.suspendCompany(req.params.id, req.user.id, reason);
    req.app.get('io')?.emit('company:suspended', { companyId: req.params.id });
    return response.success(res, data, 'Company suspended');
  } catch (err) {
    next(err);
  }
};

const reactivateCompany = async (req, res, next) => {
  try {
    const data = await superAdminService.reactivateCompany(req.params.id, req.user.id);
    req.app.get('io')?.emit('company:reactivated', { companyId: req.params.id });
    return response.success(res, data, 'Company reactivated');
  } catch (err) {
    next(err);
  }
};

const deleteCompany = async (req, res, next) => {
  try {
    await superAdminService.deleteCompany(req.params.id, req.user.id);
    return response.success(res, null, 'Company deleted');
  } catch (err) {
    next(err);
  }
};

const getAnalytics = async (req, res, next) => {
  try {
    const data = await superAdminService.getPlatformAnalytics();
    return response.success(res, data);
  } catch (err) {
    next(err);
  }
};

const getSupportMessages = async (req, res, next) => {
  try {
    const { messages, pagination } = await superAdminService.getSupportMessages(req.query);
    return response.paginated(res, messages, pagination);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboard,
  getCompanies,
  getCompanyDetail,
  approveCompany,
  rejectCompany,
  suspendCompany,
  reactivateCompany,
  deleteCompany,
  getAnalytics,
  getSupportMessages,
};
