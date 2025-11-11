# CDK for Terraform - Lambda Deployment

このディレクトリには、submodule-app と subtree-app を AWS Lambda にデプロイするための CDK for Terraform (cdktf) 設定が含まれています。

## 前提条件

- Node.js 20+
- AWS CLI (設定済み)
- Terraform CLI
- Docker
- cdktf CLI: `npm install -g cdktf-cli`

## セットアップ

```bash
cd cdktf
npm install
cdktf get  # Terraform プロバイダーをダウンロード
```

## デプロイ手順

### 1. Docker イメージのビルド

```bash
# Submodule App (Python Lambda)
cd ../projects
docker build -t git-demo-submodule-app:latest \
  -f submodule-app/Dockerfile \
  .

# Subtree App (TypeScript Lambda)
docker build -t git-demo-subtree-app:latest \
  -f subtree-app/Dockerfile \
  .
```

### 2. ECR にプッシュ

```bash
# AWS アカウント ID を取得
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION="us-east-1"

# ECR ログイン
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin \
  $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# まず cdktf で ECR リポジトリを作成
cd ../cdktf
cdktf deploy

# ECR にプッシュ (出力された ECR URL を使用)
docker tag git-demo-submodule-app:latest \
  $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/git-demo-submodule-app:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/git-demo-submodule-app:latest

docker tag git-demo-subtree-app:latest \
  $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/git-demo-subtree-app:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/git-demo-subtree-app:latest
```

### 3. Lambda のデプロイ

```bash
# イメージがプッシュされた後、再度 deploy して Lambda を更新
cdktf deploy
```

## インフラ構成

このスタックは以下のリソースを作成します：

- **IAM Role**: Lambda 実行ロール
- **ECR Repository (2つ)**:
  - `git-demo-submodule-app` (Python Lambda)
  - `git-demo-subtree-app` (TypeScript Lambda)
- **Lambda Function (2つ)**:
  - `git-demo-submodule-app` (git submodule 管理)
  - `git-demo-subtree-app` (git subtree 管理)

### リソース設定

両方の Lambda:
- メモリ: 512 MB
- タイムアウト: 60秒
- パッケージタイプ: Container (Docker)

## テスト

```bash
# Submodule Lambda をテスト
aws lambda invoke \
  --function-name git-demo-submodule-app \
  --payload '{"test": true}' \
  response-submodule.json

cat response-submodule.json | jq

# Subtree Lambda をテスト
aws lambda invoke \
  --function-name git-demo-subtree-app \
  --payload '{"test": true}' \
  response-subtree.json

cat response-subtree.json | jq
```

## クリーンアップ

```bash
cdktf destroy
```

## ディレクトリ構造

```
cdktf/
├── main.ts           # メインのインフラ定義
├── package.json      # Node.js 依存関係
├── tsconfig.json     # TypeScript 設定
├── cdktf.json        # CDKTF 設定
└── README.md         # このファイル
```

## 注意事項

- デモ環境では、実際に AWS にデプロイせず、設定ファイルのみを準備しています
- 実際のデプロイには AWS アカウントと適切な権限が必要です
- Docker イメージは `projects/` ディレクトリから build する必要があります（共通 utils を参照するため）

## トラブルシューティング

### Docker build が失敗する

- build context が `projects/` ディレクトリであることを確認
- submodule が最新状態であることを確認: `git submodule update --remote`

### Lambda が起動しない

- ECR にイメージが正しくプッシュされているか確認
- Lambda の環境変数が正しく設定されているか確認
- CloudWatch Logs でエラーメッセージを確認
