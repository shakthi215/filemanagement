import React, { createContext, useContext, useState, useCallback } from 'react';
import { fileAPI, folderAPI } from '../services/api';
import { toast } from 'react-toastify';

const FileManagerContext = createContext(null);

export const FileManagerProvider = ({ children }) => {
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [allFolders, setAllFolders] = useState([]);
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [stats, setStats] = useState(null);

  const loadFolders = useCallback(async (parentId) => {
    try {
      const res = await folderAPI.getByParent(parentId);
      setFolders(res.data.folders);
    } catch {
      toast.error('Failed to load folders');
    }
  }, []);

  const loadAllFolders = useCallback(async () => {
    try {
      const res = await folderAPI.getAll();
      setAllFolders(res.data.folders);
    } catch {}
  }, []);

  const loadFiles = useCallback(async (folderId, params) => {
    try {
      const res = await fileAPI.getByFolder(folderId, params);
      setFiles(res.data.files);
    } catch {
      toast.error('Failed to load files');
    }
  }, []);

  const loadBreadcrumb = useCallback(async (folderId) => {
    if (!folderId) { setBreadcrumb([]); return; }
    try {
      const res = await folderAPI.getBreadcrumb(folderId);
      setBreadcrumb(res.data.breadcrumb);
    } catch {}
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const res = await fileAPI.getStats();
      setStats(res.data);
    } catch {}
  }, []);

  const navigateTo = useCallback(async (folderId) => {
    setLoading(true);
    setCurrentFolderId(folderId);
    setSearchQuery('');
    await Promise.all([
      loadFolders(folderId),
      loadFiles(folderId, { sort: sortBy, type: filterType }),
      loadBreadcrumb(folderId),
    ]);
    setLoading(false);
  }, [loadFolders, loadFiles, loadBreadcrumb, sortBy, filterType]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      loadFolders(currentFolderId),
      loadFiles(currentFolderId, { search: searchQuery, type: filterType, sort: sortBy }),
      loadAllFolders(),
      loadStats(),
    ]);
    setLoading(false);
  }, [currentFolderId, loadFolders, loadFiles, loadAllFolders, loadStats, searchQuery, filterType, sortBy]);

  const createFolder = useCallback(async (name, color) => {
    const res = await folderAPI.create({ name, parentFolderId: currentFolderId, color });
    setFolders(prev => [res.data.folder, ...prev]);
    setAllFolders(prev => [res.data.folder, ...prev]);
    toast.success(`Folder "${name}" created`);
    return res.data.folder;
  }, [currentFolderId]);

  const deleteFolder = useCallback(async (folderId, folderName) => {
    await folderAPI.delete(folderId);
    setFolders(prev => prev.filter(f => f._id !== folderId));
    setAllFolders(prev => prev.filter(f => f._id !== folderId));
    toast.success(`Folder "${folderName}" deleted`);
  }, []);

  const renameFolder = useCallback(async (folderId, name) => {
    const res = await folderAPI.rename(folderId, { name });
    setFolders(prev => prev.map(f => f._id === folderId ? res.data.folder : f));
    setAllFolders(prev => prev.map(f => f._id === folderId ? res.data.folder : f));
    toast.success('Folder renamed');
  }, []);

  const uploadFile = useCallback(async (file, folderId) => {
    setUploading(true);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (folderId) formData.append('folderId', folderId);
      const res = await fileAPI.upload(formData, setUploadProgress);
      setFiles(prev => [res.data.file, ...prev]);
      toast.success(`"${file.name}" uploaded successfully`);
      loadStats();
      return res.data.file;
    } catch (err) {
      const msg = err.response?.data?.message || 'Upload failed';
      toast.error(msg);
      throw err;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [loadStats]);

  const deleteFile = useCallback(async (fileId, fileName) => {
    await fileAPI.delete(fileId);
    setFiles(prev => prev.filter(f => f._id !== fileId));
    toast.success(`"${fileName}" deleted`);
    loadStats();
  }, [loadStats]);

  const renameFile = useCallback(async (fileId, name) => {
    const res = await fileAPI.rename(fileId, { name });
    setFiles(prev => prev.map(f => f._id === fileId ? res.data.file : f));
    toast.success('File renamed');
  }, []);

  const toggleStar = useCallback(async (fileId) => {
    const res = await fileAPI.toggleStar(fileId);
    setFiles(prev => prev.map(f => f._id === fileId ? res.data.file : f));
  }, []);

  return (
    <FileManagerContext.Provider value={{
      currentFolderId, folders, files, allFolders, breadcrumb,
      loading, uploading, uploadProgress, searchQuery, filterType,
      sortBy, viewMode, stats,
      setSearchQuery, setFilterType, setSortBy, setViewMode,
      navigateTo, refresh, loadAllFolders, loadStats,
      createFolder, deleteFolder, renameFolder,
      uploadFile, deleteFile, renameFile, toggleStar,
    }}>
      {children}
    </FileManagerContext.Provider>
  );
};

export const useFileManager = () => {
  const ctx = useContext(FileManagerContext);
  if (!ctx) throw new Error('useFileManager must be used within FileManagerProvider');
  return ctx;
};
