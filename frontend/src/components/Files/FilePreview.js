import React, { useEffect, useState } from 'react';
import { useFileManager } from '../../context/FileManagerContext';
import { getFileMeta, formatSize, formatDate } from '../../utils/fileUtils';
import { fileAPI } from '../../services/api';
import styles from './FilePreview.module.css';

const getInlineUrl = (file) => {
  if (!file?.url) return '';
  if (file.type === 'pdf' && file.url.includes('/upload/')) {
    return file.url.replace('/upload/', '/upload/fl_inline/');
  }
  return file.url;
};

export default function FilePreview({ file, onClose }) {
  const { downloadFile } = useFileManager();
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState('');

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (file) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [file, onClose]);

  useEffect(() => {
    let objectUrl = '';
    let cancelled = false;

    const loadPdf = async () => {
      if (!file || file.type !== 'pdf') {
        setPdfUrl('');
        setPdfError('');
        setPdfLoading(false);
        return;
      }

      setPdfLoading(true);
      setPdfError('');

      try {
        const res = await fileAPI.preview(file._id);
        if (cancelled) return;
        const blob = new Blob([res.data], { type: 'application/pdf' });
        objectUrl = URL.createObjectURL(blob);
        setPdfUrl(objectUrl);
      } catch {
        if (!cancelled) setPdfError('PDF preview could not be loaded. Use Open or Download.');
      } finally {
        if (!cancelled) setPdfLoading(false);
      }
    };

    loadPdf();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  if (!file) return null;
  const meta = getFileMeta(file.type);
  const previewUrl = getInlineUrl(file);

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
            <button className={styles.downloadBtn} onClick={() => downloadFile(file)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download
            </button>
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
              {pdfLoading && <p className={styles.pdfStatus}>Loading PDF preview...</p>}
              {pdfError && <p className={styles.pdfStatus}>{pdfError}</p>}
              {pdfUrl && <iframe src={pdfUrl} title={file.name} className={styles.previewFrame} />}
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
