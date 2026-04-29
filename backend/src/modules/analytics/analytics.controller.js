const analyticsService = require('./analytics.service');
const response = require('../../utils/response');

const getCompanyAnalytics = async (req, res, next) => {
  try {
    const data = await analyticsService.getCompanyAnalytics(req.tenantId, req.query);
    return response.success(res, data);
  } catch (err) { next(err); }
};

module.exports = { getCompanyAnalytics };
