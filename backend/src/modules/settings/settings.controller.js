const settingsService = require('./settings.service');
const uploadService = require('../uploads/uploads.service');
const response = require('../../utils/response');

const LOGO_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];
const LOGO_MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
const HEX_COLOR_RE = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

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
    const brandColor = (req.body.brandColor || '').trim() || null;
    const removeLogo = req.body.removeLogo === 'true';

    // Validate HEX color when provided
    if (brandColor && !HEX_COLOR_RE.test(brandColor)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid color value. Please provide a valid HEX color (e.g. #2563eb).',
        code: 'VALIDATION_ERROR',
      });
    }

    // Validate logo file — images only, 2 MB cap
    if (req.file) {
      if (!LOGO_ALLOWED_MIME_TYPES.includes(req.file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid logo file type. Only JPG, PNG, WebP, and GIF images are accepted.',
          code: 'INVALID_FILE_TYPE',
        });
      }
      if (req.file.size > LOGO_MAX_SIZE_BYTES) {
        return res.status(400).json({
          success: false,
          message: 'Logo file is too large. Maximum allowed size is 2 MB.',
          code: 'FILE_TOO_LARGE',
        });
      }
    }

    // Resolve the final logoUrl value:
    //   undefined  → do not touch the existing value in DB
    //   null       → explicitly clear the logo
    //   string     → new Cloudinary URL
    let logoUrl = undefined;
    if (removeLogo) {
      logoUrl = null;
    } else if (req.file) {
      const results = await uploadService.uploadFiles([req.file], 'logos');
      logoUrl = results[0].url;
    }

    const data = await settingsService.updateBranding(req.tenantId, {
      brandColor: brandColor || undefined,
      logoUrl,
      removeLogo,
    });

    // Push real-time update to company dashboard and public portal listeners
    const io = req.app.get('io');
    if (io) {
      const payload = {
        logoUrl: data.logoUrl,
        brandColor: data.brandColor,
        updatedAt: data.updatedAt,
      };
      io.to(`company:${req.tenantId}`).emit('company:branding-updated', payload);
      io.to(`public:company:${req.tenantId}`).emit('company:branding-updated', payload);
    }

    return response.success(res, data, 'Branding updated successfully');
  } catch (err) {
    next(err);
  }
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
