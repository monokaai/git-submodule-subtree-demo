#!/bin/bash
# Git Submodule/Subtree デモプロジェクト セットアップスクリプト
# このスクリプトは、プロジェクトの初期構築手順を再現します

set -e  # エラー時に停止

echo "🚀 Git Submodule/Subtree デモプロジェクト セットアップ"
echo "=============================================="

# 色の定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ステップ表示関数
step() {
    echo -e "\n${GREEN}[Step $1]${NC} $2"
}

# エラー表示関数
error() {
    echo -e "${RED}❌ エラー:${NC} $1"
    exit 1
}

# 成功表示関数
success() {
    echo -e "${GREEN}✅${NC} $1"
}

# 警告表示関数
warning() {
    echo -e "${YELLOW}⚠️  ${NC} $1"
}

# 前提条件チェック
step 0 "前提条件をチェック中..."

command -v git >/dev/null 2>&1 || error "git がインストールされていません"
success "git がインストールされています"

command -v docker >/dev/null 2>&1 || warning "docker がインストールされていません（Docker build をスキップします）"

# ディレクトリ作成
step 1 "ルートディレクトリを作成中..."

PROJECT_ROOT="git_submodule_subtree_demo_new"
if [ -d "$PROJECT_ROOT" ]; then
    warning "ディレクトリ $PROJECT_ROOT は既に存在します"
    read -p "削除して再作成しますか？ (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf "$PROJECT_ROOT"
        success "既存ディレクトリを削除しました"
    else
        error "セットアップを中止しました"
    fi
fi

mkdir -p "$PROJECT_ROOT"
cd "$PROJECT_ROOT"
success "ディレクトリを作成しました: $PROJECT_ROOT"

# Git リポジトリ初期化
step 2 "ルートリポジトリを初期化中..."

git init
git config user.name "Demo User"
git config user.email "demo@example.com"
success "Git リポジトリを初期化しました"

# ディレクトリ構造作成
step 3 "ディレクトリ構造を作成中..."

mkdir -p docs scripts projects/utils cdktf
success "ディレクトリ構造を作成しました"

# 共通 utils ファイル作成
step 4 "共通ユーティリティファイルを作成中..."

cat > projects/utils/config.json <<'EOF'
{
  "app_name": "git-demo-lambda",
  "version": "1.2.0",
  "region": "us-east-1",
  "common_settings": {
    "timeout_seconds": 60,
    "memory_mb": 512,
    "log_level": "DEBUG",
    "enable_tracing": true
  },
  "message": "This is a shared configuration file used by both Python and TypeScript Lambda functions",
  "updated_at": "2025-11-11",
  "updated_reason": "共通設定を更新: タイムアウト延長、メモリ増量、トレーシング有効化"
}
EOF

cat > projects/utils/helpers.py <<'EOF'
"""共通ユーティリティ関数 (Python版)"""
import json
from pathlib import Path
from typing import Any, Dict

def load_config() -> Dict[str, Any]:
    """共通設定ファイルを読み込む"""
    config_path = Path(__file__).parent / "config.json"
    with open(config_path, "r", encoding="utf-8") as f:
        return json.load(f)

def format_response(status_code: int, body: Dict[str, Any]) -> Dict[str, Any]:
    """Lambda レスポンスフォーマット"""
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "X-Lambda-Version": load_config()["version"]
        },
        "body": json.dumps(body, ensure_ascii=False)
    }
EOF

cat > projects/utils/helpers.ts <<'EOF'
/**共通ユーティリティ関数 (TypeScript版)*/
import { readFileSync } from 'fs';
import { join } from 'path';

export function loadConfig() {
  const configPath = join(__dirname, 'config.json');
  return JSON.parse(readFileSync(configPath, 'utf-8'));
}

export function formatResponse(statusCode: number, body: Record<string, any>) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'X-Lambda-Version': loadConfig().version
    },
    body: JSON.stringify(body)
  };
}
EOF

success "共通ユーティリティファイルを作成しました"

# README 作成
step 5 "README を作成中..."

cat > README.md <<'EOF'
# Git Submodule vs Subtree デモプロジェクト

