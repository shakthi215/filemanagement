import React, { useState, useEffect } from 'react';
import { useFileManager } from '../context/FileManagerContext';
import Sidebar from '../components/Dashboard/Sidebar';
import Toolbar from '../components/Dashboard/Toolbar';
import Breadcrumb from '../components/Dashboard/Breadcrumb';
import FolderGrid from '../components/Folders/FolderGrid';
import FileGrid from '../components/Files/FileGrid';
import UploadZone from '../components/Files/UploadZone';
import NewFolderModal from '../components/Folders/NewFolderModal';
import Spinner from '../components/UI/Spinner';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const { navigateTo, loading, currentFolderId, breadcrumb } = useFileManager();

  useEffect(() => {
    navigateTo(null);
    // eslint-disable-next-line
  }, []);

  const title = breadcrumb.length > 0
    ? breadcrumb[breadcrumb.length - 1]?.name
    : 'My Files';

  const subtitle = currentFolderId
    ? `${breadcrumb.map(b => b.name).join(' / ')}`
    : 'All your business files in one place';

  return (
    <div className={styles.layout}>
      <Sidebar onUploadClick={() => setUploadOpen(true)} />

      <main className={styles.main}>
        <Toolbar
          title={title}
          subtitle={subtitle}
          onNewFolder={() => setNewFolderOpen(true)}
          onUpload={() => setUploadOpen(true)}
        />

        {breadcrumb.length > 0 && <Breadcrumb />}

        <div className={styles.content}>
          {loading ? (
            <div className={styles.loadingState}>
              <Spinner size={36} />
              <p className={styles.loadingText}>Loading files…</p>
            </div>
          ) : (
            <>
              <FolderGrid />
              <FileGrid />
            </>
          )}
        </div>
      </main>

      <UploadZone isOpen={uploadOpen} onClose={() => setUploadOpen(false)} />
      <NewFolderModal isOpen={newFolderOpen} onClose={() => setNewFolderOpen(false)} />
    </div>
  );
}
