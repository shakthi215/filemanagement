const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const {
  uploadFile, getFiles, getAllFiles, deleteFile,
  previewFile, renameFile, moveFile, toggleStar, getStats
} = require('../controllers/fileController');

router.use(protect);

router.get('/stats', getStats);
router.get('/', getAllFiles);
router.post('/upload', upload.single('file'), uploadFile);
router.get('/:id/preview', previewFile);
router.get('/:folderId', getFiles);
router.put('/:id', renameFile);
router.put('/:id/move', moveFile);
router.put('/:id/star', toggleStar);
router.delete('/:id', deleteFile);

module.exports = router;