このプロジェクトは、git submodule と git subtree の運用方法を実践的に比較するためのデモです。

## ドキュメント

- [実行コマンドログ](docs/commands.md)
- [ワークフロー図](docs/workflow.md)
- [比較レポート](docs/comparison.md)

## セットアップ

```bash
./scripts/setup.sh
```

詳細は各ドキュメントを参照してください。
EOF

success "README を作成しました"

# 初期コミット
step 6 "初期コミットを作成中..."

git add .
git commit -m "初期コミット: プロジェクト構造と共通utilsを作成"
success "初期コミットを作成しました"

# サブリポジトリディレクトリ作成
step 7 "サブリポジトリを作成中..."

DEMO_REPOS="/tmp/demo-repos-$(date +%s)"
mkdir -p "$DEMO_REPOS"

# Submodule App (Python)
mkdir -p "$DEMO_REPOS/submodule-app/lambda"
cd "$DEMO_REPOS/submodule-app"
git init
git config user.name "Demo User"
git config user.email "demo@example.com"

cat > lambda/handler.py <<'PYEOF'
"""Python Lambda Handler (Submodule App)"""
import sys
from pathlib import Path

utils_path = Path(__file__).parent.parent.parent / "utils"
sys.path.insert(0, str(utils_path))

from helpers import load_config, format_response

def handler(event, context):
    config = load_config()
    return format_response(200, {
        "message": "Hello from Submodule App!",
        "management_type": "git submodule",
        "config": config
    })
PYEOF

cat > Dockerfile <<'DEOF'
FROM public.ecr.aws/lambda/python:3.11
COPY lambda/handler.py ${LAMBDA_TASK_ROOT}/
COPY utils/ ${LAMBDA_TASK_ROOT}/utils/
CMD ["handler.handler"]
DEOF

echo "submodule-app" > README.md

git add .
git commit -m "初期コミット: Python Lambda実装"
success "Submodule App を作成しました"

# Subtree App (TypeScript)
cd "$DEMO_REPOS"
mkdir -p subtree-app/lambda
cd subtree-app
git init
git config user.name "Demo User"
git config user.email "demo@example.com"

cat > lambda/index.ts <<'TSEOF'
/**TypeScript Lambda Handler (Subtree App)*/
import { loadConfig, formatResponse } from '../utils/helpers';

export const handler = async (event: any, context: any) => {
  const config = loadConfig();
  return formatResponse(200, {
    message: "Hello from Subtree App!",
    management_type: "git subtree",
    config
  });
};
TSEOF

cat > Dockerfile <<'DEOF'
FROM public.ecr.aws/lambda/nodejs:20
COPY lambda/ ${LAMBDA_TASK_ROOT}/lambda/
COPY utils/ ${LAMBDA_TASK_ROOT}/utils/
CMD ["lambda/index.handler"]
DEOF

echo "subtree-app" > README.md

git add .
git commit -m "初期コミット: TypeScript Lambda実装"
success "Subtree App を作成しました"

# ルートに戻る
cd -

# Git Submodule 追加
step 8 "Git Submodule を追加中..."

git config --global protocol.file.allow always
git submodule add "$DEMO_REPOS/submodule-app" projects/submodule-app
git commit -m "git submodule追加: submodule-app"
success "Git Submodule を追加しました"

# Git Subtree 追加
step 9 "Git Subtree を追加中..."

git subtree add --prefix=projects/subtree-app "$DEMO_REPOS/subtree-app" main --squash
success "Git Subtree を追加しました"

# 完了メッセージ
echo ""
echo "=============================================="
echo -e "${GREEN}🎉 セットアップが完了しました！${NC}"
echo "=============================================="
echo ""
echo "プロジェクトディレクトリ: $(pwd)"
echo "サブリポジトリディレクトリ: $DEMO_REPOS"
echo ""
echo "次のステップ:"
echo "  1. ドキュメントを確認: cat docs/commands.md"
echo "  2. ワークフローを確認: cat docs/workflow.md"
echo "  3. 比較レポートを確認: cat docs/comparison.md"
echo ""
echo "Git ログを確認:"
echo "  git log --oneline --graph --all"
echo ""
