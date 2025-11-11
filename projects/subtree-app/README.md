# Subtree App (TypeScript Lambda)

このリポジトリは git subtree として管理される TypeScript Lambda 関数です。

## 特徴

- TypeScript で実装
- `../utils` の共通ユーティリティを参照
- Docker でコンテナ化
- CDK for Terraform でデプロイ

## 開発

このリポジトリは独立して開発可能です。変更はルートリポジトリに subtree として反映されます。

## ファイル構成

- `lambda/index.ts` - Lambda ハンドラー
- `lambda/version.ts` - バージョン情報モジュール
- `lambda/package.json` - Node.js依存関係
- `lambda/tsconfig.json` - TypeScript設定
- `Dockerfile` - コンテナイメージビルド

## 最近の更新

- v1.1.0 (2025-11-11): バージョン情報モジュール追加
- ルートリポジトリから直接更新可能（git subtree push で反映）
