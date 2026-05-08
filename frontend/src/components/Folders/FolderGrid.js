import React, { useState } from 'react';
import { useFileManager } from '../../context/FileManagerContext';
import ConfirmDialog from '../UI/ConfirmDialog';
import Modal from '../UI/Modal';
import styles from './FolderGrid.module.css';

export default function FolderGrid() {
  const { folders, navigateTo, deleteFolder, renameFolder } = useFileManager();
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [renaming, setRenaming] = useState(null);
  const [newName, setNewName] = useState('');
  const [contextMenu, setContextMenu] = useState(null);

  const handleRightClick = (e, folder) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, folder });
  };

  const handleRename = async () => {
    if (!newName.trim()) return;
    try {
      await renameFolder(renaming._id, newName.trim());
      setRenaming(null);
      setNewName('');
    } catch {}
  };

  if (folders.length === 0) return null;

  return (
    <>
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          Folders <span className={styles.count}>{folders.length}</span>
        </h2>
        <div className={styles.grid}>
          {folders.map(folder => (
            <div
              key={folder._id}
              className={styles.folder}
              onDoubleClick={() => navigateTo(folder._id)}
              onContextMenu={(e) => handleRightClick(e, folder)}
              title="Double-click to open"
            >
              <div className={styles.folderIcon} style={{ background: `${folder.color}22`, borderColor: `${folder.color}44` }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill={folder.color} fillOpacity="0.85">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div className={styles.folderInfo}>
                <span className={styles.folderName}>{folder.name}</span>
                <span className={styles.folderMeta}>
                  {folder.fileCount || 0} file{folder.fileCount !== 1 ? 's' : ''}
                </span>
              </div>
              <button
                className={styles.menuBtn}
                onClick={(e) => { e.stopPropagation(); handleRightClick(e, folder); }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Context menu */}
      {contextMenu && (
        <>
          <div className={styles.overlay} onClick={() => setContextMenu(null)} />
          <div className={styles.contextMenu} style={{ top: contextMenu.y, left: contextMenu.x }}>
            <button onClick={() => { navigateTo(contextMenu.folder._id); setContextMenu(null); }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              Open
            </button>
            <button onClick={() => {
              setRenaming(contextMenu.folder);
              setNewName(contextMenu.folder.name);
              setContextMenu(null);
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Rename
            </button>
            <button className={styles.dangerItem} onClick={() => {
              setConfirmDelete(contextMenu.folder);
              setContextMenu(null);
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
              Delete
            </button>
          </div>
        </>
      )}

      {/* Rename modal */}
      <Modal isOpen={!!renaming} onClose={() => setRenaming(null)} title="Rename Folder" maxWidth={380}>
        <input
          type="text"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleRename()}
          className={styles.renameInput}
          placeholder="Folder name"
          autoFocus
        />
        <div className={styles.renameActions}>
          <button className={styles.cancelBtn} onClick={() => setRenaming(null)}>Cancel</button>
          <button className={styles.confirmBtn} onClick={handleRename}>Rename</button>
        </div>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => deleteFolder(confirmDelete._id, confirmDelete.name)}
        title="Delete Folder"
        message={`Delete "${confirmDelete?.name}" and all its contents? This cannot be undone.`}
        confirmLabel="Delete Forever"
      />
    </>
  );
}
