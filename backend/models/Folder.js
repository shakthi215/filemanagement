const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Folder name is required'],
    trim: true,
    maxlength: [100, 'Folder name cannot exceed 100 characters']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parentFolderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    default: null
  },
  color: {
    type: String,
    default: '#6366f1'
  },
  isStarred: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index for performance
folderSchema.index({ userId: 1, parentFolderId: 1 });
folderSchema.index({ userId: 1, name: 1 });

module.exports = mongoose.model('Folder', folderSchema);
