# Git Submodule vs Subtree デモプロジェクト

このプロジェクトは、git submodule と git subtree の運用方法を実践的に比較するためのデモです。

## 📦 リポジトリ

- **ルートリポジトリ**: このリポジトリ
- **Submodule App** (Python Lambda): [monokaai/demo-submodule-app](https://github.com/monokaai/demo-submodule-app)
- **Subtree App** (TypeScript Lambda): [monokaai/demo-subtree-app](https://github.com/monokaai/demo-subtree-app)

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

- 📝 [実行コマンドログ](docs/commands.md) - 全コマンドの詳細記録
- 🎨 [ワークフロー図](docs/workflow.md) - Mermaid図での可視化
- ⚖️ [比較レポート](docs/comparison.md) - Submodule vs Subtree 詳細比較
- 📊 [プロジェクトサマリー](docs/summary.md) - 完了レポートとまとめ

## クイックスタート

### このプロジェクトをクローン

```bash
# Submodule を含めてクローン
git clone --recurse-submodules https://github.com/monokaai/git-submodule-subtree-demo.git

# または、通常のクローン後に submodule を初期化
git clone https://github.com/monokaai/git-submodule-subtree-demo.git
cd git-submodule-subtree-demo
git submodule update --init --recursive
```

### プロジェクトを再現

```bash
# セットアップスクリプトで新規作成
./scripts/setup.sh
```

### テストを実行

各Lambda関数のテストを実行できます：

```bash
# Python Lambda (Submodule App) のテスト
cd projects/submodule-app
pixi install
pixi run test           # すべてのテスト
pixi run test-unit      # Unit テストのみ
pixi run test-e2e       # E2E テストのみ
pixi run test-cov       # カバレッジ付き

# TypeScript Lambda (Subtree App) のテスト
cd projects/subtree-app
pnpm install
pnpm test               # すべてのテスト
pnpm run test:unit      # Unit テストのみ
pnpm run test:e2e       # E2E テストのみ
pnpm run test:coverage  # カバレッジ付き
```

### Docker イメージをビルド

```bash
cd projects

# Python Lambda (Submodule App)
docker build -t submodule-app -f submodule-app/Dockerfile .

# TypeScript Lambda (Subtree App)
docker build -t subtree-app -f subtree-app/Dockerfile .
```

### デプロイ（オプション）

CDK for Terraform を使用してデプロイ:

```bash
cd cdktf
npm install
cdktf deploy
```

詳細は [cdktf/README.md](cdktf/README.md) を参照してください。

## 📚 学習リソース

### 推奨閲覧順序

1. [プロジェクトサマリー](docs/summary.md) - プロジェクト全体の概要
2. [ワークフロー図](docs/workflow.md) - 視覚的な理解
3. [比較レポート](docs/comparison.md) - 詳細な比較と推奨事項
4. [実行コマンドログ](docs/commands.md) - 実装の詳細

## 🎯 主な発見

**Git Submodule**: 大規模プロジェクト向け
- ✅ 完全な独立性
- ✅ 厳密なバージョン管理
- ❌ セットアップが複雑

**Git Subtree**: 小〜中規模プロジェクト向け
- ✅ シンプルな運用
- ✅ 初心者に優しい
- ❌ リポジトリサイズ増加

詳細は [比較レポート](docs/comparison.md) を参照してください。
