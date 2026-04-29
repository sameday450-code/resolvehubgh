const settingsService = require('./settings.service');
const response = require('../../utils/response');

const getSettings = async (req, res, next) => {
  try {
    const data = await settingsService.getSettings(req.tenantId);
    return response.success(res, data);
  } catch (err) { next(err); }
};

const updateProfile = async (req, res, next) => {
  try {
    const data = await settingsService.updateCompanyProfile(req.tenantId, req.body);
    return response.success(res, data, 'Profile updated');
  } catch (err) { next(err); }
};

const updateSettings = async (req, res, next) => {
  try {
    const data = await settingsService.updateSettings(req.tenantId, req.body);
    return response.success(res, data, 'Settings updated');
  } catch (err) { next(err); }
};

const getCategories = async (req, res, next) => {
  try {
    const data = await settingsService.getCategories(req.tenantId);
    return response.success(res, data);
  } catch (err) { next(err); }
};

const createCategory = async (req, res, next) => {
  try {
    const data = await settingsService.createCategory(req.tenantId, req.body);
    return response.success(res, data, 'Category created', 201);
  } catch (err) { next(err); }
};

const deleteCategory = async (req, res, next) => {
  try {
    await settingsService.deleteCategory(req.tenantId, req.params.id);
    return response.success(res, null, 'Category deleted');
  } catch (err) { next(err); }
};

const getStaff = async (req, res, next) => {
  try {
    const data = await settingsService.getStaff(req.tenantId);
    return response.success(res, data);
  } catch (err) { next(err); }
};

const addStaff = async (req, res, next) => {
  try {
    const data = await settingsService.addStaff(req.tenantId, req.body);
    return response.success(res, data, 'Staff added', 201);
  } catch (err) { next(err); }
};

const updateStaffStatus = async (req, res, next) => {
  try {
    const data = await settingsService.updateStaffStatus(req.tenantId, req.params.id, req.body.isActive);
    return response.success(res, data, 'Staff status updated');
  } catch (err) { next(err); }
};

module.exports = {
  getSettings, updateProfile, updateSettings,
  getCategories, createCategory, deleteCategory,
  getStaff, addStaff, updateStaffStatus,
};
