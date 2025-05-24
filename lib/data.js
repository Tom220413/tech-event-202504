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

// メモリ上でのデータストレージ（実際のアプリでは Redis や Database を使用）
let issues = []
// Enum定義をエクスポート
export { TAGS, PRIORITY }; 