# 実行コマンドログ

このファイルには、git submodule/subtree デモプロジェクトで実行した全コマンドが記録されています。

## 📁 プロジェクトセットアップ

### [Step 1] ルートリポジトリの作成

**意図**: デモプロジェクトのルートディレクトリを作成し、Gitリポジトリとして初期化

```bash
mkdir -p git_submodule_subtree_demo
cd git_submodule_subtree_demo
git init
```

**結果**: 空のGitリポジトリが作成されました

### [Step 2] 基本ディレクトリ構造の作成

**意図**: プロジェクトの基本的なディレクトリ構造を作成

```bash
mkdir -p docs scripts projects/utils
```

**結果**: 必要なディレクトリが作成されました

### [Step 3] 共通ユーティリティファイルの作成

**意図**: Python と TypeScript の両Lambda から参照される共通ファイルを作成

作成したファイル:
- `projects/utils/config.json` - 共通設定
- `projects/utils/helpers.py` - Python用ヘルパー関数
- `projects/utils/helpers.ts` - TypeScript用ヘルパー関数
- `projects/utils/README.md` - ドキュメント

### [Step 4] コマンドロギングシステムの作成

**意図**: 実行したコマンドを自動的に記録するスクリプトを作成

```bash
# scripts/log-command.sh を作成
chmod +x scripts/log-command.sh
```

**使用方法**:
```bash
./scripts/log-command.sh "意図・目的" "実行するコマンド"
```

### [Step 5] ルートリポジトリの初期コミット

**意図**: ルートリポジトリの基本構造をコミット

```bash
git add .
git commit -m "初期コミット: プロジェクト構造と共通utilsを作成"
```

**結果**: コミット `f18b6bf` が作成されました

---

## 🐍 Submodule用リポジトリ (Python Lambda) の作成

### [Step 6] submodule-app リポジトリの初期化

**意図**: git submodule として管理される独立した Python Lambda リポジトリを作成

```bash
cd /tmp/demo-repos
mkdir submodule-app
cd submodule-app
git init
```

### [Step 7] Python Lambda の実装

**意図**: utils を参照する Python Lambda ハンドラーを実装

作成したファイル:
- `lambda/handler.py` - Lambda ハンドラー (../utils/helpers.py を参照)
- `lambda/requirements.txt` - Python依存関係
- `Dockerfile` - コンテナイメージビルド定義
- `README.md` - プロジェクトドキュメント
- `.gitignore` - Git除外設定

### [Step 8] submodule-app の初期コミット

**意図**: Python Lambda の初期実装をコミット

```bash
git add .
git commit -m "初期コミット: Python Lambda実装 (git submodule用)"
```

**結果**: コミット `93a0fd7` が作成されました

---

## 🟦 Subtree用リポジトリ (TypeScript Lambda) の作成

### [Step 9] subtree-app リポジトリの初期化

**意図**: git subtree として管理される独立した TypeScript Lambda リポジトリを作成

```bash
cd /tmp/demo-repos
mkdir subtree-app
cd subtree-app
git init
```

### [Step 10] TypeScript Lambda の実装

**意図**: utils を参照する TypeScript Lambda ハンドラーを実装

作成したファイル:
- `lambda/index.ts` - Lambda ハンドラー (../utils/helpers.ts を参照)
- `lambda/package.json` - Node.js依存関係
- `lambda/tsconfig.json` - TypeScript設定
- `Dockerfile` - コンテナイメージビルド定義
- `README.md` - プロジェクトドキュメント
- `.gitignore` - Git除外設定

### [Step 11] subtree-app の初期コミット

**意図**: TypeScript Lambda の初期実装をコミット

```bash
git add .
git commit -m "初期コミット: TypeScript Lambda実装 (git subtree用)"
```

**結果**: コミット `f74b57d` が作成されました

---

## 🔗 Git Submodule / Subtree の統合

### [Step 12] ローカルファイルプロトコルの許可

**意図**: デモのため、ローカルファイルシステムからのgit cloneを許可

```bash
cd /Users/monokaai/work/hq/projects/git_submodule_subtree_demo
git config --global protocol.file.allow always
```

**注意**: 本番環境では通常、リモートリポジトリ (GitHub, GitLab等) を使用します

### [Step 13] Git Submodule の追加

**意図**: submodule-app を git submodule としてルートリポジトリに統合

```bash
git submodule add /tmp/demo-repos/submodule-app projects/submodule-app
```

**結果**:
- `projects/submodule-app/` ディレクトリが作成されました
- `.gitmodules` ファイルが作成されました

**確認**:
```bash
cat .gitmodules
```

```ini
[submodule "projects/submodule-app"]
	path = projects/submodule-app
	url = /tmp/demo-repos/submodule-app
```

### [Step 14] Submodule 追加のコミット

**意図**: submodule の追加をコミット

```bash
git add .gitmodules projects/submodule-app
git commit -m "git submodule追加: submodule-app (Python Lambda)"
```

**結果**: コミット `b0f69d9` が作成されました

### [Step 15] Git Subtree の追加

**意図**: subtree-app を git subtree としてルートリポジトリに統合

```bash
git subtree add --prefix=projects/subtree-app /tmp/demo-repos/subtree-app main --squash
```

**オプション説明**:
- `--prefix=projects/subtree-app`: 統合先のディレクトリ
- `--squash`: 履歴を圧縮して1つのコミットにまとめる
- `main`: ブランチ名

**結果**:
- `projects/subtree-app/` ディレクトリにファイルがコピーされました
- 2つのコミットが作成されました:
  - `c0061ca`: Squashed commit
  - `907b903`: Merge commit

---

## 📊 現在の状態

### ディレクトリ構造

```
git_submodule_subtree_demo/
├── .git/
├── .gitmodules              # submodule設定
├── README.md
├── docs/
│   └── commands.md          # このファイル
├── scripts/
│   └── log-command.sh
├── projects/
│   ├── utils/               # 共通ユーティリティ (ルート管理)
│   │   ├── config.json
│   │   ├── helpers.py
│   │   ├── helpers.ts
│   │   └── README.md
│   ├── submodule-app/       # git submodule
│   │   ├── .git/            # 独立したgitリポジトリへの参照
│   │   ├── lambda/
│   │   │   ├── handler.py
│   │   │   └── requirements.txt
│   │   ├── Dockerfile
│   │   └── README.md
│   └── subtree-app/         # git subtree
│       ├── lambda/
│       │   ├── index.ts
│       │   ├── package.json
│       │   └── tsconfig.json
│       ├── Dockerfile
│       └── README.md
```

### Git コミット履歴

```bash
git log --oneline --graph --all
```

```
* 907b903 (HEAD -> main) Merge commit 'c0061caf058f9fed76df3bad5826f27cecdf836d' as 'projects/subtree-app'
|\
| * c0061ca Squashed 'projects/subtree-app/' content from commit f74b57d
|/
* b0f69d9 git submodule追加: submodule-app (Python Lambda)
* f18b6bf 初期コミット: プロジェクト構造と共通utilsを作成
```

---

## 次のステップ

1. ✅ プロジェクト構造の作成
2. ✅ 共通utilsの作成
3. ✅ サブリポジトリの作成 (submodule-app, subtree-app)
4. ✅ Git submodule/subtree の統合
5. ⏳ 各リポジトリでの開発シミュレーション
6. ⏳ CDK for Terraform のセットアップ
7. ⏳ Docker build とデプロイ
8. ⏳ 動作確認

続きは次のセクションに記載されます。
