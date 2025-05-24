'use client';

import { useState } from 'react';
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

// モックデータ
const mockIssues = [
  {
    id: 1,
    create_date: '2024-03-20',
    username: '田中太郎',
    urgency: '高',
    title: 'ログイン機能の不具合',
    content: 'ユーザーがログインできない問題が発生しています。エラーメッセージは表示されません。',
    tag: TAGS.DEVELOPMENT,
    limit: '2024-03-25',
    flg: false,
  },
  {
    id: 2,
    create_date: '2024-03-19',
    username: '佐藤花子',
    urgency: '中',
    title: 'ドキュメントの更新',
    content: 'API仕様書の更新が必要です。新機能の追加に伴う変更点を反映させてください。',
    tag: TAGS.DOCUMENTATION,
    limit: '2024-03-28',
    flg: true,
  },
  {
    id: 3,
    create_date: '2024-03-18',
    username: '鈴木一郎',
    urgency: '高',
    title: 'セキュリティ脆弱性の修正',
    content: '認証処理に重大なセキュリティホールが発見されました。早急な対応が必要です。',
    tag: TAGS.DEVELOPMENT,
    limit: '2024-03-21',
    flg: false,
  },
  {
    id: 4,
    create_date: '2024-03-17',
    username: '高橋美咲',
    urgency: '低',
    title: 'UIデザインの改善',
    content: 'ユーザーからのフィードバックに基づき、ダッシュボードのレイアウトを改善する必要があります。',
    tag: TAGS.DESIGN,
    limit: '2024-03-30',
    flg: false,
  },
  {
    id: 5,
    create_date: '2024-03-16',
    username: '伊藤健太',
    urgency: '中',
    title: 'パフォーマンス最適化',
    content: 'データベースクエリの最適化が必要です。現在の応答時間が許容範囲を超えています。',
    tag: TAGS.DEVELOPMENT,
    limit: '2024-03-26',
    flg: true,
  },
  {
    id: 6,
    create_date: '2024-03-15',
    username: '渡辺真理',
    urgency: '低',
    title: 'ユーザーマニュアルの作成',
    content: '新機能の追加に伴い、ユーザーマニュアルの更新が必要です。',
    tag: TAGS.DOCUMENTATION,
    limit: '2024-03-29',
    flg: false,
  },
  {
    id: 7,
    create_date: '2024-03-14',
    username: '山田太郎',
    urgency: '高',
    title: 'サーバー障害の対応',
    content: '本番環境でサーバーの応答が不安定になっています。原因調査と復旧が必要です。',
    tag: TAGS.INFRASTRUCTURE,
    limit: '2024-03-20',
    flg: true,
  },
  {
    id: 8,
    create_date: '2024-03-13',
    username: '佐々木花子',
    urgency: '中',
    title: 'テスト環境の整備',
    content: 'CIパイプラインの改善と自動テストの追加が必要です。',
    tag: TAGS.DEVELOPMENT,
    limit: '2024-03-27',
    flg: false,
  },
  {
    id: 9,
    create_date: '2024-03-12',
    username: '中村健一',
    urgency: '高',
    title: 'バックアップシステムの構築',
    content: '現在のバックアップシステムが不十分です。新しいバックアップシステムの構築が必要です。',
    tag: TAGS.INFRASTRUCTURE,
    limit: '2024-03-22',
    flg: false,
  },
  {
    id: 10,
    create_date: '2024-03-11',
    username: '小林優子',
    urgency: '中',
    title: 'モバイルアプリのUI改善',
    content: 'iOSとAndroidの両方でUIの一貫性を保つための改善が必要です。',
    tag: TAGS.DESIGN,
    limit: '2024-03-28',
    flg: true,
  },
  {
    id: 11,
    create_date: '2024-03-10',
    username: '加藤大輔',
    urgency: '低',
    title: '開発環境の整備',
    content: '新しい開発者のための環境構築手順書の作成が必要です。',
    tag: TAGS.DOCUMENTATION,
    limit: '2024-03-31',
    flg: false,
  },
  {
    id: 12,
    create_date: '2024-03-09',
    username: '吉田和子',
    urgency: '高',
    title: 'データ移行作業',
    content: '旧システムから新システムへのデータ移行作業の実施が必要です。',
    tag: TAGS.DEVELOPMENT,
    limit: '2024-03-23',
    flg: false,
  },
  {
    id: 13,
    create_date: '2024-03-08',
    username: '山本隆',
    urgency: '中',
    title: '監視システムの改善',
    content: '現在の監視システムでは検知できない問題があるため、改善が必要です。',
    tag: TAGS.INFRASTRUCTURE,
    limit: '2024-03-29',
    flg: true,
  },
  {
    id: 14,
    create_date: '2024-03-07',
    username: '田中美咲',
    urgency: '低',
    title: 'デザインガイドラインの更新',
    content: '新しいブランドカラーの適用に伴うデザインガイドラインの更新が必要です。',
    tag: TAGS.DESIGN,
    limit: '2024-03-30',
    flg: false,
  },
  {
    id: 15,
    create_date: '2024-03-06',
    username: '佐藤健太',
    urgency: '高',
    title: 'セキュリティ監査の実施',
    content: '四半期ごとのセキュリティ監査を実施し、報告書の作成が必要です。',
    tag: TAGS.OTHER,
    limit: '2024-03-24',
    flg: false,
  }
];

