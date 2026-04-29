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

module.exports = {
  getPlans,
  getMySubscription,
  activateTrial,
  listSubscriptions,
  updateSubscription,
};
