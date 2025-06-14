This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.]

ディレクトリ構成

app/
├── components/            # コンポーネント
│   ├── issues/           # 課題関連コンポーネント
│   │   ├── IssueCard/    # 課題カード
│   │   ├── IssueDetail/  # 課題詳細
│   │   ├── IssueForm/    # 課題フォーム
│   │   └── IssueList/    # 課題一覧
│   ├── layout/           # レイアウトコンポーネント
│   │   ├── Header/       # ヘッダー
│   │   ├── Sidebar/      # サイドバー
│   │   └── styles.module.css  # レイアウトスタイル
│   └── ui/               # 再利用可能なUIコンポーネント
│       └── Modal/        # モーダル
├── issues/               # 課題関連ページ
│   └── [id]/            # 動的ルーティング
│       └── page.js      # 課題詳細ページ
├── lib/                 # ユーティリティ
│   ├── constants.js     # 定数
│   └── data.js         # データ関連
├── favicon.ico         # ファビコン
├── globals.css         # グローバルスタイル
├── layout.js           # ルートレイアウト
└── page.js             # メインページ
