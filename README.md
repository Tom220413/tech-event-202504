# 開発課題管理システム

Supabaseを使用したNext.jsベースの課題管理アプリケーションです。

## 機能

- ユーザー認証（サインアップ・ログイン）
- 課題の作成・編集・削除
- 課題のステータス管理（未解決・解決済み）
- タグによる分類
- 優先度設定
- ユーザーごとのデータ分離（Row Level Security）

## 技術スタック

- **フロントエンド**: Next.js 14, React
- **バックエンド**: Next.js API Routes
- **データベース**: Supabase (PostgreSQL)
- **認証**: Supabase Auth
- **スタイリング**: CSS Modules

## セットアップ手順

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd tech-event-202504
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

プロジェクトルートに `.env.local` ファイルを作成し、以下の内容を設定：

```bash
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Supabaseの設定値取得方法**:
1. [Supabase](https://supabase.com)でプロジェクトを作成
2. Settings > API から以下を取得：
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. データベーススキーマの適用

1. Supabaseダッシュボードの SQL Editor を開く
2. `docs/database-schema.sql` の内容をコピー&ペースト
3. 実行してテーブルとポリシーを作成

### 5. 開発サーバーの起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) でアプリケーションにアクセスできます。

## トラブルシューティング

### `AuthSessionMissingError: Auth session missing!`

このエラーが発生した場合：

1. `.env.local` ファイルが存在し、正しい値が設定されているか確認
2. 開発サーバーを再起動: `npm run dev`
3. ブラウザのキャッシュをクリア

詳細なトラブルシューティングガイドは `docs/environment-setup.md` を参照してください。

## ドキュメント

- [環境設定ガイド](docs/environment-setup.md)
- [データベーススキーマ](docs/database-schema.sql)
- [移行ガイド](docs/migration-guide.md)

## 開発

### プロジェクト構造

```
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── auth/              # 認証ページ
│   └── page.js            # メインページ
├── lib/                   # ユーティリティ
│   ├── supabase.js        # Supabaseクライアント
│   └── auth-context.js    # 認証コンテキスト
├── docs/                  # ドキュメント
└── README.md
```

### API エンドポイント

- `POST /api/register` - 課題作成
- `GET /api/issues` - 課題取得
- `PUT /api/update` - 課題更新
- `PUT /api/status` - ステータス更新
- `GET /api/list` - 課題一覧

## Next.js について

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

### Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

### Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
