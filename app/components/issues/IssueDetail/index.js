'use client';

import styles from './styles.module.css';

export default function IssueDetail({ 
  issue, 
  onStatusToggle, 
  onEditClick, 
  onBackClick 
}) {
  const calculateDaysPassed = (dateString) => {
    const created = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case '高':
        return styles.priorityHigh;
      case '中':
        return styles.priorityMedium;
      case '低':
        return styles.priorityLow;
      default:
        return '';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.createHeader}>
        <h1 className={styles.title}>課題の詳細</h1>
        <div className={styles.detailActions}>
          <button 
            className={styles.statusToggleButton}
            onClick={onStatusToggle}
          >
            {issue.flg ? '未解決に戻す' : '解決済みにする'}
          </button>
          <button 
            className={styles.editButton}
            onClick={onEditClick}
          >
            編集
          </button>
          <button 
            className={styles.backButton}
            onClick={onBackClick}
          >
            一覧に戻る
          </button>
        </div>
      </div>

      <div className={styles.detailCard}>
        <div className={styles.detailHeader}>
          <div className={styles.detailStatus}>
            <span className={`${styles.priority} ${getPriorityClass(issue.urgency)}`}>
              {issue.urgency}
            </span>
            <span className={`${styles.status} ${issue.flg ? styles.statusResolved : styles.statusUnresolved}`}>
              {issue.flg ? '解決済み' : '未解決'}
            </span>
          </div>
          <div className={styles.detailTag}>
            <span className={styles.tag}>
              <svg className={styles.tagIcon} viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/>
              </svg>
              {issue.tag}
            </span>
          </div>
        </div>

        <h2 className={styles.detailTitle}>{issue.title}</h2>
        
        <div className={styles.detailContent}>
          <h3 className={styles.detailContentTitle}>内容</h3>
          <p className={styles.detailContentText}>{issue.content}</p>
        </div>

        <div className={styles.detailMeta}>
          <div className={styles.detailMetaItem}>
            <span className={styles.detailMetaLabel}>担当者</span>
            <span className={styles.detailMetaValue}>{issue.username}</span>
          </div>
          <div className={styles.detailMetaItem}>
            <span className={styles.detailMetaLabel}>登録日</span>
            <span className={styles.detailMetaValue}>{issue.create_date}</span>
          </div>
          <div className={styles.detailMetaItem}>
            <span className={styles.detailMetaLabel}>期限</span>
            <span className={styles.detailMetaValue}>{issue.limit}</span>
          </div>
          <div className={styles.detailMetaItem}>
            <span className={styles.detailMetaLabel}>経過日数</span>
            <span className={styles.detailMetaValue}>{calculateDaysPassed(issue.create_date)}日</span>
          </div>
        </div>
      </div>
    </div>
  );
} 