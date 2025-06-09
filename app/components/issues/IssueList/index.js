'use client';

import styles from './styles.module.css';
import { TAGS } from '../../../lib/constants';
import IssueCard from '../IssueCard';

export default function IssueList({ 
  issues, 
  filter, 
  sortBy, 
  onFilterChange, 
  onSortChange, 
  onIssueClick,
  isLoading 
}) {
  if (isLoading) {
    return (
      <div className={styles.issuesList}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={styles.skeletonCard}>
            <div className={styles.skeletonHeader}>
              <div className={`${styles.skeleton} ${styles.skeletonStatus}`} />
              <div className={`${styles.skeleton} ${styles.skeletonPriority}`} />
            </div>
            <div className={`${styles.skeleton} ${styles.skeletonTitle}`} />
            <div className={`${styles.skeleton} ${styles.skeletonContent}`} />
            <div className={styles.skeletonMeta}>
              {[1, 2, 3].map((i) => (
                <div key={i} className={`${styles.skeleton} ${styles.skeletonMetaItem}`} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.content}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${filter === 'all' ? styles.active : ''}`}
          onClick={() => onFilterChange('all')}
        >
          すべて
        </button>
        <button
          className={`${styles.tab} ${filter === 'unresolved' ? styles.active : ''}`}
          onClick={() => onFilterChange('unresolved')}
        >
          未解決
        </button>
        <button
          className={`${styles.tab} ${filter === 'resolved' ? styles.active : ''}`}
          onClick={() => onFilterChange('resolved')}
        >
          解決済み
        </button>
      </div>

      <div className={styles.sortFilters}>
        <span className={styles.sortLabel}>並び替え:</span>
        <button
          className={`${styles.sortButton} ${sortBy === 'newest' ? styles.active : ''}`}
          onClick={() => onSortChange('newest')}
        >
          新着順
        </button>
        <button
          className={`${styles.sortButton} ${sortBy === 'oldest' ? styles.active : ''}`}
          onClick={() => onSortChange('oldest')}
        >
          古い順
        </button>
        <button
          className={`${styles.sortButton} ${sortBy === 'priority' ? styles.active : ''}`}
          onClick={() => onSortChange('priority')}
        >
          優先度順
        </button>
      </div>

      <div className={styles.issuesList}>
        {issues.map((issue) => (
          <IssueCard
            key={issue.id}
            issue={issue}
            onClick={() => onIssueClick(issue)}
          />
        ))}
      </div>
    </div>
  );
} 