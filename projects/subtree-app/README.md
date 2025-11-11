# Subtree App (TypeScript Lambda)

このリポジトリは git subtree として管理される TypeScript Lambda 関数です。

## 特徴

- TypeScript で実装
- `../utils` の共通ユーティリティを参照
- Docker でコンテナ化
- CDK for Terraform でデプロイ

## 開発

このリポジトリは独立して開発可能です。変更はルートリポジトリに subtree として反映されます。

### セットアップ

```bash
# pnpm のインストール（未インストールの場合）
npm install -g pnpm@10.20.0

# 依存関係のインストール
pnpm install
```

### ビルド

```bash
# TypeScript のコンパイル
pnpm run build

# 型チェック
pnpm run type-check
```

### テスト実行

```bash
# すべてのテストを実行
pnpm test

# Unit テストのみ
pnpm run test:unit

# E2E テストのみ
pnpm run test:e2e

# カバレッジ付きテスト
pnpm run test:coverage

# Watch モード
pnpm run test:watch
```

### コード品質

```bash
# フォーマット
pnpm run format

# リント
pnpm run lint
```

## ファイル構成

- `lambda/index.ts` - Lambda ハンドラー
- `lambda/version.ts` - バージョン情報
- `lambda/package.json` - Lambda用依存関係
- `lambda/tsconfig.json` - Lambda用TypeScript設定
- `tests/unit/` - Unit テスト
- `tests/e2e/` - E2E テスト
- `package.json` - プロジェクト依存関係（pnpm管理）
- `tsconfig.json` - プロジェクトTypeScript設定
- `jest.config.js` - Jest設定
- `Dockerfile` - コンテナイメージビルド

## 最近の更新

- v1.2.0 (2025-11-11): pnpm管理とunit/e2eテスト追加
- v1.1.0 (2025-11-11): バージョン情報モジュール追加
- ルートリポジトリから直接更新可能（git subtree push で反映）
