import React, { useState, useEffect } from 'react';
import { useFileManager } from '../../context/FileManagerContext';
import { formatSize, formatDate, getFileMeta, isPreviewable, getThumbnailUrl } from '../../utils/fileUtils';
import ConfirmDialog from '../UI/ConfirmDialog';
import Modal from '../UI/Modal';
import FilePreview from './FilePreview';
import styles from './FileGrid.module.css';

function FileCard({ file, viewMode, onDelete, onRename, onToggleStar, onPreview, onDownload }) {
  const [showMenu, setShowMenu] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const meta = getFileMeta(file.type);
  const thumb = getThumbnailUrl(file);

  const openMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuPos({
      x: Math.min(e.clientX, window.innerWidth - 180),
      y: Math.min(e.clientY, window.innerHeight - 260)
    });
    setShowMenu(true);
  };

  if (viewMode === 'list') {
    return (
      <div className={styles.listRow} onContextMenu={openMenu}>
        <div className={styles.listIcon} style={{ background: meta.bg }}>
          {thumb
            ? <img src={thumb} alt={file.name} className={styles.listThumb} />
            : <span style={{ fontSize: '1.1rem' }}>{meta.icon}</span>}
        </div>
        <div className={styles.listName}>
          <span className={styles.fileName}>{file.name}</span>
        </div>
        <span className={styles.listType} style={{ color: meta.color }}>{meta.label}</span>
        <span className={styles.listSize}>{formatSize(file.size)}</span>
        <span className={styles.listDate}>{formatDate(file.createdAt)}</span>
        <div className={styles.listActions}>
          <button className={`${styles.starBtn} ${file.isStarred ? styles.starred : ''}`} onClick={() => onToggleStar(file._id)} title="Star">★</button>
          {isPreviewable(file) && (
            <button className={styles.actionBtn} onClick={() => onPreview(file)} title="Preview">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          )}
          <button className={styles.actionBtn} onClick={() => onDownload(file)} title="Download">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </button>
          <button className={styles.actionBtn} onClick={() => onRename(file)} title="Rename">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => onDelete(file)} title="Delete">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>

        {showMenu && (
          <>
            <div className={styles.ctxOverlay} onClick={() => setShowMenu(false)} />
            <ContextMenu x={menuPos.x} y={menuPos.y} file={file} meta={meta}
              onClose={() => setShowMenu(false)} onDelete={onDelete} onRename={onRename}
              onToggleStar={onToggleStar} onPreview={onPreview} onDownload={onDownload} />
          </>
        )}
      </div>
    );
  }

  return (
    <div className={styles.card} onContextMenu={openMenu} onClick={() => isPreviewable(file) && onPreview(file)}>
      <div className={styles.cardThumb} style={{ background: meta.bg }}>
        {thumb
          ? <img src={thumb} alt={file.name} className={styles.thumbImg} />
          : <span style={{ fontSize: '2.4rem' }}>{meta.icon}</span>}
        <div className={styles.cardOverlay}>
          {isPreviewable(file) && (
            <button className={styles.previewBtn} onClick={(e) => { e.stopPropagation(); onPreview(file); }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          )}
        </div>
        <button
          className={`${styles.starBtn} ${file.isStarred ? styles.starred : ''}`}
          onClick={(e) => { e.stopPropagation(); onToggleStar(file._id); }}
        >★</button>
      </div>
      <div className={styles.cardInfo}>
        <span className={styles.cardName}>{file.name}</span>
        <div className={styles.cardMeta}>
          <span className={styles.cardType} style={{ color: meta.color, background: meta.bg }}>{meta.icon} {meta.label}</span>
          <span className={styles.cardSize}>{formatSize(file.size)}</span>
        </div>
        <span className={styles.cardDate}>{formatDate(file.createdAt)}</span>
      </div>
      <button className={styles.cardMenu} onClick={(e) => { e.stopPropagation(); openMenu(e); }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
        </svg>
      </button>

      {showMenu && (
        <>
          <div className={styles.ctxOverlay} onClick={() => setShowMenu(false)} />
          <ContextMenu x={menuPos.x} y={menuPos.y} file={file} meta={meta}
            onClose={() => setShowMenu(false)} onDelete={onDelete} onRename={onRename}
            onToggleStar={onToggleStar} onPreview={onPreview} onDownload={onDownload} />
        </>
      )}
    </div>
  );
}

function ContextMenu({ x, y, file, meta, onClose, onDelete, onRename, onToggleStar, onPreview, onDownload }) {
  return (
    <div className={styles.contextMenu} style={{ top: y, left: x }}>
      {isPreviewable(file) && (
        <button onClick={() => { onPreview(file); onClose(); }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          Preview
        </button>
      )}
      <button onClick={() => { onDownload(file); onClose(); }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Download
      </button>
      <button onClick={() => { onToggleStar(file._id); onClose(); }}>
        <span style={{ fontSize: '0.9rem' }}>★</span>
        {file.isStarred ? 'Unstar' : 'Star'}
      </button>
      <button onClick={() => { onRename(file); onClose(); }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        Rename
      </button>
      <div className={styles.ctxDivider} />
      <button className={styles.dangerItem} onClick={() => { onDelete(file); onClose(); }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
        Delete
      </button>
    </div>
  );
}

export default function FileGrid() {
  const { files, viewMode, filterType, sortBy, searchQuery, loadFiles, currentFolderId, deleteFile, renameFile, toggleStar, downloadFile } = useFileManager();
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [renaming, setRenaming] = useState(null);
  const [newName, setNewName] = useState('');
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    loadFiles(currentFolderId, { search: searchQuery, type: filterType, sort: sortBy });
  }, [searchQuery, filterType, sortBy, currentFolderId, loadFiles]);

  const handleDelete = (file) => setConfirmDelete(file);
  const handleRename = (file) => { setRenaming(file); setNewName(file.name); };

  const doRename = async () => {
    if (!newName.trim()) return;
    try {
      await renameFile(renaming._id, newName.trim());
      setRenaming(null);
    } catch {}
  };

  if (files.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>📂</div>
        <p className={styles.emptyTitle}>{searchQuery ? 'No files match your search' : 'No files here yet'}</p>
        <p className={styles.emptyMsg}>{searchQuery ? 'Try a different search term' : 'Upload files to get started'}</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          </svg>
          Files <span className={styles.count}>{files.length}</span>
        </h2>

        {viewMode === 'grid' ? (
          <div className={styles.grid}>
            {files.map(file => (
              <FileCard key={file._id} file={file} viewMode="grid"
                onDelete={handleDelete} onRename={handleRename}
                onToggleStar={toggleStar} onPreview={setPreview} onDownload={downloadFile} />
            ))}
          </div>
        ) : (
          <div className={styles.listContainer}>
            <div className={styles.listHeader}>
              <span>Name</span><span>Type</span><span>Size</span><span>Date</span><span>Actions</span>
            </div>
            {files.map(file => (
              <FileCard key={file._id} file={file} viewMode="list"
                onDelete={handleDelete} onRename={handleRename}
                onToggleStar={toggleStar} onPreview={setPreview} onDownload={downloadFile} />
            ))}
          </div>
        )}
      </div>

      {/* Rename modal */}
      <Modal isOpen={!!renaming} onClose={() => setRenaming(null)} title="Rename File" maxWidth={400}>
        <input
          type="text" value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && doRename()}
          className={styles.renameInput} placeholder="File name" autoFocus
        />
        <div className={styles.renameActions}>
          <button className={styles.cancelBtn} onClick={() => setRenaming(null)}>Cancel</button>
          <button className={styles.confirmBtn} onClick={doRename}>Rename</button>
        </div>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)}
        onConfirm={() => deleteFile(confirmDelete._id, confirmDelete.name)}
        title="Delete File"
        message={`Delete "${confirmDelete?.name}"? This will also remove it from Cloudinary.`}
        confirmLabel="Delete File"
      />

      {/* Preview */}
      <FilePreview file={preview} onClose={() => setPreview(null)} />
    </>
  );
}
