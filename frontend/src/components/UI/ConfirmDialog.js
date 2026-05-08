import React from 'react';
import Modal from './Modal';
import styles from './ConfirmDialog.module.css';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Delete', danger = true }) {
  const handleConfirm = () => { onConfirm(); onClose(); };
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth={400}>
      <p className={styles.message}>{message}</p>
      <div className={styles.actions}>
        <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
        <button className={danger ? styles.dangerBtn : styles.confirmBtn} onClick={handleConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
