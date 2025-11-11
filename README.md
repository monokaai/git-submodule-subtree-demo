# Git Submodule vs Subtree デモプロジェクト

このプロジェクトは、git submodule と git subtree の運用方法を実践的に比較するためのデモです。

## プロジェクト構成

```
git_submodule_subtree_demo/  (ルートリポジトリ)
├── projects/
│   ├── submodule-app/       # git submodule で管理（Python Lambda）
│   ├── subtree-app/         # git subtree で管理（TypeScript Lambda）
│   └── utils/               # 共通ユーティリティ（ルート管理）
├── cdktf/                   # CDK for Terraform設定
├── docs/                    # ドキュメント
└── scripts/                 # ユーティリティスクリプト
```

## 検証内容

1. **Git Submodule 運用**
   - Python Lambda を独立リポジトリとして管理
   - submodule として統合
   - 更新フローの確認

2. **Git Subtree 運用**
   - TypeScript Lambda を独立リポジトリとして管理
   - subtree として統合
   - 更新フローの確認

3. **共通ユーティリティの参照**
   - `projects/utils/` を両Lambda から参照
   - Docker build での動作確認

4. **デプロイ**
   - CDK for Terraform で AWS Lambda にデプロイ
   - 実際の動作確認

## ドキュメント

- [実行コマンドログ](docs/commands.md) - 全コマンドの記録
- [ワークフロー図](docs/workflow.md) - Mermaid図での可視化
- [比較レポート](docs/comparison.md) - submodule vs subtree の比較

## セットアップ

詳細は `scripts/setup.sh` を参照してください。
