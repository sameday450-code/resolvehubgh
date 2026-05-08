const settingsService = require('./settings.service');
const uploadService = require('../uploads/uploads.service');
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

const updateBranding = async (req, res, next) => {
  try {
    let logoUrl = req.body.logoUrl || undefined;

    // If a logo file was multipart-uploaded, push it to Cloudinary
    if (req.file) {
      const results = await uploadService.uploadFiles([req.file], 'logos');
      logoUrl = results[0].url;
    }

    const data = await settingsService.updateBranding(req.tenantId, {
      brandColor: req.body.brandColor || undefined,
      logoUrl,
    });

    // Emit real-time branding update to company admins AND public portal listeners
    const io = req.app.get('io');
    if (io) {
      const payload = { logoUrl: data.logoUrl, brandColor: data.brandColor, updatedAt: data.updatedAt };
      io.to(`company:${req.tenantId}`).emit('company:branding-updated', payload);
      io.to(`public:company:${req.tenantId}`).emit('company:branding-updated', payload);
    }

    return response.success(res, data, 'Branding updated successfully');
  } catch (err) { next(err); }
};

const updateStaffStatus = async (req, res, next) => {
  try {
    const data = await settingsService.updateStaffStatus(req.tenantId, req.params.id, req.body.isActive);
    return response.success(res, data, 'Staff status updated');
  } catch (err) { next(err); }
};

module.exports = {
  getSettings, updateProfile, updateSettings, updateBranding,
  getCategories, createCategory, deleteCategory,
  getStaff, addStaff, updateStaffStatus,
};
