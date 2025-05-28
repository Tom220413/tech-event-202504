# Supabase移行ガイド

## 移行の概要

現在のメモリベースのデータ管理からSupabaseへの移行手順を説明します。

## 移行前の準備

### 1. 依存関係のインストール
```bash
npm install @supabase/supabase-js
```

### 2. 環境変数の設定
`.env.local` ファイルを作成：
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. データベーススキーマの適用
`docs/database-schema.sql` をSupabaseのSQL Editorで実行

## 移行手順

### ステップ1: 認証システムの導入

1. **AuthProviderの追加**
   - `app/layout.js` に `AuthProvider` を追加
   - 全ページで認証状態を管理

2. **認証ページの作成**
   - `/auth` ページでログイン・サインアップ
   - 未認証ユーザーのリダイレクト処理

### ステップ2: APIエンドポイントの更新

#### 現在のメモリベースAPI → Supabase API

| エンドポイント | 変更内容 |
|---------------|----------|
| `/api/register` | ユーザー認証 + user_id の追加 |
| `/api/issues` | 認証ヘッダーの確認 + ユーザー固有データ |
| `/api/status` | ユーザー認証 + 権限チェック |
| `/api/update` | ユーザー認証 + 権限チェック |

#### 主な変更点

1. **認証ヘッダーの確認**
```javascript
const authHeader = request.headers.get('authorization')
const { data: { user } } = await supabase.auth.getUser(
  authHeader.replace('Bearer ', '')
)
```

2. **ユーザー固有データの取得**
```javascript
const issues = await db.getIssues(user.id)
```

3. **Row Level Security (RLS)**
   - データベースレベルでユーザー分離
   - 自動的に `user_id` でフィルタリング

### ステップ3: フロントエンドの更新

#### 認証状態の管理
```javascript
import { useAuth } from '../lib/auth-context'

const { user, isAuthenticated, signOut } = useAuth()
```

#### APIリクエストの認証
```javascript
const { data: { session } } = await supabase.auth.getSession()
const token = session?.access_token

fetch('/api/issues', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

### ステップ4: データ移行

#### 既存データのエクスポート
```javascript
// lib/data.js から既存データを取得
import { issues } from './lib/data.js'
console.log(JSON.stringify(issues, null, 2))
```

#### Supabaseへのインポート
```sql
-- 手動でデータを挿入（例）
INSERT INTO public.issues (
  user_id, title, content, priority, tag, 
  limit_date, is_resolved, inputter_name
) VALUES (
  'user-uuid', 'タイトル', '内容', '高', '開発',
  '2024-04-01', false, '担当者名'
);
```

## ユーザーデータの管理方針

### 1. データの分離
- **ユーザーごとに完全分離**: 各ユーザーは自分のデータのみアクセス可能
- **RLSによる自動制御**: データベースレベルでセキュリティ確保

### 2. プロファイル管理
```javascript
// ユーザープロファイルの取得・更新
const profile = await db.getProfile(user.id)
await db.updateProfile(user.id, { display_name: '新しい名前' })
```

### 3. 課題データの関連付け
```javascript
// 課題作成時に自動的にuser_idを設定
const newIssue = await db.createIssue({
  title: 'タイトル',
  content: '内容',
  // user_id は自動的に設定される
}, user.id)
```

## セキュリティ考慮事項

### 1. Row Level Security (RLS)
- すべてのテーブルでRLS有効
- `auth.uid()` による自動フィルタリング
- SQLインジェクション対策

### 2. 認証トークンの管理
- JWTトークンの自動更新
- セッション管理はSupabaseが処理
- セキュアなトークン保存

### 3. API認証
- すべてのAPIエンドポイントで認証確認
- 無効なトークンの適切な処理
- エラーハンドリングの強化

## 移行後の利点

### 1. スケーラビリティ
- メモリ制限なし
- 複数インスタンス対応
- 自動バックアップ

### 2. セキュリティ
- ユーザーデータの完全分離
- 暗号化された通信
- 監査ログ

### 3. 機能拡張
- リアルタイム更新
- ファイルストレージ
- 高度なクエリ機能

## トラブルシューティング

### よくある問題

1. **認証エラー**
   - 環境変数の確認
   - トークンの有効期限
   - CORS設定

2. **データアクセスエラー**
   - RLSポリシーの確認
   - user_idの設定
   - 権限の確認

3. **パフォーマンス**
   - インデックスの最適化
   - クエリの効率化
   - キャッシュ戦略 