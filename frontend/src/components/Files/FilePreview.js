import React, { useEffect } from 'react';
import { getFileMeta, formatSize, formatDate } from '../../utils/fileUtils';
import styles from './FilePreview.module.css';

const getInlineUrl = (file) => {
  if (!file?.url) return '';
  if (file.type === 'pdf' && file.url.includes('/upload/')) {
    return file.url.replace('/upload/', '/upload/fl_inline/');
  }
  return file.url;
};

const getPdfViewerUrl = (file) => {
  const inlineUrl = getInlineUrl(file);
  return `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(inlineUrl)}`;
};

export default function FilePreview({ file, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (file) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [file, onClose]);

  if (!file) return null;
  const meta = getFileMeta(file.type);
  const previewUrl = getInlineUrl(file);
  const pdfViewerUrl = file.type === 'pdf' ? getPdfViewerUrl(file) : '';

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
            {file.type === 'pdf' && (
              <a className={styles.openBtn} href={previewUrl} target="_blank" rel="noopener noreferrer">
                Open
              </a>
            )}
            <button className={styles.closeBtn} onClick={onClose}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <div className={styles.content}>
          {file.type === 'image' && (
            <img src={previewUrl} alt={file.name} className={styles.previewImage} />
          )}
          {file.type === 'pdf' && (
            <div className={styles.pdfWrap}>
              <iframe src={pdfViewerUrl} title={file.name} className={styles.previewFrame} />
              <p className={styles.pdfHint}>
                If the preview stays blank, use Open. Some Cloudinary accounts force raw PDFs to download.
              </p>
            </div>
          )}
          {file.mimeType === 'text/plain' && (
            <div className={styles.textPreview}>
              <iframe src={previewUrl} title={file.name} className={styles.previewFrame} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
