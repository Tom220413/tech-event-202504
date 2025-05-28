# 環境変数設定ガイド

## Supabaseプロジェクトの設定

### 1. Supabaseプロジェクトの作成
1. [Supabase](https://supabase.com)にアクセス
2. 新しいプロジェクトを作成
3. データベースパスワードを設定

### 2. 環境変数の設定
プロジェクトルートに `.env.local` ファイルを作成し、以下の内容を設定：

```bash
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# 本番環境では以下も設定
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Supabaseの設定値取得方法
1. Supabaseダッシュボードにログイン
2. プロジェクトを選択
3. Settings > API から以下を取得：
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role → `SUPABASE_SERVICE_ROLE_KEY`（管理者権限が必要な場合）

### 4. データベーススキーマの適用
1. Supabaseダッシュボードの SQL Editor を開く
2. `docs/database-schema.sql` の内容をコピー&ペースト
3. 実行してテーブルとポリシーを作成

### 5. 認証設定
1. Authentication > Settings で以下を設定：
   - Enable email confirmations: 必要に応じて
   - Enable phone confirmations: 必要に応じて
   - Site URL: `http://localhost:3000` (開発時)

## セキュリティ考慮事項

### Row Level Security (RLS)
- 各ユーザーは自分のデータのみアクセス可能
- `auth.uid()` を使用してユーザー識別
- すべてのテーブルでRLSが有効

### 環境変数の管理
- `.env.local` は `.gitignore` に含める
- 本番環境では適切な環境変数管理サービスを使用
- `NEXT_PUBLIC_` プレフィックスはクライアントサイドで利用可能

## 開発時の注意点

### データ移行
現在のメモリベースデータからSupabaseへの移行：
1. 既存データのエクスポート
2. Supabaseテーブルへのインポート
3. APIエンドポイントの更新

### 認証状態の管理
- `useEffect` でログイン状態を監視
- 未認証時はログインページにリダイレクト
- トークンの自動更新はSupabaseが処理 