export default function Home() {
  const [filter, setFilter] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [issues, setIssues] = useState(mockIssues);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [newIssue, setNewIssue] = useState({
    inputter_name: '',
    priority: PRIORITY.MEDIUM,
    title: '',
    content: '',
    tag: TAGS.DEVELOPMENT,
    limit: '',
  });

  // 利用可能なタグの一覧を取得
  const availableTags = ['all', ...new Set(issues.map(issue => issue.tag))];

  // タグごとの課題数を計算
  const tagCounts = issues.reduce((acc, issue) => {
    acc[issue.tag] = (acc[issue.tag] || 0) + 1;
    return acc;
  }, {});

  const handleCreateIssue = (e) => {
    e.preventDefault();
    const issue = {
      id: issues.length + 1,
      create_date: new Date().toISOString().split('T')[0],
      ...newIssue,
      flg: false,
    };
    setIssues([issue, ...issues]);
    setIsCreateMode(false);
    setNewIssue({
      inputter_name: '',
      priority: PRIORITY.MEDIUM,
      title: '',
      content: '',
      tag: TAGS.DEVELOPMENT,
      limit: '',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewIssue(prev => ({
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
    if (sortBy === 'createdAt') {
      return new Date(b.create_date) - new Date(a.create_date);
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

  if (isCreateMode) {
    return (
      <div className={styles.container}>
        <div className={styles.createHeader}>
          <h1 className={styles.title}>課題の新規作成</h1>
          <button 
            className={styles.backButton}
            onClick={() => setIsCreateMode(false)}
          >
            一覧に戻る
          </button>
        </div>

        <form onSubmit={handleCreateIssue} className={styles.createForm}>
          <div className={styles.formGroup}>
            <label htmlFor="title">タイトル</label>
            <input
              type="text"
              id="title"
              name="title"
              value={newIssue.title}
              onChange={handleInputChange}
              required
              maxLength={30}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="content">内容</label>
            <textarea
              id="content"
              name="content"
              value={newIssue.content}
              onChange={handleInputChange}
              required
              maxLength={225}
              className={styles.textarea}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="inputter_name">担当者</label>
              <input
                type="text"
                id="inputter_name"
                name="inputter_name"
                value={newIssue.inputter_name}
                onChange={handleInputChange}
                required
                maxLength={32}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="priority">優先度</label>
              <select
                id="priority"
                name="priority"
                value={newIssue.priority}
                onChange={handleInputChange}
                className={styles.select}
              >
                {Object.values(PRIORITY).map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="tag">タグ</label>
              <select
                id="tag"
                name="tag"
                value={newIssue.tag}
                onChange={handleInputChange}
                className={styles.select}
              >
                {Object.values(TAGS).map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
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
                required
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={styles.submitButton}>
              登録する
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
              {availableTags
                .filter(tag => tag !== 'all')
                .sort((a, b) => tagCounts[b] - tagCounts[a])
                .map(tag => (
                  <div
                    key={tag}
                    className={`${styles.tagItem} ${selectedTag === tag ? styles.active : ''}`}
                    onClick={() => setSelectedTag(tag)}
                  >
                    <span>{tag}</span>
                    <span className={styles.tagCount}>{tagCounts[tag]}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.sortFilters}>
            <span className={styles.sortLabel}>並び替え:</span>
            <button
              className={`${styles.sortButton} ${sortBy === 'createdAt' ? styles.active : ''}`}
              onClick={() => setSortBy('createdAt')}
            >
              登録順
            </button>
            <button
              className={`${styles.sortButton} ${sortBy === 'priority' ? styles.active : ''}`}
              onClick={() => setSortBy('priority')}
            >
              優先順位順
            </button>
          </div>

          <div className={styles.issuesList}>
            {filteredIssues.map(issue => (
              <div key={issue.id} className={`${styles.issueCard} ${issue.flg ? styles.resolved : styles.unresolved}`}>
                <div className={styles.issueHeader}>
                  <span className={`${styles.priority} ${getPriorityClass(issue.urgency)}`}>{issue.urgency}</span>
                  <span className={`${styles.status} ${issue.flg ? styles.statusResolved : styles.statusUnresolved}`}>
                    {issue.flg ? '解決済み' : '未解決'}
                  </span>
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
        </div>
      </div>
    </div>
  );
}
