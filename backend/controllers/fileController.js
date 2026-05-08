const cloudinary = require('../config/cloudinary');
const File = require('../models/File');
const Folder = require('../models/Folder');
const User = require('../models/User');
const { getFileType, getFileExtension, getCloudinaryResourceType } = require('../middleware/upload');
const streamifier = require('streamifier');
const http = require('http');
const https = require('https');

const STORAGE_LIMIT_BYTES = 50 * 1024 * 1024 * 1024; // 50GB limit

// Upload buffer to Cloudinary
const uploadToCloudinary = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// @desc    Upload file
// @route   POST /api/files/upload
// @access  Private
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    const { folderId } = req.body;
    const { buffer, originalname, mimetype, size } = req.file;

    if (folderId) {
      const folder = await Folder.findOne({ _id: folderId, userId: req.user._id });
      if (!folder) {
        return res.status(404).json({ message: 'Folder not found' });
      }
    }

    const fileType = getFileType(mimetype);
    const extension = getFileExtension(mimetype, originalname);
    const resourceType = getCloudinaryResourceType(mimetype);

    // Build Cloudinary options
    const uploadOptions = {
      folder: `bizfiles/${req.user._id}`,
      resource_type: resourceType,
      use_filename: true,
      unique_filename: true,
    };

    // Auto-generate thumbnail for images
    if (resourceType === 'image') {
      uploadOptions.transformation = [{ quality: 'auto', fetch_format: 'auto' }];
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(buffer, uploadOptions);

    // Generate thumbnail URL for images
    let thumbnail = null;
    if (resourceType === 'image') {
      thumbnail = cloudinary.url(result.public_id, {
        width: 300,
        height: 300,
        crop: 'fill',
        quality: 'auto',
        format: 'webp'
      });
    }

    // Save file metadata to MongoDB
    const file = await File.create({
      name: originalname,
      originalName: originalname,
      url: result.secure_url,
      publicId: result.public_id,
      type: fileType,
      mimeType: mimetype,
      extension,
      size,
      folderId: folderId || null,
      userId: req.user._id,
      thumbnail,
      resourceType
    });

    // Update user storage used
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { storageUsed: size }
    });

    res.status(201).json({ success: true, file });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
};

// @desc    Get files in a folder
// @route   GET /api/files/:folderId
// @access  Private
const getFiles = async (req, res) => {
  try {
    const { folderId } = req.params;
    const { search, type, sort = 'newest', starred } = req.query;

    const query = { userId: req.user._id };
    
    if (folderId === 'root') {
      query.folderId = null;
    } else {
      query.folderId = folderId;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (type && type !== 'all') {
      query.type = type;
    }

    if (starred === 'true') {
      query.isStarred = true;
    }

    // Sort options
    let sortOption = {};
    switch (sort) {
      case 'newest': sortOption = { createdAt: -1 }; break;
      case 'oldest': sortOption = { createdAt: 1 }; break;
      case 'name_asc': sortOption = { name: 1 }; break;
      case 'name_desc': sortOption = { name: -1 }; break;
      case 'size_desc': sortOption = { size: -1 }; break;
      case 'size_asc': sortOption = { size: 1 }; break;
      default: sortOption = { createdAt: -1 };
    }

    const files = await File.find(query).sort(sortOption);
    res.json({ success: true, files });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ message: 'Error fetching files' });
  }
};

// @desc    Get all files across all folders (with search)
// @route   GET /api/files
// @access  Private
const getAllFiles = async (req, res) => {
  try {
    const { search, type, sort = 'newest', starred } = req.query;

    const query = { userId: req.user._id };

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (type && type !== 'all') {
      query.type = type;
    }

    if (starred === 'true') {
      query.isStarred = true;
    }

    let sortOption = {};
    switch (sort) {
      case 'newest': sortOption = { createdAt: -1 }; break;
      case 'oldest': sortOption = { createdAt: 1 }; break;
      case 'name_asc': sortOption = { name: 1 }; break;
      case 'name_desc': sortOption = { name: -1 }; break;
      case 'size_desc': sortOption = { size: -1 }; break;
      case 'size_asc': sortOption = { size: 1 }; break;
      default: sortOption = { createdAt: -1 };
    }

    const files = await File.find(query).populate('folderId', 'name').sort(sortOption);
    res.json({ success: true, files });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching files' });
  }
};

