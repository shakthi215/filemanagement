// Format file size
export const formatSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

// Format date
export const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Get file type category
export const getFileType = (mimeType) => {
  if (!mimeType) return 'other';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType === 'text/csv') return 'spreadsheet';
  if (mimeType.includes('word') || mimeType === 'text/plain') return 'document';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'presentation';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('zip') || mimeType.includes('rar')) return 'archive';
  return 'other';
};

// File type → icon emoji + color
export const FILE_TYPE_META = {
  image:        { icon: '🖼️',  color: '#06b6d4', label: 'Image',        bg: 'rgba(6,182,212,0.12)' },
  pdf:          { icon: '📄',  color: '#ef4444', label: 'PDF',          bg: 'rgba(239,68,68,0.12)' },
  spreadsheet:  { icon: '📊',  color: '#22c55e', label: 'Spreadsheet',  bg: 'rgba(34,197,94,0.12)' },
  document:     { icon: '📝',  color: '#3b82f6', label: 'Document',     bg: 'rgba(59,130,246,0.12)' },
  presentation: { icon: '📋',  color: '#f59e0b', label: 'Presentation', bg: 'rgba(245,158,11,0.12)' },
  video:        { icon: '🎥',  color: '#8b5cf6', label: 'Video',        bg: 'rgba(139,92,246,0.12)' },
  audio:        { icon: '🎵',  color: '#ec4899', label: 'Audio',        bg: 'rgba(236,72,153,0.12)' },
  archive:      { icon: '📦',  color: '#78716c', label: 'Archive',      bg: 'rgba(120,113,108,0.12)' },
  other:        { icon: '📎',  color: '#94a3b8', label: 'File',         bg: 'rgba(148,163,184,0.12)' },
};

export const getFileMeta = (type) => FILE_TYPE_META[type] || FILE_TYPE_META.other;

// Storage percentage
export const storagePercent = (used, limit) => {
  if (!limit) return 0;
  const percent = (used / limit) * 100;
  if (percent > 0 && percent < 0.1) return Number(percent.toFixed(2));
  if (percent > 0 && percent < 1) return Number(percent.toFixed(1));
  return Math.min(100, Math.round(percent));
};

// Check if file is previewable
export const isPreviewable = (file) => {
  return file.type === 'image' || file.type === 'pdf' || file.mimeType === 'text/plain';
};

// Build Cloudinary thumbnail URL
export const getThumbnailUrl = (file) => {
  if (file.thumbnail) return file.thumbnail;
  if (file.type === 'image') return file.url;
  return null;
};

// FOLDER_COLORS options
export const FOLDER_COLORS = [
  '#6366f1', '#7c6af7', '#3b82f6', '#06b6d4', '#22c55e',
  '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#14b8a6'
];
