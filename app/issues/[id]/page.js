'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../page.module.css';

const TAGS = {
  DEVELOPMENT: '開発',
  DESIGN: 'デザイン',
  DOCUMENTATION: 'ドキュメント',
  INFRASTRUCTURE: 'インフラ',
  OTHER: 'その他'
};

// 優先度の列挙型
const PRIORITY = {
  HIGH: '高',
  MEDIUM: '中',
  LOW: '低'
};

export default function IssueDetail({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [issue, setIssue] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editedIssue, setEditedIssue] = useState(null);
  const [error, setError] = useState(null);
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const fetchIssue = async () => {
      if (!isMounted) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/issues/${resolvedParams.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || '課題の取得に失敗しました');
        }
        
        if (!isMounted) return;

        setIssue(data);
        setEditedIssue(data);
      } catch (error) {
        if (!isMounted) return;
        console.error('Failed to fetch issue:', error);
        setError(error.message || 'データの取得に失敗しました');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchIssue();

    return () => {
      isMounted = false;
    };
  }, [resolvedParams.id]);

  const handleEditClick = () => {
    setEditedIssue({ ...issue });
    setIsEditMode(true);
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    // 実際のAPI呼び出しに置き換える
    router.push('/');
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
  };

  const handleStatusToggle = async () => {
    try {
      const response = await fetch('/api/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: resolvedParams.id,
          flg: !issue.flg
        }),
      });

      if (!response.ok) {
        throw new Error('状態の更新に失敗しました');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || '状態の更新に失敗しました');
      }

      // 現在のissueの状態を更新
      setIssue(prevIssue => ({
        ...prevIssue,
        flg: !prevIssue.flg
      }));

      // 一覧画面のデータを更新
      const updatedIssues = issues.map(i => 
        i.id === resolvedParams.id 
          ? { ...i, flg: !i.flg }
          : i
      );
      setIssues(updatedIssues);

    } catch (error) {
      console.error('Failed to update issue status:', error);
      setError(error.message || '状態の更新に失敗しました');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: resolvedParams.id,
          ...editedIssue
        }),
      });

      if (!response.ok) {
        throw new Error('更新に失敗しました');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || '更新に失敗しました');
      }

      setIssue(result.data);
      setIsEditMode(false);
    } catch (error) {
      console.error('Failed to update issue:', error);
      setError(error.message || '更新に失敗しました');
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditedIssue(prev => ({
      ...prev,
      [name]: value
    }));
  };

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

  const handleBackClick = () => {
    router.push('/?refresh=true');
  };

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.createHeader}>
          <h1 className={styles.title}>エラー</h1>
          <button 
            className={styles.backButton}
            onClick={() => router.push('/')}
          >
            一覧に戻る
          </button>
        </div>
        <div className={styles.errorMessage}>
          {error}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.createHeader}>
          <h1 className={styles.title}>課題の詳細</h1>
        </div>
        <div className={styles.skeletonDetailCard}>
          <div className={styles.skeletonDetailHeader}>
            <div className={`${styles.skeleton} ${styles.skeletonStatus}`} />
            <div className={`${styles.skeleton} ${styles.skeletonPriority}`} />
          </div>
          <div className={`${styles.skeleton} ${styles.skeletonDetailTitle}`} />
          <div className={`${styles.skeleton} ${styles.skeletonDetailContent}`} />
          <div className={styles.skeletonDetailMeta}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`${styles.skeleton} ${styles.skeletonDetailMetaItem}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className={styles.container}>
        <div className={styles.createHeader}>
          <h1 className={styles.title}>エラー</h1>
          <button 
            className={styles.backButton}
            onClick={() => router.push('/')}
          >
            一覧に戻る
          </button>
        </div>
        <div className={styles.errorMessage}>
          課題が見つかりませんでした
        </div>
      </div>
    );
  }

  if (isEditMode) {
    return (
      <div className={styles.container}>
        <div className={styles.createHeader}>
          <h1 className={styles.title}>課題の編集</h1>
          <button 
            className={styles.backButton}
            onClick={() => setIsEditMode(false)}
          >
            キャンセル
          </button>
        </div>

        <form onSubmit={handleEditSubmit} className={styles.createForm}>
          <div className={styles.formGroup}>
            <label htmlFor="priority">優先度</label>
            <select
              id="priority"
              name="urgency"
              value={editedIssue.urgency}
              onChange={handleEditInputChange}
              className={styles.formSelect}
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
              value={editedIssue.title}
              onChange={handleEditInputChange}
              className={styles.formInput}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="content">内容</label>
            <textarea
              id="content"
              name="content"
              value={editedIssue.content}
              onChange={handleEditInputChange}
              className={styles.formTextarea}
              rows="5"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="tag">タグ</label>
            <select
              id="tag"
              name="tag"
              value={editedIssue.tag}
              onChange={handleEditInputChange}
              className={styles.formSelect}
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
              value={editedIssue.limit}
              onChange={handleEditInputChange}
              className={styles.formInput}
              required
            />
          </div>

          <div className={styles.formActions}>
            <button
              type="submit"
              className={styles.submitButton}
            >
              更新する
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.createHeader}>
        <h1 className={styles.title}>課題の詳細</h1>
        <div className={styles.detailActions}>
          <button 
            className={styles.statusToggleButton}
            onClick={handleStatusToggle}
          >
            {issue.flg ? '未解決に戻す' : '解決済みにする'}
          </button>
          <button 
            className={styles.editButton}
            onClick={handleEditClick}
          >
            編集
          </button>
          <button 
            className={styles.backButton}
            onClick={handleBackClick}
          >
            一覧に戻る
          </button>
        </div>
      </div>

      <div className={styles.detailCard}>
        <div className={styles.detailHeader}>
          <div className={styles.detailStatus}>
            <span className={`${styles.status} ${issue.flg ? styles.statusResolved : styles.statusUnresolved}`}>
              {issue.flg ? '解決済み' : '未解決'}
            </span>
            <span className={`${styles.priority} ${getPriorityClass(issue.urgency)}`}>
              {issue.urgency}
            </span>
            <div className={styles.detailTag}>
              <span className={styles.tag}>
                {issue.tag}
              </span>
            </div>
          </div>
        </div>

        <h1 className={styles.detailTitle}>{issue.title}</h1>

        <div className={styles.detailContent}>
          <h2 className={styles.detailContentTitle}>内容</h2>
          <p className={styles.detailContentText}>{issue.content}</p>
        </div>

        <div className={styles.detailMeta}>
          <div className={styles.detailMetaItem}>
            <span className={styles.detailMetaLabel}>担当者</span>
            <span className={styles.detailMetaValue}>{issue.username}</span>
          </div>
          <div className={styles.detailMetaItem}>
            <span className={styles.detailMetaLabel}>作成日</span>
            <span className={styles.detailMetaValue}>{issue.create_date}</span>
          </div>
          <div className={styles.detailMetaItem}>
            <span className={styles.detailMetaLabel}>期限</span>
            <span className={styles.detailMetaValue}>{issue.limit}</span>
          </div>
          <div className={styles.detailMetaItem}>
            <span className={styles.detailMetaLabel}>経過日数</span>
            <span className={styles.detailMetaValue}>
              {calculateDaysPassed(issue.create_date)}日
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 