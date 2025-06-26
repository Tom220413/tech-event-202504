# API仕様書

## 課題登録API

### エンドポイント
- **URL**: `/api/register`
- **Method**: `POST`
- **Content-Type**: `application/json`

### リクエスト

#### パラメータ
| パラメータ | 型 | 必須 | 制限 | 説明 |
|-----------|---|------|------|------|
| inputter_name | string | ✓ | 32文字以内 | 担当者名 |
| priority | string | ✓ | - | 優先度（'高', '中', '低'） |
| title | string | ✓ | 30文字以内 | タイトル |
| content | string | ✓ | 225文字以内 | 内容 |
| tag | string | ✓ | - | タグ（'開発', 'デザイン', 'ドキュメント', 'インフラ', 'その他'） |
| limit | string | ✓ | YYYY-MM-DD | 期限日 |

#### リクエスト例
```json
{
  "inputter_name": "田中太郎",
  "priority": "高",
  "title": "新機能の実装",
  "content": "ユーザー管理機能の追加が必要です。",
  "tag": "開発",
  "limit": "2024-04-01"
}
```

### レスポンス

#### 成功時（201 Created）
```json
{
  "id": 16,
  "success": true,
  "issue": {
    "id": 16,
    "create_date": "2024-03-21",
    "username": "田中太郎",
    "urgency": "高",
    "title": "新機能の実装",
    "content": "ユーザー管理機能の追加が必要です。",
    "tag": "開発",
    "limit": "2024-04-01",
    "flg": false
  }
}
```

#### エラー時（400 Bad Request）
```json
{
  "success": false,
  "status": 400,
  "message": "エラーメッセージ"
}
```

### テスト用cURLコマンド

#### 正常ケース
```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "inputter_name": "田中太郎",
    "priority": "高",
    "title": "新機能の実装",
    "content": "ユーザー管理機能の追加が必要です。",
    "tag": "開発",
    "limit": "2024-04-01"
  }'
```

## 解決済みフラグ更新API

### エンドポイント
- **URL**: `/api/status`
- **Method**: `PUT`
- **Content-Type**: `application/json`

### リクエスト

#### パラメータ
| パラメータ | 型 | 必須 | 説明 |
|-----------|---|------|------|
| id | number | ✓ | 課題ID（正の整数） |
| flg | number | ✓ | 解決フラグ（0: 未解決, 1: 解決済み） |

#### リクエスト例
```json
{
  "id": 1,
  "flg": 1
}
```

### レスポンス

#### 成功時（200 OK）
```json
{
  "id": 1,
  "success": true
}
```

#### エラー時（400 Bad Request）
```json
{
  "id": 1,
  "success": false,
  "status": 400,
  "message": "エラーメッセージ"
}
```

#### サーバーエラー時（500 Internal Server Error）
```json
{
  "id": 1,
  "success": false,
  "status": 500,
  "message": "サーバー内部エラーが発生しました"
}
```

### バリデーション

#### IDのバリデーション
- 必須項目
- 数値型
- 正の整数
- 存在する課題ID

#### フラグのバリデーション
- 必須項目
- 数値型
- 0 または 1 のみ

### エラーケース

| エラー内容 | ステータス | メッセージ |
|-----------|----------|----------|
| ID未指定 | 400 | IDは必須です |
| フラグ未指定 | 400 | フラグは必須です |
| 無効なID | 400 | IDは正の整数である必要があります |
| 無効なフラグ | 400 | フラグは0または1である必要があります |
| 存在しないID | 400 | 指定されたIDの課題が見つかりません |
| JSON形式エラー | 400 | 無効なJSON形式です |
| サーバーエラー | 500 | サーバー内部エラーが発生しました |

## 課題取得API

### エンドポイント
- **URL**: `/api/issues`
- **Method**: `GET`

### クエリパラメータ
| パラメータ | 型 | 必須 | 説明 |
|-----------|---|------|------|
| id | number | - | 課題ID（指定時は単一課題を取得） |

### レスポンス

#### 全課題取得時（200 OK）
```json
{
  "success": true,
  "issues": [...],
  "count": 15
}
```

#### 単一課題取得時（200 OK）
```json
{
  "success": true,
  "issue": {
    "id": 1,
    "create_date": "2024-03-20",
    "username": "田中太郎",
    "urgency": "高",
    "title": "ログイン機能の不具合",
    "content": "ユーザーがログインできない問題が発生しています。",
    "tag": "開発",
    "limit": "2024-03-25",
    "flg": false
  }
}
```

### テスト用cURLコマンド

#### 全課題取得
```bash
curl -X GET http://localhost:3000/api/issues
```

#### 単一課題取得
```bash
curl -X GET "http://localhost:3000/api/issues?id=1"
```

### 正常ケース
```bash
curl -X PUT http://localhost:3000/api/status \
  -H "Content-Type: application/json" \
  -d '{"id": 1, "flg": 1}'
```

### エラーケース例

#### 無効なID
```bash
curl -X PUT http://localhost:3000/api/status \
  -H "Content-Type: application/json" \
  -d '{"id": -1, "flg": 1}'
```

#### 無効なフラグ
```bash
curl -X PUT http://localhost:3000/api/status \
  -H "Content-Type: application/json" \
  -d '{"id": 1, "flg": 2}'
```

#### ID未指定
```bash
curl -X PUT http://localhost:3000/api/status \
  -H "Content-Type: application/json" \
  -d '{"flg": 1}'
```

## データ構造

### 課題データ（Issue）
```javascript
{
  id: number,           // 課題ID
  create_date: string,  // 作成日（YYYY-MM-DD）
  username: string,     // 担当者名
  urgency: string,      // 優先度（'高', '中', '低'）
  title: string,        // タイトル
  content: string,      // 内容
  tag: string,         // タグ（'開発', 'デザイン', 'ドキュメント', 'インフラ', 'その他'）
  limit: string,       // 期限（YYYY-MM-DD）
  flg: boolean         // 解決フラグ（true: 解決済み, false: 未解決）
}
```

### ENUM定義

#### タグ（TAGS）
```javascript
{
  DEVELOPMENT: '開発',
  DESIGN: 'デザイン',
  DOCUMENTATION: 'ドキュメント',
  INFRASTRUCTURE: 'インフラ',
  OTHER: 'その他'
}
```

#### 優先度（PRIORITY）
```javascript
{
  HIGH: '高',
  MEDIUM: '中',
  LOW: '低'
}
```

## 実装詳細

### データストレージ
- メモリ上にデータを保持
- `lib/data.js`でデータ管理
- サーバー再起動時にデータはリセット

### ログ出力
- コンソールに更新ログを出力
- 更新された課題の詳細情報も出力

### メソッド制限
- 各エンドポイントは指定されたHTTPメソッドのみ対応
- 非対応メソッドは405エラーを返す 