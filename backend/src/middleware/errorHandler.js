const logger = require('../config/logger');
const { AppError } = require('../utils/errors');

const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let code = err.code || 'INTERNAL_ERROR';

  // Log all errors for debugging
  if (!(err instanceof AppError) || statusCode >= 500) {
    logger.error({ 
      error: err.message, 
      stack: err.stack, 
      path: req.path, 
      method: req.method,
      origin: req.headers.origin,
    }, 'Error occurred');
  }

  // Prisma known errors
  if (err.code === 'P2002') {
    statusCode = 409;
    message = 'A record with this value already exists';
    code = 'DUPLICATE_ENTRY';
  }

  if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Record not found';
    code = 'NOT_FOUND';
  }

  // Zod validation errors
  if (err.name === 'ZodError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    const errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return res.status(statusCode).json({
      success: false,
      message: 'Validation failed',
      code,
      errors,
    });
  }

  // Multer / busboy errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'File too large. Maximum size is 10 MB per file.';
    code = 'FILE_TOO_LARGE';
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    statusCode = 400;
    message = 'Too many files. Maximum is 5 files per upload.';
    code = 'FILE_LIMIT_EXCEEDED';
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    message = 'Unexpected file field name in the upload request.';
    code = 'UNEXPECTED_FILE';
  }

  // busboy throws this when Content-Type header is missing the multipart boundary
  if (
    err.message &&
    (err.message.includes('Boundary not found') ||
      err.message.includes('boundary') ||
      err.message.includes('Multipart'))
  ) {
    statusCode = 400;
    message = 'Malformed file upload request. Ensure files are sent as multipart/form-data.';
    code = 'INVALID_MULTIPART';
  }

  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'Internal server error'
      : message,
    code,
  });
};

module.exports = errorHandler;
