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
src/
  app/                 # Next.jsアプリケーションルーター
    (authenticated)/   # 認証が必要なルート
    login/             # ログインページ
    globals.css        # グローバルスタイル
  components/          # 再利用可能なUIコンポーネント
  hooks/               # カスタムReactフック
  lib/                 # ユーティリティ関数
    actions/           # サーバーアクション
    validators/        # Zodスキーマ
  types/               # TypeScript型定義
supabase/              # Supabaseマイグレーションと設定
```

## ライセンス

このプロジェクトは[MITライセンス](LICENSE)の下で提供されています。