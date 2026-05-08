import React, { useState } from 'react';
import Modal from '../UI/Modal';
import { useFileManager } from '../../context/FileManagerContext';
import { FOLDER_COLORS } from '../../utils/fileUtils';
import styles from './NewFolderModal.module.css';

export default function NewFolderModal({ isOpen, onClose }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(FOLDER_COLORS[0]);
  const [loading, setLoading] = useState(false);
  const { createFolder } = useFileManager();

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await createFolder(name.trim(), color);
      setName('');
      setColor(FOLDER_COLORS[0]);
      onClose();
    } catch {
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Folder" maxWidth={380}>
      <div className={styles.field}>
        <label className={styles.label}>Folder name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          className={styles.input}
          placeholder="e.g. Q4 Reports"
          autoFocus
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Color</label>
        <div className={styles.colors}>
          {FOLDER_COLORS.map(c => (
            <button
              key={c}
              className={`${styles.colorSwatch} ${color === c ? styles.selected : ''}`}
              style={{ background: c }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className={styles.preview}>
        <div className={styles.previewIcon} style={{ background: `${color}22`, borderColor: `${color}44` }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill={color} fillOpacity="0.85">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <span className={styles.previewName}>{name || 'New Folder'}</span>
      </div>

      <div className={styles.actions}>
        <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
        <button className={styles.createBtn} onClick={handleSubmit} disabled={!name.trim() || loading}>
          {loading ? 'Creating…' : 'Create Folder'}
        </button>
      </div>
    </Modal>
  );
}
