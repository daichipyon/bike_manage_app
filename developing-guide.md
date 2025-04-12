# 新規プロジェクト開発環境・コーディングルール指示書

## 📌 技術スタック

### バックエンド（Supabase）
- **認証**：Supabase Auth (Email/OAuth)
- **データベース**：PostgreSQL (RLS活用)
- **ストレージ**：画像・ファイルアップロード用途

### フロントエンド（Next.js）
- **フレームワーク**：Next.js App Router (ver.13+)
- **データ取得・キャッシュ管理**：tanstack query (react-query)
- **フォーム送信**：Next.js Server Actions
- **バリデーション**：Zod

---

## 📁 推奨フォルダ構成

```plaintext
/app
  /dashboard
    /[projectId]
      page.tsx
      actions.ts
      queries.ts
      components/
  /auth
    login/page.tsx
    signup/page.tsx

/lib
  supabase.ts
  validators/
  actions/

/components
  ui/
  layout/

/hooks
  useSession.ts
  useAuthRedirect.ts

/types
  db.ts
```

---

## ✅ コーディングルール

### 命名規則

| 種別 | 規則 | 例 |
|------|------|-----|
| コンポーネント | パスカルケース | `ProjectCard.tsx` |
| フォルダ・ファイル名 | スネーク or ケバブケース | `project-detail` |
| Server Actions関数 | 動詞ベース | `createProject()` |

### 型定義
- Supabaseの自動生成型は`/types/db.ts`
- Zodバリデーションの型推論を使用 (`z.infer<typeof schema>`)

### クエリ管理（tanstack query）
- `queries.ts`で管理
- QueryKeyは配列で階層化 `["project", projectId]`
- mutationでのエラーハンドリングを徹底

### UI設計
- UIライブラリは`shadcn/ui`
- コンポーネント設計は再利用可能性を重視
- Props定義必須

---

## 🔨 品質管理
- ESLint + Prettier を必須
- commit hookに`lint-staged`
- ユニットテスト: 任意（vitest/jest）
- e2eテスト: 後期フェーズ導入推奨（Playwright/Cypress）

---

## ⚠️ 開発時注意事項
- Server Actionsで直接Supabaseクライアントを使用せず、抽象化すること
- SupabaseのRLSを常に意識
- サーバーとクライアントの責務分離を徹底

