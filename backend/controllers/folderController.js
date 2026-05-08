const Folder = require('../models/Folder');
const File = require('../models/File');

// @desc    Create folder
// @route   POST /api/folders/create
// @access  Private
const createFolder = async (req, res) => {
  try {
    const { name, parentFolderId, color } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Folder name is required' });
    }

    // Validate parent folder belongs to user
    if (parentFolderId) {
      const parent = await Folder.findOne({ _id: parentFolderId, userId: req.user._id });
      if (!parent) {
        return res.status(404).json({ message: 'Parent folder not found' });
      }
    }

    const folder = await Folder.create({
      name: name.trim(),
      userId: req.user._id,
      parentFolderId: parentFolderId || null,
      color: color || '#6366f1'
    });

    res.status(201).json({ success: true, folder });
  } catch (error) {
    console.error('Create folder error:', error);
    res.status(500).json({ message: 'Error creating folder' });
  }
};

// @desc    Get all folders (optionally by parent)
// @route   GET /api/folders
// @access  Private
const getFolders = async (req, res) => {
  try {
    const { parentFolderId } = req.query;

    const query = { userId: req.user._id };
    if (parentFolderId === 'root' || !parentFolderId) {
      query.parentFolderId = null;
    } else {
      query.parentFolderId = parentFolderId;
    }

    const folders = await Folder.find(query).sort({ createdAt: -1 });

    // Get file count per folder
    const folderIds = folders.map(f => f._id);
    const fileCounts = await File.aggregate([
      { $match: { folderId: { $in: folderIds }, userId: req.user._id } },
      { $group: { _id: '$folderId', count: { $sum: 1 } } }
    ]);

    const fileCountMap = {};
    fileCounts.forEach(fc => { fileCountMap[fc._id.toString()] = fc.count; });

    const foldersWithCount = folders.map(f => ({
      ...f.toObject(),
      fileCount: fileCountMap[f._id.toString()] || 0
    }));

    res.json({ success: true, folders: foldersWithCount });
  } catch (error) {
    console.error('Get folders error:', error);
    res.status(500).json({ message: 'Error fetching folders' });
  }
};

// @desc    Get all folders flat list (for sidebar tree)
// @route   GET /api/folders/all
// @access  Private
const getAllFolders = async (req, res) => {
  try {
    const folders = await Folder.find({ userId: req.user._id }).sort({ name: 1 });
    res.json({ success: true, folders });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching folders' });
  }
};

// @desc    Rename folder
// @route   PUT /api/folders/:id
// @access  Private
const renameFolder = async (req, res) => {
  try {
    const { name, color } = req.body;
    const folder = await Folder.findOne({ _id: req.params.id, userId: req.user._id });

    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    if (name) folder.name = name.trim();
    if (color) folder.color = color;
    await folder.save();

    res.json({ success: true, folder });
  } catch (error) {
    res.status(500).json({ message: 'Error updating folder' });
  }
};

// @desc    Delete folder
// @route   DELETE /api/folders/:id
// @access  Private
const deleteFolder = async (req, res) => {
  try {
    const folder = await Folder.findOne({ _id: req.params.id, userId: req.user._id });
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    // Get all nested folder IDs recursively
    const getAllSubFolderIds = async (folderId) => {
      const subFolders = await Folder.find({ parentFolderId: folderId, userId: req.user._id });
      let ids = [folderId];
      for (const sub of subFolders) {
        const subIds = await getAllSubFolderIds(sub._id);
        ids = ids.concat(subIds);
      }
      return ids;
    };

    const allFolderIds = await getAllSubFolderIds(folder._id);

    // Delete all files in these folders from Cloudinary and DB
    const cloudinary = require('../config/cloudinary');
    const files = await File.find({ folderId: { $in: allFolderIds }, userId: req.user._id });

    for (const file of files) {
      try {
        await cloudinary.uploader.destroy(file.publicId, { resource_type: file.resourceType || 'raw' });
      } catch (err) {
        console.error('Cloudinary delete error:', err);
      }
    }

    await File.deleteMany({ folderId: { $in: allFolderIds }, userId: req.user._id });
    await Folder.deleteMany({ _id: { $in: allFolderIds }, userId: req.user._id });

    res.json({ success: true, message: 'Folder and all contents deleted' });
  } catch (error) {
    console.error('Delete folder error:', error);
    res.status(500).json({ message: 'Error deleting folder' });
  }
};

// @desc    Get breadcrumb path for a folder
// @route   GET /api/folders/:id/breadcrumb
// @access  Private
const getBreadcrumb = async (req, res) => {
  try {
    const breadcrumb = [];
    let currentId = req.params.id;

    while (currentId) {
      const folder = await Folder.findOne({ _id: currentId, userId: req.user._id });
      if (!folder) break;
      breadcrumb.unshift({ id: folder._id, name: folder.name });
      currentId = folder.parentFolderId;
    }

    res.json({ success: true, breadcrumb });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching breadcrumb' });
  }
};

module.exports = { createFolder, getFolders, getAllFolders, renameFolder, deleteFolder, getBreadcrumb };
