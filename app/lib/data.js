// タグの列挙型
export const TAGS = {
  DEVELOPMENT: '開発',
  DESIGN: 'デザイン',
  DOCUMENTATION: 'ドキュメント',
  INFRASTRUCTURE: 'インフラ',
  OTHER: 'その他'
};

// 優先度の列挙型
export const PRIORITY = {
  HIGH: '高',
  MEDIUM: '中',
  LOW: '低'
};

// グローバルなデータストア（初期データ含む）
export const issues = [
  {
    id: 1,
    registration_date: new Date('2024-03-20'),
    inputter_name: '田中太郎',
    priority: PRIORITY.HIGH,
    title: 'ログイン機能の不具合',
    content: 'ユーザーがログインできない問題が発生しています。',
    tag: TAGS.DEVELOPMENT,
    limit: new Date('2024-03-25'),
    flg: false
  },
  {
    id: 2,
    registration_date: new Date('2024-03-19'),
    inputter_name: '佐藤花子',
    priority: PRIORITY.MEDIUM,
    title: 'ドキュメントの更新',
    content: 'API仕様書の更新が必要です。',
    tag: TAGS.DOCUMENTATION,
    limit: new Date('2024-03-28'),
    flg: true
  }
];