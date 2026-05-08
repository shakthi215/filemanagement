import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFileManager } from '../../context/FileManagerContext';
import { formatSize, storagePercent } from '../../utils/fileUtils';
import styles from './Sidebar.module.css';

const STORAGE_LIMIT_BYTES = 50 * 1024 * 1024 * 1024;

const FolderTree = ({ folders, allFolders, currentFolderId, onNavigate, level = 0 }) => {
  const [expanded, setExpanded] = useState({});

  const children = (parentId) =>
    allFolders.filter(f => String(f.parentFolderId) === String(parentId));

  return folders.map(folder => {
    const subs = children(folder._id);
    const isActive = currentFolderId === folder._id;
    const isExpanded = expanded[folder._id];

    return (
      <div key={folder._id}>
        <div
          className={`${styles.folderItem} ${isActive ? styles.active : ''}`}
          style={{ paddingLeft: `${12 + level * 16}px` }}
          onClick={() => onNavigate(folder._id)}
        >
          <span className={styles.folderDot} style={{ background: folder.color || '#6366f1' }} />
          <span className={styles.folderName}>{folder.name}</span>
          {subs.length > 0 && (
            <button
              className={styles.expandBtn}
              onClick={(e) => { e.stopPropagation(); setExpanded(p => ({ ...p, [folder._id]: !p[folder._id] })); }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}
        </div>
        {isExpanded && subs.length > 0 && (
          <FolderTree
            folders={subs}
            allFolders={allFolders}
            currentFolderId={currentFolderId}
            onNavigate={onNavigate}
            level={level + 1}
          />
        )}
      </div>
    );
  });
};

export default function Sidebar({ onUploadClick }) {
  const { user, logout } = useAuth();
  const { currentFolderId, activeView, allFolders, stats, navigateTo, showStarred, showRecent, loadAllFolders, loadStats } = useFileManager();

  useEffect(() => {
    loadAllFolders();
    loadStats();
  }, [loadAllFolders, loadStats]);

  const rootFolders = allFolders.filter(f => !f.parentFolderId);
  const storageUsed = stats?.storageUsed || user?.storageUsed || 0;
  const storageLimit = stats?.storageLimit || STORAGE_LIMIT_BYTES;
  const pct = storagePercent(storageUsed, storageLimit);
  const barPct = storageUsed > 0 ? Math.max(pct, 1) : 0;

  const navItems = [
    { icon: '⊞', label: 'All Files', view: 'folder', action: () => navigateTo(null) },
    { icon: '★', label: 'Starred', view: 'starred', action: showStarred },
    { icon: '🕐', label: 'Recent', view: 'recent', action: showRecent },
  ];

  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logoArea}>
        <div className={styles.logoIcon}>⬡</div>
        <span className={styles.logoText}>BizFiles</span>
      </div>

      {/* Upload Button */}
      <button className={styles.uploadBtn} onClick={onUploadClick}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        Upload Files
      </button>

      {/* Nav */}
      <nav className={styles.nav}>
        <span className={styles.sectionLabel}>Navigation</span>
        {navItems.map(item => (
          <button
            key={item.label}
            className={`${styles.navItem} ${activeView === item.view && (!currentFolderId || item.view !== 'folder') ? styles.navActive : ''}`}
            onClick={item.action}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Folders */}
      <div className={styles.foldersSection}>
        <span className={styles.sectionLabel}>Folders</span>
        <div className={styles.folderList}>
          {rootFolders.length === 0 ? (
            <p className={styles.emptyFolders}>No folders yet</p>
          ) : (
            <FolderTree
              folders={rootFolders}
              allFolders={allFolders}
              currentFolderId={currentFolderId}
              onNavigate={navigateTo}
            />
          )}
        </div>
      </div>

      {/* Storage */}
      <div className={styles.storageSection}>
        <div className={styles.storageHeader}>
          <span className={styles.storageLabel}>Storage</span>
          <span className={styles.storageValue}>{pct}%</span>
        </div>
        <div className={styles.storageBar}>
          <div className={styles.storageFill} style={{ width: `${barPct}%` }} />
        </div>
        <p className={styles.storageText}>
          {formatSize(storageUsed)} of {formatSize(storageLimit)} used
        </p>
      </div>

      {/* User */}
      <div className={styles.userArea}>
        <div className={styles.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
        <div className={styles.userInfo}>
          <span className={styles.userName}>{user?.name}</span>
          <span className={styles.userEmail}>{user?.email}</span>
        </div>
        <button className={styles.logoutBtn} onClick={logout} title="Sign out">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
