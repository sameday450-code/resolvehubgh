const { nanoid } = require('nanoid');

const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const generatePublicSlug = () => {
  return nanoid(12);
};

const generateReferenceNumber = () => {
  const prefix = 'CMP';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = nanoid(4).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

const generateBranchCode = (name) => {
  const clean = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const short = clean.substring(0, 4);
  const random = nanoid(4).toUpperCase();
  return `${short}-${random}`;
};

const getPaginationParams = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const buildPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};

module.exports = {
  generateSlug,
  generatePublicSlug,
  generateReferenceNumber,
  generateBranchCode,
  getPaginationParams,
  buildPaginationMeta,
};
