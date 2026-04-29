const qrService = require('./qrcodes.service');
const response = require('../../utils/response');

const generateQRCode = async (req, res, next) => {
  try {
    const qrCode = await qrService.generateQRCode(req.tenantId, req.body);
    return response.success(res, qrCode, 'QR code generated', 201);
  } catch (err) { next(err); }
};

const getQRCodes = async (req, res, next) => {
  try {
    const { qrCodes, pagination } = await qrService.getQRCodes(req.tenantId, req.query);
    return response.paginated(res, qrCodes, pagination);
  } catch (err) { next(err); }
};

const getQRCode = async (req, res, next) => {
  try {
    const qrCode = await qrService.getQRCodeById(req.tenantId, req.params.id);
    return response.success(res, qrCode);
  } catch (err) { next(err); }
};

const disableQRCode = async (req, res, next) => {
  try {
    const qrCode = await qrService.disableQRCode(req.tenantId, req.params.id);
    return response.success(res, qrCode, 'QR code disabled');
  } catch (err) { next(err); }
};

const enableQRCode = async (req, res, next) => {
  try {
    const qrCode = await qrService.enableQRCode(req.tenantId, req.params.id);
    return response.success(res, qrCode, 'QR code enabled');
  } catch (err) { next(err); }
};

const regenerateQRCode = async (req, res, next) => {
  try {
    const qrCode = await qrService.regenerateQRCode(req.tenantId, req.params.id);
    return response.success(res, qrCode, 'QR code regenerated');
  } catch (err) { next(err); }
};

const deleteQRCode = async (req, res, next) => {
  try {
    await qrService.deleteQRCode(req.tenantId, req.params.id);
    return response.success(res, null, 'QR code deleted');
  } catch (err) { next(err); }
};

// Public - no auth
const resolveQR = async (req, res, next) => {
  try {
    const result = await qrService.resolvePublicQR(req.params.publicSlug);
    return response.success(res, result);
  } catch (err) { next(err); }
};

const getQRSVG = async (req, res, next) => {
  try {
    const svg = await qrService.getQRCodeSVG(req.params.publicSlug);
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(svg);
  } catch (err) { next(err); }
};

module.exports = {
  generateQRCode, getQRCodes, getQRCode, disableQRCode, enableQRCode,
  regenerateQRCode, deleteQRCode, resolveQR, getQRSVG,
};
