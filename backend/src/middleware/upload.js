const multer = require('multer');
const config = require('../config');
const { BadRequestError } = require('../utils/errors');

const ALLOWED_MIME_TYPES = [
  // Images
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  // Videos
  'video/mp4',
  'video/quicktime', // .mov
  'video/webm',
  // Documents
  'application/pdf',
  'application/msword',                                                          // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',    // .docx
];

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestError(`File type "${file.mimetype}" is not allowed. Accepted: images (jpg, png, webp), videos (mp4, mov, webm), documents (pdf, doc, docx).`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.maxFileSize, // 10 MB per file
    files: 5,
  },
});

module.exports = upload;
