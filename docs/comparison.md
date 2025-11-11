# Git Submodule vs Subtree 比較レポート

このドキュメントでは、実際のプロジェクトで検証した git submodule と git subtree の運用経験をもとに、両者を比較します。

## 📊 総合評価

| 項目 | Git Submodule | Git Subtree | 備考 |
|------|---------------|-------------|------|
| **セットアップの容易さ** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Subtree は通常の git clone で完結 |
| **更新の容易さ** | ⭐⭐ | ⭐⭐⭐⭐ | Submodule は2段階コミット必要 |
| **独立性の保持** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Submodule は完全に独立 |
| **履歴の明確さ** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Submodule は履歴が分離 |
| **CI/CD との親和性** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Subtree は追加設定不要 |
| **チーム協業の容易さ** | ⭐⭐ | ⭐⭐⭐⭐ | Subtree は初心者に優しい |
| **大規模プロジェクト** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Submodule はスケーラブル |

## 🔍 詳細比較

### 1. セットアップ

#### Git Submodule

**利点**:
- 各リポジトリが完全に独立
- 他のプロジェクトでも同じリポジトリを参照可能
- バージョン管理が明確（特定コミットに固定）

**欠点**:
- クローン時に `--recurse-submodules` が必要
- または、クローン後に `git submodule update --init --recursive` が必要
- 初めて使う人には分かりにくい

**実際のコマンド**:
```bash
# 初回クローン
git clone --recurse-submodules <repo-url>

# または
git clone <repo-url>
git submodule update --init --recursive
```

#### Git Subtree

**利点**:
- 通常の `git clone` で完結
- 追加の手順不要
- 新規メンバーのオンボーディングが容易

**欠点**:
- ファイルがルートリポジトリにコピーされる
- リポジトリサイズが大きくなる
- 元リポジトリとの同期を忘れやすい

**実際のコマンド**:
```bash
# 通常のクローンで完結
git clone <repo-url>
# すべてのファイルが既に存在
```

### 2. 日常的な開発フロー

#### Git Submodule - サブリポジトリの更新を取得

```bash
# 1. サブリポジトリに移動
cd projects/submodule-app

# 2. 最新を pull
git pull origin main

# 3. ルートに戻って参照を更新
cd ../..
git add projects/submodule-app
git commit -m "update: submodule更新"
```

**問題点**:
- 2段階のコミットが必要
- サブリポジトリの変更を忘れやすい
- マージコンフリクトが分かりにくい

#### Git Subtree - サブリポジトリの更新を取得

```bash
# 1コマンドで完結
git subtree pull --prefix=projects/subtree-app \
  <remote-url> main --squash
```

**問題点**:
- コマンドが長い（エイリアス推奨）
- 履歴が混ざる可能性
- 元リポジトリのURLを覚えておく必要がある

### 3. サブリポジトリへの変更の push

#### Git Submodule

```bash
# 1. サブリポジトリで変更
cd projects/submodule-app
# ... コード変更 ...
git add .
git commit -m "feat: 新機能追加"
git push origin main

# 2. ルートで参照を更新
cd ../..
git add projects/submodule-app
git commit -m "update: submodule更新"
git push origin main
```

#### Git Subtree

```bash
# 1. ルートで変更
# ... projects/subtree-app/ 内でコード変更 ...
git add projects/subtree-app/
git commit -m "feat: 新機能追加"

# 2. 元リポジトリに push
git subtree push --prefix=projects/subtree-app \
  <remote-url> main
```

### 4. 共通ファイル (utils) の参照

**両方とも同じ方法で参照可能**:

```
projects/
├── utils/              # 共通ユーティリティ
│   ├── config.json
│   ├── helpers.py
│   └── helpers.ts
├── submodule-app/      # ../utils を参照
└── subtree-app/        # ../utils を参照
```

**Docker build context**:
```bash
# build context は projects/ に設定
docker build -f submodule-app/Dockerfile -t app1 .
docker build -f subtree-app/Dockerfile -t app2 .

# 両方とも COPY utils/ . で共通ファイルをコピー可能
```

## 💡 実践的なシナリオ別推奨

### シナリオ 1: マイクロサービスアーキテクチャ

**状況**:
- 複数の独立したサービス
- 各サービスは別チームが開発
- 共通ライブラリを参照

**推奨**: **Git Submodule**

**理由**:
- 各サービスの独立性が保たれる
- チーム間の境界が明確
- バージョン管理が厳密

### シナリオ 2: モノレポ with 共有コンポーネント

**状況**:
- 単一リポジトリで複数アプリ管理
- 一部のコンポーネントを外部リポジトリとしても公開
- 頻繁に統合・デプロイ

**推奨**: **Git Subtree**

**理由**:
- クローンが簡単
- CI/CD 設定がシンプル
- チーム全体での作業が容易

### シナリオ 3: サードパーティライブラリの統合

**状況**:
- 外部のOSSライブラリを統合
- カスタマイズが必要
- アップストリームの更新も取り込みたい

**推奨**: **Git Subtree**

