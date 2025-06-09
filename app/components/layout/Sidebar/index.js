'use client';

import styles from './styles.module.css';
import { TAGS } from '../../../lib/constants';

export default function Sidebar({ issues, selectedTag, onTagSelect }) {
  return (
    <div className={styles.sidebar}>
      <div className={styles.tagList}>
        <h2 className={styles.tagListTitle}>タグ一覧</h2>
        <div className={styles.tagListContent}>
          <div
            className={`${styles.tagItem} ${selectedTag === 'all' ? styles.active : ''}`}
            onClick={() => onTagSelect('all')}
          >
            <span>すべて</span>
            <span className={styles.tagCount}>{issues.length}</span>
          </div>
          {Object.values(TAGS).map((tag) => (
            <div
              key={tag}
              className={`${styles.tagItem} ${selectedTag === tag ? styles.active : ''}`}
              onClick={() => onTagSelect(tag)}
            >
              <span>{tag}</span>
              <span className={styles.tagCount}>
                {issues.filter(issue => issue.tag === tag).length}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 