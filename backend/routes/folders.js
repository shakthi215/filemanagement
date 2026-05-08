const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createFolder, getFolders, getAllFolders,
  renameFolder, deleteFolder, getBreadcrumb
} = require('../controllers/folderController');

router.use(protect);

router.post('/create', createFolder);
router.get('/', getFolders);
router.get('/all', getAllFolders);
router.get('/:id/breadcrumb', getBreadcrumb);
router.put('/:id', renameFolder);
router.delete('/:id', deleteFolder);

module.exports = router;