**理由**:
- `git subtree pull` で簡単に更新取得
- カスタマイズもルート側で管理
- 履歴が保持される

### シナリオ 4: 大規模エンタープライズプロジェクト

**状況**:
- 数十〜数百のリポジトリ
- 厳格なバージョン管理が必要
- 監査要件あり

**推奨**: **Git Submodule**

**理由**:
- 各コンポーネントのバージョンが明確
- 履歴が分離されている
- 大規模でもパフォーマンスが安定

## 🎯 本プロジェクトでの検証結果

### 実施した検証

1. ✅ 初期セットアップ
2. ✅ サブリポジトリからの更新取得
3. ✅ ルートからサブリポジトリへの push
4. ✅ 共通 utils の参照
5. ✅ Docker build との連携
6. ✅ CDK for Terraform でのデプロイ設定

### 発見事項

#### Git Submodule

**良かった点**:
- 各リポジトリが完全に独立していて安心
- コミットハッシュで固定されるため、再現性が高い
- 大規模プロジェクトでもパフォーマンスが良い

**困った点**:
- 2段階コミットが面倒
- クローン時に `--recurse-submodules` を忘れやすい
- サブリポジトリの detached HEAD 状態が混乱を招く

**ワークアラウンド**:
```bash
# エイリアスを設定
git config --global alias.sup 'submodule update --remote --merge'

# フックでチェック
# .git/hooks/post-checkout に submodule update を追加
```

#### Git Subtree

**良かった点**:
- クローンが簡単で新規メンバーのオンボーディングが容易
- ルート側での作業が直感的
- CI/CD の設定がシンプル

**困った点**:
- コマンドが長い（特に push/pull）
- 履歴が混ざって見づらくなることがある
- リポジトリサイズが大きくなる

**ワークアラウンド**:
```bash
# エイリアスを設定
git config alias.stp 'subtree pull --prefix=projects/subtree-app /tmp/demo-repos/subtree-app main --squash'
git config alias.stpush 'subtree push --prefix=projects/subtree-app /tmp/demo-repos/subtree-app main'
```

### Docker との連携

**両方とも問題なし**:
- build context を `projects/` に設定することで、どちらも utils を参照可能
- Dockerfile の記述も同じパターンで統一できる

```dockerfile
# 両方とも同じ方法で utils を参照
COPY utils/ ${LAMBDA_TASK_ROOT}/utils/
```

## 📝 推奨事項とベストプラクティス

### Git Submodule を選ぶべき場合

✅ 以下の条件に当てはまる場合は Submodule を推奨:

- 完全な独立性が必要
- 複数のプロジェクトで同じリポジトリを参照
- 厳格なバージョン管理が必要
- 大規模プロジェクト（10+ サブリポジトリ）
- 各リポジトリが異なるリリースサイクル

**ベストプラクティス**:
```bash
# 1. エイリアスを設定
git config --global alias.sup 'submodule update --remote --merge'

# 2. クローン時は必ず --recurse-submodules
git clone --recurse-submodules <url>

# 3. .gitmodules をバージョン管理
# ブランチやタグで固定する

# 4. CI/CD で初期化を忘れずに
git submodule update --init --recursive
```

### Git Subtree を選ぶべき場合

✅ 以下の条件に当てはまる場合は Subtree を推奨:

- シンプルな運用が望ましい
- 頻繁に統合する小〜中規模プロジェクト
- 新規メンバーのオンボーディングを重視
- CI/CD をシンプルに保ちたい
- 履歴を統合したい

**ベストプラクティス**:
```bash
# 1. エイリアスを設定
git config alias.stp 'subtree pull --prefix=<path> <url> main --squash'
git config alias.stpush 'subtree push --prefix=<path> <url> main'

# 2. --squash を使用して履歴を圧縮

# 3. リモート URL をドキュメント化
# README に明記しておく

# 4. 定期的に pull して同期
```

### ハイブリッドアプローチ

実際のプロジェクトでは、両方を組み合わせることも可能:

```
my-project/
├── core-services/      # Submodule (厳格に管理)
│   ├── auth-service/
│   └── payment-service/
└── shared-libraries/   # Subtree (頻繁に更新)
    ├── ui-components/
    └── utils/
```

## 🚀 まとめ

### Git Submodule

**向いているプロジェクト**:
- エンタープライズの大規模システム
- マイクロサービスアーキテクチャ
- 厳格なバージョン管理が必要なプロジェクト

**キーワード**: 独立性、厳格性、スケーラビリティ

### Git Subtree

**向いているプロジェクト**:
- スタートアップの小〜中規模プロジェクト
- 頻繁に統合するモノレポ
- シンプルさを重視するチーム

**キーワード**: シンプル、統合、柔軟性

### 最終的な選択基準

```
チームの規模が大きい
または
厳格なバージョン管理が必要
または
複数プロジェクトで共有
    ↓
  Git Submodule

それ以外の場合
    ↓
  Git Subtree
```

両方とも一長一短があるため、プロジェクトの性質とチームの習熟度に応じて選択することが重要です。
