const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'File name is required'],
    trim: true
  },
  originalName: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: [true, 'File URL is required']
  },
  publicId: {
    type: String,
    required: [true, 'Cloudinary public ID is required']
  },
  type: {
    type: String,
    required: true,
    enum: ['image', 'pdf', 'spreadsheet', 'document', 'presentation', 'video', 'audio', 'archive', 'other']
  },
  mimeType: {
    type: String,
    required: true
  },
  extension: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  folderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    default: null
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isStarred: {
    type: Boolean,
    default: false
  },
  thumbnail: {
    type: String,
    default: null
  },
  resourceType: {
    type: String,
    default: 'raw'
  }
}, {
  timestamps: true
});

// Indexes for performance
fileSchema.index({ userId: 1, folderId: 1 });
fileSchema.index({ userId: 1, name: 'text' });
fileSchema.index({ userId: 1, type: 1 });
fileSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('File', fileSchema);
