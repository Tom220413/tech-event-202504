'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

// タグの列挙型
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

export default function Home() {
  const router = useRouter();
  const [filter, setFilter] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [issues, setIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [isDetailMode, setIsDetailMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [editedIssue, setEditedIssue] = useState(null);
  const [newIssue, setNewIssue] = useState({
    inputter_name: '山田太郎',
    priority: PRIORITY.MEDIUM,
    title: '',
    content: '',
    tag: TAGS.DEVELOPMENT,
    limit: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    const fetchIssues = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/list');
        console.log(response, 'ああああ')
        if (!response.ok) {
          throw new Error('課題の取得に失敗しました');
        }
        const data = await response.json();
        // APIからのレスポンスデータを適切な形式に変換
        const formattedIssues = data.map(issue => ({
          id: issue.id,
          create_date: issue.registration_date,
          username: issue.Inputter_name,
          urgency: issue.priority,
          title: issue.title,
          content: issue.content,
          tag: issue.tag,
          limit: issue.limit,
          flg: issue.isResolve || false
        }));
        setIssues(formattedIssues);
      } catch (error) {
        console.error('Failed to fetch issues:', error);
        setSubmitError('課題の取得に失敗しました。もう一度お試しください。');
        // エラー時はモックデータを使用
        setIssues(mockIssues);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIssues();
  }, []);

  // 利用可能なタグの一覧を取得
  const availableTags = ['all', ...new Set(issues.map(issue => issue.tag))];

  // タグごとの課題数を計算
  const tagCounts = issues.reduce((acc, issue) => {
    acc[issue.tag] = (acc[issue.tag] || 0) + 1;
    return acc;
  }, {});

  const validateForm = () => {
    const errors = {};
    if (!newIssue.title.trim()) errors.title = 'タイトルは必須です';
    if (!newIssue.content.trim()) errors.content = '内容は必須です';
    if (!newIssue.limit) errors.limit = '期限は必須です';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0];
      
      const issueData = {
        Inputter_name: newIssue.inputter_name,
        priority: newIssue.priority,
        title: newIssue.title,
        content: newIssue.content,
        tag: newIssue.tag,
        limit: newIssue.limit
      };

      try {
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(issueData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || '課題の作成に失敗しました');
        }

        const createdIssue = await response.json();
        // APIからのレスポンスに基づいて新しい課題を作成
        const newIssue = {
          id: createdIssue.id,
          create_date: formattedDate,
          username: issueData.Inputter_name,
          urgency: issueData.priority,
          title: issueData.title,
          content: issueData.content,
          tag: issueData.tag,
          limit: issueData.limit,
          flg: false
        };
        setIssues([newIssue, ...issues]);
      } catch (apiError) {
        console.warn('API request failed, falling back to local state:', apiError);
        // APIが利用できない場合のフォールバック処理
        const localIssue = {
          id: issues.length + 1,
          create_date: formattedDate,
          username: issueData.Inputter_name,
          urgency: issueData.priority,
          title: issueData.title,
          content: issueData.content,
          tag: issueData.tag,
          limit: issueData.limit,
          flg: false
        };
        setIssues([localIssue, ...issues]);
      }

      setIsCreateMode(false);
      setNewIssue({
        inputter_name: '山田太郎',
        priority: PRIORITY.MEDIUM,
        title: '',
        content: '',
        tag: TAGS.DEVELOPMENT,
        limit: '',
      });
      setFormErrors({});
    } catch (error) {
      console.error('Failed to create issue:', error);
      setSubmitError(error.message || '課題の作成に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewIssue(prev => ({
      ...prev,
      [name]: value
    }));
    // リアルタイムバリデーション
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleIssueClick = (issue) => {
    router.push(`/issues/${issue.id}`);
  };

  const handleEditClick = () => {
    setEditedIssue({ ...selectedIssue });
    setIsEditMode(true);
  };

  const handleStatusToggle = async () => {
    try {
      const response = await fetch(`/api/update?id=${selectedIssue.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isResolve: !selectedIssue.flg
        }),
      });

      if (!response.ok) {
        throw new Error('状態の更新に失敗しました');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || '状態の更新に失敗しました');
      }

      // APIからのレスポンスデータを適切な形式に変換
      const updatedIssue = {
        id: result.data.id,
        create_date: result.data.registration_date,
        username: result.data.Inputter_name,
        urgency: result.data.priority,
        title: result.data.title,
        content: result.data.content,
        tag: result.data.tag,
        limit: result.data.limit,
        flg: result.data.isResolve
      };

      // ローカルの状態を更新
      const updatedIssues = issues.map(issue => 
        issue.id === selectedIssue.id ? updatedIssue : issue
      );
      setIssues(updatedIssues);
      setSelectedIssue(updatedIssue);
    } catch (error) {
      console.error('Failed to update issue status:', error);
      setSubmitError('状態の更新に失敗しました。もう一度お試しください。');
    }
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const updatedIssues = issues.map(issue =>
      issue.id === editedIssue.id ? editedIssue : issue
    );
    setIssues(updatedIssues);
    setSelectedIssue(editedIssue);
    setIsEditMode(false);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditedIssue(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredIssues = issues.filter(issue => {
    // 解決状態でのフィルタリング
    const statusMatch = filter === 'all' || 
      (filter === 'resolved' && issue.flg) || 
      (filter === 'unresolved' && !issue.flg);
    
    // タグでのフィルタリング
    const tagMatch = selectedTag === 'all' || issue.tag === selectedTag;

    return statusMatch && tagMatch;
  }).sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.create_date) - new Date(a.create_date);
    } else if (sortBy === 'oldest') {
      return new Date(a.create_date) - new Date(b.create_date);
    } else if (sortBy === 'priority') {
      const priorityOrder = { '高': 3, '中': 2, '低': 1 };
      return priorityOrder[b.urgency] - priorityOrder[a.urgency];
    }
    return 0;
  });

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

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (isDetailMode && selectedIssue) {
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
              {selectedIssue.flg ? '未解決に戻す' : '解決済みにする'}
            </button>
            <button 
              className={styles.editButton}
              onClick={handleEditClick}
            >
              編集
            </button>
            <button 
              className={styles.backButton}
              onClick={() => setIsDetailMode(false)}
            >
              一覧に戻る
            </button>
          </div>
        </div>

        <div className={styles.detailCard}>
          <div className={styles.detailHeader}>
            <div className={styles.detailStatus}>
              <span className={`${styles.priority} ${getPriorityClass(selectedIssue.urgency)}`}>
                {selectedIssue.urgency}
              </span>
              <span className={`${styles.status} ${selectedIssue.flg ? styles.statusResolved : styles.statusUnresolved}`}>
                {selectedIssue.flg ? '解決済み' : '未解決'}
              </span>
            </div>
            <div className={styles.detailTag}>
              <span className={styles.tag}>
                <svg className={styles.tagIcon} viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/>
                </svg>
                {selectedIssue.tag}
              </span>
            </div>
          </div>

          <h2 className={styles.detailTitle}>{selectedIssue.title}</h2>
          
          <div className={styles.detailContent}>
            <h3 className={styles.detailContentTitle}>内容</h3>
            <p className={styles.detailContentText}>{selectedIssue.content}</p>
          </div>

          <div className={styles.detailMeta}>
            <div className={styles.detailMetaItem}>
              <span className={styles.detailMetaLabel}>担当者</span>
              <span className={styles.detailMetaValue}>{selectedIssue.username}</span>
            </div>
            <div className={styles.detailMetaItem}>
              <span className={styles.detailMetaLabel}>登録日</span>
              <span className={styles.detailMetaValue}>{selectedIssue.create_date}</span>
            </div>
            <div className={styles.detailMetaItem}>
              <span className={styles.detailMetaLabel}>期限</span>
              <span className={styles.detailMetaValue}>{selectedIssue.limit}</span>
            </div>
            <div className={styles.detailMetaItem}>
              <span className={styles.detailMetaLabel}>経過日数</span>
              <span className={styles.detailMetaValue}>{calculateDaysPassed(selectedIssue.create_date)}日</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isCreateMode) {
    return (
      <div className={styles.container}>
        <div className={styles.createHeader}>
          <h1 className={styles.title}>新規課題の作成</h1>
          <button 
            className={styles.backButton}
            onClick={() => setIsCreateMode(false)}
          >
            一覧に戻る
          </button>
        </div>

        <form onSubmit={handleCreateIssue} className={styles.createForm}>
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
              value={newIssue.priority}
              onChange={handleInputChange}
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
              value={newIssue.title}
              onChange={handleInputChange}
              className={`${styles.formInput} ${formErrors.title ? styles.error : ''}`}
              placeholder="タイトルを入力してください"
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
              value={newIssue.content}
              onChange={handleInputChange}
              className={`${styles.formTextarea} ${formErrors.content ? styles.error : ''}`}
              placeholder="内容を入力してください"
              rows="5"
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
              value={newIssue.tag}
              onChange={handleInputChange}
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
              value={newIssue.limit}
              onChange={handleInputChange}
              className={`${styles.formInput} ${formErrors.limit ? styles.error : ''}`}
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
              {isSubmitting ? '作成中...' : '作成する'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>開発課題管理</h1>
        <button 
          className={styles.createButton}
          onClick={() => setIsCreateMode(true)}
        >
          新規作成
        </button>
      </div>
      
      <div className={styles.mainContent}>
        <div className={styles.sidebar}>
          <div className={styles.tagList}>
            <h2 className={styles.tagListTitle}>タグ一覧</h2>
            <div className={styles.tagListContent}>
              <div
                className={`${styles.tagItem} ${selectedTag === 'all' ? styles.active : ''}`}
                onClick={() => setSelectedTag('all')}
              >
                <span>すべて</span>
                <span className={styles.tagCount}>{issues.length}</span>
              </div>
              {Object.values(TAGS).map((tag) => (
                <div
                  key={tag}
                  className={`${styles.tagItem} ${selectedTag === tag ? styles.active : ''}`}
                  onClick={() => setSelectedTag(tag)}
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

        <div className={styles.content}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${filter === 'all' ? styles.active : ''}`}
              onClick={() => setFilter('all')}
            >
              すべて
            </button>
            <button
              className={`${styles.tab} ${filter === 'unresolved' ? styles.active : ''}`}
              onClick={() => setFilter('unresolved')}
            >
              未解決
            </button>
            <button
              className={`${styles.tab} ${filter === 'resolved' ? styles.active : ''}`}
              onClick={() => setFilter('resolved')}
            >
              解決済み
            </button>
          </div>

          <div className={styles.sortFilters}>
            <span className={styles.sortLabel}>並び替え:</span>
            <button
              className={`${styles.sortButton} ${sortBy === 'newest' ? styles.active : ''}`}
              onClick={() => setSortBy('newest')}
            >
              新着順
            </button>
            <button
              className={`${styles.sortButton} ${sortBy === 'oldest' ? styles.active : ''}`}
              onClick={() => setSortBy('oldest')}
            >
              古い順
            </button>
            <button
              className={`${styles.sortButton} ${sortBy === 'priority' ? styles.active : ''}`}
              onClick={() => setSortBy('priority')}
            >
              優先度順
            </button>
          </div>

          {isLoading ? (
            <div className={styles.issuesList}>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className={styles.skeletonCard}>
                  <div className={styles.skeletonHeader}>
                    <div className={`${styles.skeleton} ${styles.skeletonStatus}`} />
                    <div className={`${styles.skeleton} ${styles.skeletonPriority}`} />
                  </div>
                  <div className={`${styles.skeleton} ${styles.skeletonTitle}`} />
                  <div className={styles.skeletonMeta}>
                    <div className={`${styles.skeleton} ${styles.skeletonMetaItem}`} />
                    <div className={`${styles.skeleton} ${styles.skeletonMetaItem}`} />
                  </div>
                  <div className={styles.skeletonMeta}>
                    <div className={`${styles.skeleton} ${styles.skeletonTag}`} />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredIssues.length === 0 ? (
            <div className={styles.emptyState}>
              <h2 className={styles.emptyStateTitle}>課題が見つかりません</h2>
              <p className={styles.emptyStateText}>
                {filter !== 'all' || selectedTag !== null
                  ? '選択されたフィルターに一致する課題はありません。'
                  : 'まだ課題が登録されていません。'}
              </p>
              <button
                className={styles.createButton}
                onClick={() => setIsCreateMode(true)}
              >
                新しい課題を作成
              </button>
            </div>
          ) : (
            <div className={styles.issuesList}>
              {filteredIssues.map((issue) => (
                <div
                  key={issue.id}
                  className={`${styles.issueCard} ${issue.flg ? styles.resolved : styles.unresolved}`}
                  onClick={() => handleIssueClick(issue)}
                >
                  <div className={styles.issueHeader}>
                    <div className={styles.issueStatus}>
                      <span className={`${styles.status} ${issue.flg ? styles.statusResolved : styles.statusUnresolved}`}>
                        {issue.flg ? '解決済み' : '未解決'}
                      </span>
                    </div>
                    <div className={styles.issuePriority}>
                      <span className={`${styles.priority} ${getPriorityClass(issue.urgency)}`}>
                        {issue.urgency}
                      </span>
                    </div>
                  </div>
                  <h3 className={styles.issueTitle}>{issue.title}</h3>
                  <div className={styles.issueFooter}>
                    <div className={styles.issueMeta}>
                      <span>担当: {issue.username}</span>
                      <span>期限: {issue.limit}</span>
                      <span>経過日数: {calculateDaysPassed(issue.create_date)}日</span>
                    </div>
                    <div className={styles.issueDates}>
                      <span>登録日: {issue.create_date}</span>
                    </div>
                  </div>
                  <div className={styles.tags}>
                    <span className={styles.tag}>
                      <svg className={styles.tagIcon} viewBox="0 0 24 24" width="16" height="16">
                        <path fill="currentColor" d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/>
                      </svg>
                      {issue.tag}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <button 
        className={styles.topButton}
        onClick={scrollToTop}
        aria-label="ページトップへ戻る"
      >
        TOPへ
      </button>
    </div>
  );
}
