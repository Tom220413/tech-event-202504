'use client';

import styles from './styles.module.css';

export default function Header({ user, onSignOut, onCreateClick }) {
  return (
    <div className={styles.header}>
      <h1 className={styles.title}>開発課題管理</h1>
      <div className={styles.headerActions}>
        <div className={styles.userInfo}>
          <span className={styles.userName}>
            {user?.user_metadata?.display_name || user?.email || 'ユーザー'}
          </span>
          <button 
            className={styles.logoutButton}
            onClick={onSignOut}
          >
            ログアウト
          </button>
        </div>
        <button 
          className={styles.createButton}
          onClick={onCreateClick}
        >
          新規作成
        </button>
      </div>
    </div>
  );
} 