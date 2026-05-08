const { Router } = require('express');
const upload = require('../../middleware/upload');
const uploadService = require('./uploads.service');
const response = require('../../utils/response');
const { authenticate, authorize } = require('../../middleware/auth');

const router = Router();

// Public upload route for complaint attachments
router.post('/complaint-attachments', upload.array('files', 5), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return response.success(res, [], 'No files uploaded');
    }
    const results = await uploadService.uploadFiles(req.files, 'complaints');
    return response.success(res, results, 'Files uploaded', 201);
  } catch (err) {
    next(err);
  }
});

// Authenticated upload for logos etc.
router.post('/logo', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return response.error(res, 'No file provided', 400);
    }
    const results = await uploadService.uploadFiles([req.file], 'logos');
    return response.success(res, results[0], 'Logo uploaded', 201);
  } catch (err) {
    next(err);
  }
});

// Authenticated upload for proof of payment
router.post(
  '/payment-proof',
  authenticate,
  authorize('COMPANY_ADMIN'),
  upload.single('file'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return response.error(res, 'No file provided', 400);
      }
      const results = await uploadService.uploadFiles([req.file], 'payment-proofs');
      return response.success(res, results[0], 'Proof of payment uploaded', 201);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
