# 受注管理システム（demo-order-app）

Shirube の動作確認用に作成した**架空の**受注管理システムです。実在の顧客・製品とは関係ありません。

## 起動方法

Node.js 20 以上が必要です（外部ライブラリは使用していません）。

```bash
npm start    # http://127.0.0.1:4000
npm test
```

## デモユーザー

| ID | パスワード | ロール |
|---|---|---|
| admin01 | admin-pass | 管理者 |
| sales01 | sales-pass | 営業部 |
| staff01 | staff-pass | 一般社員 |

## ディレクトリ構成

```text
public/                 画面（HTML / JavaScript / CSS）
src/server.js           HTTP サーバーとルーティング
src/routes/             API ハンドラー
src/services/           業務ロジック（注文の検索・保存・削除）
src/auth/               認証・セッション・権限
src/data/               デモ用データ（インメモリ）
test/                   単体テスト
spec/                   仕様書（画面仕様書.md、権限一覧.xlsx）
```

## API

| メソッド | パス | 説明 | 必要な権限 |
|---|---|---|---|
| POST | /api/login | ログイン | — |
| POST | /api/logout | ログアウト | — |
| GET | /api/me | ログインユーザーと権限 | ログイン |
| GET | /api/orders | 注文検索（customerName, dateFrom, dateTo, status） | order:search |
| GET | /api/orders/:orderNo | 注文詳細 | order:view |
| POST | /api/orders | 注文の新規作成・更新 | order:save |
| DELETE | /api/orders/:orderNo | 注文削除 | order:delete |
