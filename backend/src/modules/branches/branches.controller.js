const branchService = require('./branches.service');
const response = require('../../utils/response');

const getBranches = async (req, res, next) => {
  try {
    const { branches, pagination } = await branchService.getBranches(req.tenantId, req.query);
    return response.paginated(res, branches, pagination);
  } catch (err) { next(err); }
};

const getBranch = async (req, res, next) => {
  try {
    const branch = await branchService.getBranchById(req.tenantId, req.params.id);
    return response.success(res, branch);
  } catch (err) { next(err); }
};

const createBranch = async (req, res, next) => {
  try {
    const branch = await branchService.createBranch(req.tenantId, req.body);
    return response.success(res, branch, 'Branch created', 201);
  } catch (err) { next(err); }
};

const updateBranch = async (req, res, next) => {
  try {
    const branch = await branchService.updateBranch(req.tenantId, req.params.id, req.body);
    return response.success(res, branch, 'Branch updated');
  } catch (err) { next(err); }
};

const deleteBranch = async (req, res, next) => {
  try {
    await branchService.deleteBranch(req.tenantId, req.params.id);
    return response.success(res, null, 'Branch deleted');
  } catch (err) { next(err); }
};

const getComplaintPoints = async (req, res, next) => {
  try {
    const points = await branchService.getComplaintPoints(req.tenantId, req.params.branchId);
    return response.success(res, points);
  } catch (err) { next(err); }
};

const createComplaintPoint = async (req, res, next) => {
  try {
    const point = await branchService.createComplaintPoint(req.tenantId, req.params.branchId, req.body);
    return response.success(res, point, 'Complaint point created', 201);
  } catch (err) { next(err); }
};

const deleteComplaintPoint = async (req, res, next) => {
  try {
    await branchService.deleteComplaintPoint(req.tenantId, req.params.branchId, req.params.pointId);
    return response.success(res, null, 'Complaint point deleted');
  } catch (err) { next(err); }
};

module.exports = {
  getBranches, getBranch, createBranch, updateBranch, deleteBranch,
  getComplaintPoints, createComplaintPoint, deleteComplaintPoint,
};
