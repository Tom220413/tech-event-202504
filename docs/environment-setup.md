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

## 初回セットアップ手順

### 新しい開発者がプロジェクトをセットアップする場合

1. **リポジトリのクローン**
   ```bash
   git clone <repository-url>
   cd tech-event-202504
   ```

2. **依存関係のインストール**
   ```bash
   npm install
   ```

3. **環境変数ファイルの作成**
   ```bash
   cp .env.example .env.local  # .env.exampleがある場合
   # または手動で .env.local を作成
   ```

4. **環境変数の設定**
   - `.env.local` ファイルを編集
   - Supabaseの設定値を入力

5. **開発サーバーの起動**
   ```bash
   npm run dev
   ```

## トラブルシューティング

### よくあるエラーと解決方法

#### 1. `AuthSessionMissingError: Auth session missing!`
**原因**: 環境変数が設定されていない、または無効な値が設定されている

**解決方法**:
1. `.env.local` ファイルが存在することを確認
2. 環境変数の値が正しいことを確認
3. 開発サーバーを再起動
   ```bash
   npm run dev
   ```
4. ブラウザのキャッシュをクリア

#### 2. `Missing Supabase environment variables`
**原因**: 必要な環境変数が設定されていない

**解決方法**:
1. `.env.local` ファイルに以下が設定されているか確認：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. 値にスペースや改行が含まれていないか確認
3. 引用符は不要（値を直接記述）

#### 3. 認証が機能しない
**原因**: Supabaseプロジェクトの設定問題

**解決方法**:
1. Supabaseダッシュボードで認証が有効になっているか確認
2. Site URLが正しく設定されているか確認
3. データベーススキーマが正しく適用されているか確認

#### 4. データが表示されない
**原因**: Row Level Security (RLS) の設定問題

**解決方法**:
1. `docs/database-schema.sql` を再実行
2. RLSポリシーが正しく設定されているか確認
3. ユーザーがログインしているか確認

### デバッグ方法

1. **ブラウザの開発者ツールを確認**
   - コンソールタブでエラーメッセージを確認
   - ネットワークタブでAPI呼び出しを確認

2. **環境変数の確認**
   ```javascript
   // ブラウザのコンソールで実行
   console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
   console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
   ```

3. **Supabaseダッシュボードでログ確認**
   - Authentication > Users でユーザー登録状況を確認
   - Database > Tables でデータの状況を確認

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