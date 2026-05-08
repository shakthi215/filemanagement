import React from 'react';
import { useFileManager } from '../../context/FileManagerContext';
import styles from './Breadcrumb.module.css';

export default function Breadcrumb() {
  const { breadcrumb, navigateTo } = useFileManager();

  if (breadcrumb.length === 0) return null;

  return (
    <nav className={styles.breadcrumb} aria-label="Breadcrumb">
      <button className={styles.crumb} onClick={() => navigateTo(null)}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        </svg>
        Home
      </button>

      {breadcrumb.map((crumb, i) => (
        <React.Fragment key={crumb.id}>
          <svg className={styles.sep} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <button
            className={`${styles.crumb} ${i === breadcrumb.length - 1 ? styles.current : ''}`}
            onClick={() => navigateTo(crumb.id)}
            disabled={i === breadcrumb.length - 1}
          >
            {crumb.name}
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
}
