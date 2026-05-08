const multer = require('multer');
const path = require('path');

// Allowed file types
const ALLOWED_TYPES = {
  // Images
  'image/jpeg': { type: 'image', ext: 'jpg' },
  'image/jpg': { type: 'image', ext: 'jpg' },
  'image/png': { type: 'image', ext: 'png' },
  'image/gif': { type: 'image', ext: 'gif' },
  'image/webp': { type: 'image', ext: 'webp' },
  'image/svg+xml': { type: 'image', ext: 'svg' },
  // PDFs
  'application/pdf': { type: 'pdf', ext: 'pdf' },
  // Spreadsheets
  'application/vnd.ms-excel': { type: 'spreadsheet', ext: 'xls' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { type: 'spreadsheet', ext: 'xlsx' },
  'text/csv': { type: 'spreadsheet', ext: 'csv' },
  // Documents
  'application/msword': { type: 'document', ext: 'doc' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { type: 'document', ext: 'docx' },
  'text/plain': { type: 'document', ext: 'txt' },
  // Presentations
  'application/vnd.ms-powerpoint': { type: 'presentation', ext: 'ppt' },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { type: 'presentation', ext: 'pptx' },
  // Archives
  'application/zip': { type: 'archive', ext: 'zip' },
  'application/x-rar-compressed': { type: 'archive', ext: 'rar' },
  // Video
  'video/mp4': { type: 'video', ext: 'mp4' },
  'video/quicktime': { type: 'video', ext: 'mov' },
  // Audio
  'audio/mpeg': { type: 'audio', ext: 'mp3' },
  'audio/wav': { type: 'audio', ext: 'wav' },
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// Use memory storage (buffer upload to Cloudinary)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not supported`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE }
});

const getFileType = (mimetype) => {
  return ALLOWED_TYPES[mimetype]?.type || 'other';
};

const getFileExtension = (mimetype, originalname) => {
  return ALLOWED_TYPES[mimetype]?.ext || path.extname(originalname).slice(1).toLowerCase();
};

const getCloudinaryResourceType = (mimetype) => {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  return 'raw';
};

module.exports = { upload, getFileType, getFileExtension, getCloudinaryResourceType, ALLOWED_TYPES };
