# 🖥 画面仕様書（マンション共同駐輪場管理Webアプリケーション）

---

## ✅ 要件反映済み

- 「ダッシュボードページ」と「駐輪枠管理ページ」を統合
- 「居住者を追加して枠に割り当てる」一連の操作が可能なUI構成を設計

---

## 🔐 1. ログインページ（/login）

- **目的**：管理人ログイン用
- **構成**：
  - メール／パスワードフォーム
  - Firebase Auth等で認証
  - エラーメッセージ表示対応

---

## 🏠 2. ダッシュボード + 駐輪枠管理ページ（/dashboard）

### 📌 概要

管理人がログイン後に訪れるメイン画面。  
統計情報と駐輪枠の一覧、割り当て操作が集約された画面。

### 🧩 レイアウト構成

- **上部統計カード**
  - 空き枠数
  - 使用中枠数
  - 未入金者数
  - 不正利用記録数

- **駐輪枠一覧テーブル**
  - スロットコード
  - 位置
  - 利用者（居住者名 or 空き）
  - ステータス
  - 操作（割り当て解除）

- **アクションバー**
  - [ 新規居住者＋枠割り当て ] ボタン
  - [ 既存居住者へ割り当て ] ボタン

- **モーダル（ステップUI）**
  1. 居住者情報入力
  2. 空き枠選択
  3. ステッカー情報入力（番号、発行日）
  4. [ 登録実行 ] ボタン

---

## 🧍‍♂️ 3. 居住者管理ページ（/residents）

- **目的**：居住者の登録・編集・削除・検索
- **構成**：
  - 検索バー（氏名／部屋番号）
  - 一覧テーブル（氏名、部屋、連絡先、ステータス、割り当て枠）
  - 編集・削除操作
  - 割り当て済み枠情報も表示

---

## 🎫 4. 割り当て・ステッカー発行ページ（/assign）

- **目的**：既存居住者に枠を割り当て、ステッカーを発行
- **構成**：
  - 居住者検索・選択
  - 空き枠選択
  - ステッカー情報入力
  - 登録ボタン

※ ダッシュボードからモーダル表示でも可

---

## 🚫 5. 不正利用記録ページ（/violations）

- **目的**：不正利用の現地記録登録と履歴閲覧
- **構成**：
  - 入力フォーム（日時／場所／備考／写真）
  - 記録一覧（最新順）

---

## 💴 6. 入金管理ページ（/payments）

- **目的**：未入金者の抽出・入金状況管理・CSV出力
- **構成**：
  - 月選択 → 抽出ボタン
  - 対象者一覧（氏名、部屋、枠、金額、ステータス）
  - CSV出力機能

---

## 🧾 7. 操作ログページ（/logs）※任意実装

- **目的**：操作履歴の参照（割り当て、削除、発行等）
- **構成**：
  - 操作日時／操作内容／対象居住者・枠などの一覧表示

---

## 🧱 共通レイアウト構成

| 項目         | 内容 |
|--------------|------|
| サイドバー   | ダッシュボード／居住者／割り当て／不正記録／入金／ログなど |
| ヘッダー     | アプリ名、ログインユーザー名、ログアウト |
| フッター     | バージョン情報、運営連絡先（任意） |

---

## 📌 画面遷移概要（簡易図）

```plaintext
[ログイン]
    ↓
[ダッシュボード]（統計＋駐輪枠管理）
    ├─▶ 新規居住者＋割り当て（モーダル）
    ├─▶ 既存居住者へ割り当て（モーダル）
    ├─▶ 居住者管理ページ
    ├─▶ 不正利用記録ページ
    └─▶ 入金管理ページ
