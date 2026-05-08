import React, { useEffect } from 'react';
import { getFileMeta, formatSize, formatDate } from '../../utils/fileUtils';
import styles from './FilePreview.module.css';

export default function FilePreview({ file, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (file) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [file, onClose]);

  if (!file) return null;
  const meta = getFileMeta(file.type);

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.fileInfo}>
            <span style={{ fontSize: '1.2rem' }}>{meta.icon}</span>
            <div>
              <p className={styles.fileName}>{file.name}</p>
              <p className={styles.fileMeta}>{formatSize(file.size)} · {formatDate(file.createdAt)}</p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <a className={styles.downloadBtn} href={file.url} target="_blank" rel="noopener noreferrer" download={file.name}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download
            </a>
            <button className={styles.closeBtn} onClick={onClose}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <div className={styles.content}>
          {file.type === 'image' && (
            <img src={file.url} alt={file.name} className={styles.previewImage} />
          )}
          {file.type === 'pdf' && (
            <iframe src={file.url} title={file.name} className={styles.previewFrame} />
          )}
          {file.mimeType === 'text/plain' && (
            <div className={styles.textPreview}>
              <iframe src={file.url} title={file.name} className={styles.previewFrame} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