// @desc    Delete file
// @route   DELETE /api/files/:id
// @access  Private
const deleteFile = async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, userId: req.user._id });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(file.publicId, {
        resource_type: file.resourceType || 'raw'
      });
    } catch (cloudinaryError) {
      console.error('Cloudinary delete error:', cloudinaryError);
    }

    // Update user storage
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { storageUsed: -file.size }
    });

    await File.findByIdAndDelete(file._id);

    res.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ message: 'Error deleting file' });
  }
};

// @desc    Stream PDF for inline preview
// @route   GET /api/files/:id/preview
// @access  Private
const previewFile = async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, userId: req.user._id });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    if (file.type !== 'pdf') {
      return res.status(400).json({ message: 'Preview is only available for PDFs' });
    }

    const sourceUrl = file.url.includes('/upload/')
      ? file.url.replace('/upload/', '/upload/fl_inline/')
      : file.url;
    const client = sourceUrl.startsWith('https') ? https : http;

    client.get(sourceUrl, (cloudinaryRes) => {
      if (cloudinaryRes.statusCode >= 300 && cloudinaryRes.statusCode < 400 && cloudinaryRes.headers.location) {
        return res.redirect(cloudinaryRes.headers.location);
      }

      if (cloudinaryRes.statusCode !== 200) {
        return res.status(502).json({ message: 'Unable to load PDF preview' });
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.name)}"`);
      res.setHeader('Cache-Control', 'private, max-age=300');
      cloudinaryRes.pipe(res);
    }).on('error', (error) => {
      console.error('PDF preview error:', error);
      res.status(500).json({ message: 'Error loading PDF preview' });
    });
  } catch (error) {
    console.error('PDF preview error:', error);
    res.status(500).json({ message: 'Error loading PDF preview' });
  }
};

// @desc    Rename file
// @route   PUT /api/files/:id
// @access  Private
const renameFile = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const file = await File.findOne({ _id: req.params.id, userId: req.user._id });
    if (!file) return res.status(404).json({ message: 'File not found' });

    file.name = name;
    await file.save();

    res.json({ success: true, file });
  } catch (error) {
    res.status(500).json({ message: 'Error renaming file' });
  }
};

// @desc    Move file to another folder
// @route   PUT /api/files/:id/move
// @access  Private
const moveFile = async (req, res) => {
  try {
    const { folderId } = req.body;
    const file = await File.findOne({ _id: req.params.id, userId: req.user._id });
    if (!file) return res.status(404).json({ message: 'File not found' });

    if (folderId) {
      const folder = await Folder.findOne({ _id: folderId, userId: req.user._id });
      if (!folder) return res.status(404).json({ message: 'Destination folder not found' });
    }

    file.folderId = folderId || null;
    await file.save();

    res.json({ success: true, file });
  } catch (error) {
    res.status(500).json({ message: 'Error moving file' });
  }
};

// @desc    Toggle star on file
// @route   PUT /api/files/:id/star
// @access  Private
const toggleStar = async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, userId: req.user._id });
    if (!file) return res.status(404).json({ message: 'File not found' });

    file.isStarred = !file.isStarred;
    await file.save();

    res.json({ success: true, file });
  } catch (error) {
    res.status(500).json({ message: 'Error updating file' });
  }
};

// @desc    Get storage stats
// @route   GET /api/files/stats
// @access  Private
const getStats = async (req, res) => {
  try {
    const stats = await File.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalSize: { $sum: '$size' }
        }
      }
    ]);

    const totalFiles = await File.countDocuments({ userId: req.user._id });
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      stats,
      totalFiles,
      storageUsed: user.storageUsed,
      storageLimit: STORAGE_LIMIT_BYTES
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats' });
  }
};

module.exports = { uploadFile, getFiles, getAllFiles, deleteFile, previewFile, renameFile, moveFile, toggleStar, getStats };
