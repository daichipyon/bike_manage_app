# マンション駐輪場管理システム

マンション共同駐輪場の管理を効率化するためのウェブアプリケーションです。

## 機能

- 駐輪枠の管理（追加、編集、表示）
- 居住者情報の管理（追加、編集、表示）
- 駐輪枠と居住者の紐付け管理
- ステッカー発行管理
- 不正駐輪の記録と管理
- 入金管理

## 技術スタック

- **フロントエンド**: Next.js (App Router), React, TypeScript, TailwindCSS
- **バックエンド**: Supabase (PostgreSQL, Auth)
- **データ取得**: タンスタッククエリ
- **フォーム処理**: React Hook Form, Zod

## セットアップ

### 必要条件

- Node.js (v16.14.0以上)
- npm または yarn
- Supabaseアカウント

### インストール

1. リポジトリをクローン

```
git clone https://github.com/your-username/bike_manage_app.git
cd bike_manage_app
```

2. 依存関係をインストール

```
npm install
# または
yarn install
```

3. 環境変数の設定

`.env.local`ファイルをプロジェクトのルートに作成し、以下の変数を設定：

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. 開発サーバーの起動

```
npm run dev
# または
yarn dev
```

5. ブラウザで `http://localhost:3000` にアクセス

### Supabaseの設定

1. Supabaseでプロジェクトを作成
2. `supabase/migrations` フォルダ内のSQLファイルを実行して、必要なテーブルとRLSポリシーを設定
3. 必要に応じて `supabase/seed.sql` を実行して初期データを投入

## ディレクトリ構造

```
├── public/                  # 静的ファイル
│   ├── assets/              # アセットファイル（画像、ロゴなど）
│   └── favicon/             # ファビコン
│
├── src/                     # ソースコード
│   ├── app/                 # Next.jsアプリケーションルーター
│   │   ├── globals.css      # グローバルスタイル
│   │   ├── layout.tsx       # ルートレイアウト
│   │   ├── page.tsx         # ホームページ
│   │   ├── (authenticated)/ # 認証が必要なルート
│   │   │   ├── actions.ts   # 認証済みルート用サーバーアクション
│   │   │   ├── layout.tsx   # 認証済みルート用レイアウト
│   │   │   ├── page.tsx     # 認証済みルート用ページ
│   │   │   ├── assign/      # 駐輪枠割り当てページ
│   │   │   ├── bicycle-slots/ # 駐輪枠管理ページ
│   │   │   ├── dashboard/   # ダッシュボードページ
│   │   │   ├── payments/    # 入金管理ページ
│   │   │   ├── residents/   # 居住者管理ページ
│   │   │   └── violations/  # 不正利用記録ページ
│   │   ├── (public)/        # 認証不要の公開ルート
│   │   │   └── login/       # ログインページ
│   │   └── auth/            # 認証関連ルート
│   │       └── callback/    # 認証コールバック処理
│   │
│   ├── components/          # 再利用可能なUIコンポーネント
│   │   ├── layout/          # レイアウト関連コンポーネント
│   │   ├── payments/        # 入金関連コンポーネント
│   │   └── slots/           # 駐輪枠関連コンポーネント
│   │
│   ├── hooks/               # カスタムReactフック
│   │
│   ├── lib/                 # ユーティリティ関数とライブラリ
│   │   ├── actions/         # サーバーアクション
│   │   ├── validators/      # Zodスキーマによるバリデーション
│   │   └── supabase-server.ts # Supabase関連の処理
│   │
│   ├── middleware.ts        # Next.jsミドルウェア
│   │
│   ├── types/               # TypeScript型定義
│   │   └── supabase.ts      # Supabase関連の型定義
│   │
│   └── utils/               # ユーティリティ関数
│       └── supabase/        # Supabase関連ユーティリティ
│
├── supabase/                # Supabaseマイグレーションと設定
│   ├── migrations/          # データベースマイグレーションファイル
│   ├── config.toml          # Supabase設定ファイル
│   ├── seed.sql             # 初期データ投入用SQL
│   └── setup.sh             # セットアップスクリプト
│
├── developing-guide.md      # 開発ガイド
├── next-env.d.ts            # Next.js環境型定義
├── next.config.js           # Next.js設定
├── package.json             # プロジェクト依存関係とスクリプト
├── postcss.config.js        # PostCSS設定
├── requirement.md           # 要件定義
├── system-design.md         # システム設計
├── tailwind.config.ts       # Tailwind CSS設定
└── tsconfig.json            # TypeScript設定
```

## ライセンス

このプロジェクトは[MITライセンス](LICENSE)の下で提供されています。