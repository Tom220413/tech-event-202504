// 優先度の定義
export const PRIORITY = {
  HIGH: '高',
  MEDIUM: '中',
  LOW: '低'
};

// タグの定義
export const TAGS = {
  DEVELOPMENT: '開発',
  DESIGN: 'デザイン',
  DOCUMENTATION: 'ドキュメント',
  INFRASTRUCTURE: 'インフラ',
  OTHER: 'その他'
};

// モックデータ（メモリ上のデータストア）
export const mockIssues = [
  {
    id: 1,
    create_date: '2024-03-20',
    username: '田中太郎',
    urgency: PRIORITY.HIGH,
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
    urgency: PRIORITY.MEDIUM,
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
    urgency: PRIORITY.HIGH,
    title: 'セキュリティ脆弱性の修正',
    content: '認証処理に重大なセキュリティホールが発見されました。早急な対応が必要です。',
    tag: TAGS.DEVELOPMENT,
    limit: '2024-03-21',
    flg: false,
  }
]; 