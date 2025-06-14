'use client';

import styles from './styles.module.css';
import { TAGS, PRIORITY } from '../../../lib/constants';

export default function IssueForm({ 
  issue, 
  onSubmit, 
  onChange, 
  onCancel, 
  isSubmitting, 
  formErrors, 
  submitError,
  isEdit = false 
}) {
  return (
    <div className={styles.container}>
      <div className={styles.createHeader}>
        <h1 className={styles.title}>{isEdit ? '課題の編集' : '新規課題の作成'}</h1>
        <button 
          className={styles.backButton}
          onClick={onCancel}
        >
          {isEdit ? 'キャンセル' : '一覧に戻る'}
        </button>
      </div>

      <form onSubmit={onSubmit} className={styles.createForm}>
        {submitError && (
          <div className={styles.errorMessage}>
            {submitError}
          </div>
        )}
        
        <div className={styles.formGroup}>
          <label htmlFor="priority">優先度</label>
          <select
            id="priority"
            name="priority"
            value={issue.priority}
            onChange={onChange}
            className={styles.formSelect}
            disabled={isSubmitting}
          >
            {Object.entries(PRIORITY).map(([key, value]) => (
              <option key={key} value={value}>{value}</option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="title">タイトル</label>
          <input
            type="text"
            id="title"
            name="title"
            value={issue.title}
            onChange={onChange}
            className={`${styles.formInput} ${formErrors.title ? styles.error : ''}`}
            placeholder="タイトルを入力してください"
            disabled={isSubmitting}
            required
          />
          {formErrors.title && (
            <span className={styles.errorMessage}>{formErrors.title}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="content">内容</label>
          <textarea
            id="content"
            name="content"
            value={issue.content}
            onChange={onChange}
            className={`${styles.formTextarea} ${formErrors.content ? styles.error : ''}`}
            placeholder="内容を入力してください"
            rows="5"
            disabled={isSubmitting}
            required
          />
          {formErrors.content && (
            <span className={styles.errorMessage}>{formErrors.content}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="tag">タグ</label>
          <select
            id="tag"
            name="tag"
            value={issue.tag}
            onChange={onChange}
            className={styles.formSelect}
            disabled={isSubmitting}
          >
            {Object.entries(TAGS).map(([key, value]) => (
              <option key={key} value={value}>{value}</option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="limit">期限</label>
          <input
            type="date"
            id="limit"
            name="limit"
            value={issue.limit}
            onChange={onChange}
            className={`${styles.formInput} ${formErrors.limit ? styles.error : ''}`}
            disabled={isSubmitting}
            required
          />
          {formErrors.limit && (
            <span className={styles.errorMessage}>{formErrors.limit}</span>
          )}
        </div>

        <div className={styles.formActions}>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? (isEdit ? '更新中...' : '作成中...') : (isEdit ? '更新する' : '作成する')}
          </button>
        </div>
      </form>
    </div>
  );
} 