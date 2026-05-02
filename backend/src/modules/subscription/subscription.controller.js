const subscriptionService = require('./subscription.service');
const response = require('../../utils/response');

const getPlans = async (req, res, next) => {
  try {
    const plans = await subscriptionService.getPlans();
    return response.success(res, plans);
  } catch (err) {
    next(err);
  }
};

const getMySubscription = async (req, res, next) => {
  try {
    const subscription = await subscriptionService.getMySubscription(req.user.companyId);
    return response.success(res, subscription);
  } catch (err) {
    next(err);
  }
};

const getSubscriptionStatus = async (req, res, next) => {
  try {
    const status = await subscriptionService.getSubscriptionStatus(req.user.companyId);
    return response.success(res, status);
  } catch (err) {
    next(err);
  }
};

const activateTrial = async (req, res, next) => {
  try {
    const subscription = await subscriptionService.activateTrial(req.user.companyId);
    return response.success(res, subscription, 'Trial activated successfully', 201);
  } catch (err) {
    next(err);
  }
};

const listSubscriptions = async (req, res, next) => {
  try {
    const { page, limit, status } = req.query;
    const result = await subscriptionService.listSubscriptions({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      status,
    });
    return response.paginated(res, result.data, result.pagination);
  } catch (err) {
    next(err);
  }
};

const updateSubscription = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const subscription = await subscriptionService.updateSubscription(companyId, req.body);
    return response.success(res, subscription, 'Subscription updated');
  } catch (err) {
    next(err);
  }
};

const manuallyActivate = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const subscription = await subscriptionService.manuallyActivate(companyId, {
      ...req.body,
      activatedBy: req.user.email,
    });
    return response.success(res, subscription, 'Company subscription manually activated', 200);
  } catch (err) {
    next(err);
  }
};

// ============================================
// MANUAL ACTIVATION REQUEST ENDPOINTS
// ============================================

/**
 * Company: Get subscription info
 */
const getCompanySubscriptionInfo = async (req, res, next) => {
  try {
    const info = await subscriptionService.getCompanySubscriptionInfo(req.user.companyId);
    return response.success(res, info);
  } catch (err) {
    next(err);
  }
};

/**
 * Company: Submit activation request
 */
const submitActivationRequest = async (req, res, next) => {
  try {
    const request = await subscriptionService.requestActivation(req.user.companyId, req.body);
    return response.success(
      res,
      request,
      'Activation request sent. ResolveHub will verify your payment and activate your account.',
      201
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Company: Get activation requests
 */
const getCompanyActivationRequests = async (req, res, next) => {
  try {
    const { status } = req.query;
    const requests = await subscriptionService.getCompanyActivationRequests(req.user.companyId, status);
    return response.success(res, requests);
  } catch (err) {
    next(err);
  }
};

/**
 * Super Admin: Get company subscription details
 */
const getCompanySubscriptionAdminView = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const info = await subscriptionService.getCompanySubscriptionAdminView(companyId);
    return response.success(res, info);
  } catch (err) {
    next(err);
  }
};

/**
 * Super Admin: Manually activate subscription
 */
const activateSubscription = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const updated = await subscriptionService.activateCompanySubscription(
      companyId,
      req.body,
      req.user.id
    );
    return response.success(res, updated, 'Subscription activated successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * Super Admin: Lock dashboard
 */
const lockDashboard = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const updated = await subscriptionService.lockCompanyDashboard(companyId, req.user.id);
    return response.success(res, updated, 'Dashboard locked');
  } catch (err) {
    next(err);
  }
};

/**
 * Super Admin: Unlock dashboard
 */
const unlockDashboard = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const updated = await subscriptionService.unlockCompanyDashboard(companyId, req.user.id);
    return response.success(res, updated, 'Dashboard unlocked');
  } catch (err) {
    next(err);
  }
};

/**
 * Super Admin: Extend trial
 */
const extendTrial = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const { days } = req.body;
    const updated = await subscriptionService.extendCompanyTrial(companyId, days, req.user.id);
    return response.success(res, updated, 'Trial extended');
  } catch (err) {
    next(err);
  }
};

/**
 * Super Admin: Get all activation requests
 */
const getAllActivationRequests = async (req, res, next) => {
  try {
    const result = await subscriptionService.getAllActivationRequests(req.query);
    return response.paginated(res, result.requests, result.pagination);
  } catch (err) {
    next(err);
  }
};

/**
 * Super Admin: Approve activation request
 */
const approveActivationRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const updated = await subscriptionService.approveActivationRequest(requestId, req.user.id);
    return response.success(res, updated, 'Activation request approved');
  } catch (err) {
    next(err);
  }
};

/**
 * Super Admin: Reject activation request
 */
const rejectActivationRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const { reason } = req.body;
    const updated = await subscriptionService.rejectActivationRequest(
      requestId,
      req.user.id,
      reason
    );
    return response.success(res, updated, 'Activation request rejected');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPlans,
  getMySubscription,
  getSubscriptionStatus,
  activateTrial,
  listSubscriptions,
  updateSubscription,
  manuallyActivate,
  // Manual activation request
  getCompanySubscriptionInfo,
  submitActivationRequest,
  getCompanyActivationRequests,
  getCompanySubscriptionAdminView,
  activateSubscription,
  lockDashboard,
  unlockDashboard,
  extendTrial,
  getAllActivationRequests,
  approveActivationRequest,
  rejectActivationRequest,
};
