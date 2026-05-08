import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useFileManager } from '../../context/FileManagerContext';
import Modal from '../UI/Modal';
import Spinner from '../UI/Spinner';
import styles from './UploadZone.module.css';

const MAX_SIZE = 50 * 1024 * 1024; // 50MB

const ACCEPTED_TYPES = {
  'image/*': ['.jpg','.jpeg','.png','.gif','.webp','.svg'],
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'text/csv': ['.csv'],
  'application/vnd.ms-powerpoint': ['.ppt'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
  'text/plain': ['.txt'],
  'application/zip': ['.zip'],
  'video/mp4': ['.mp4'],
  'audio/mpeg': ['.mp3'],
};

export default function UploadZone({ isOpen, onClose }) {
  const { uploadFile, currentFolderId, uploading, uploadProgress } = useFileManager();
  const [queue, setQueue] = useState([]);
  const [errors, setErrors] = useState([]);

  const onDrop = useCallback((accepted, rejected) => {
    const newErrors = rejected.map(r => ({
      name: r.file.name,
      error: r.errors[0]?.code === 'file-too-large'
        ? 'File exceeds 50MB limit'
        : r.errors[0]?.message || 'Invalid file type'
    }));
    setErrors(prev => [...prev, ...newErrors]);
    setQueue(prev => [
      ...prev,
      ...accepted.map(f => ({ file: f, id: Math.random().toString(36).slice(2), status: 'pending' }))
    ]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: MAX_SIZE,
    accept: ACCEPTED_TYPES,
  });

  const handleUploadAll = async () => {
    const pending = queue.filter(q => q.status === 'pending');
    for (const item of pending) {
      setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'uploading' } : q));
      try {
        await uploadFile(item.file, currentFolderId);
        setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'done' } : q));
      } catch {
        setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'error' } : q));
      }
    }
  };

  const removeItem = (id) => setQueue(prev => prev.filter(q => q.id !== id));

  const handleClose = () => {
    setQueue([]);
    setErrors([]);
    onClose();
  };

  const pendingCount = queue.filter(q => q.status === 'pending').length;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Upload Files" maxWidth={520}>
      {/* Dropzone */}
      <div {...getRootProps()} className={`${styles.dropzone} ${isDragActive ? styles.active : ''}`}>
        <input {...getInputProps()} />
        <div className={styles.dropContent}>
          <div className={styles.dropIcon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
          <p className={styles.dropTitle}>{isDragActive ? 'Drop files here' : 'Drag & drop files'}</p>
          <p className={styles.dropSub}>or <span className={styles.browseLink}>browse</span> · Max 50MB per file</p>
          <p className={styles.dropTypes}>Images · PDF · Word · Excel · PowerPoint · ZIP · Video · Audio</p>
        </div>
      </div>

      {/* Error list */}
      {errors.length > 0 && (
        <div className={styles.errorList}>
          {errors.map((e, i) => (
            <div key={i} className={styles.errorItem}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--error)" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>{e.name}: {e.error}</span>
            </div>
          ))}
        </div>
      )}

      {/* File queue */}
      {queue.length > 0 && (
        <div className={styles.queue}>
          {queue.map(item => (
            <div key={item.id} className={styles.queueItem}>
              <span className={styles.queueName}>{item.file.name}</span>
              <span className={styles.queueSize}>{(item.file.size / 1024 / 1024).toFixed(1)} MB</span>
              <div className={styles.queueStatus}>
                {item.status === 'pending' && <span className={styles.badge}>Pending</span>}
                {item.status === 'uploading' && <><Spinner size={14} /><span style={{ color: 'var(--accent)', fontSize: '0.75rem' }}>{uploadProgress}%</span></>}
                {item.status === 'done' && <span className={`${styles.badge} ${styles.done}`}>✓ Done</span>}
                {item.status === 'error' && <span className={`${styles.badge} ${styles.error}`}>Failed</span>}
              </div>
              {item.status === 'pending' && (
                <button className={styles.removeBtn} onClick={() => removeItem(item.id)}>×</button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className={styles.actions}>
        <button className={styles.cancelBtn} onClick={handleClose}>
          {queue.some(q => q.status === 'done') ? 'Close' : 'Cancel'}
        </button>
        {pendingCount > 0 && (
          <button className={styles.uploadBtn} onClick={handleUploadAll} disabled={uploading}>
            {uploading
              ? <><Spinner size={16} color="#fff" /> Uploading…</>
              : `Upload ${pendingCount} file${pendingCount !== 1 ? 's' : ''}`}
          </button>
        )}
      </div>
    </Modal>
  );
}
