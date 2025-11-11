# Git Submodule vs Subtree ワークフロー

このドキュメントでは、git submodule と git subtree の運用フローを図解します。

## 📊 プロジェクト構成図

```mermaid
graph TB
    Root[ルートリポジトリ<br/>git_submodule_subtree_demo]
    Utils[projects/utils/<br/>共通ユーティリティ<br/>ルート管理]
    Submodule[projects/submodule-app/<br/>Python Lambda<br/>git submodule]
    Subtree[projects/subtree-app/<br/>TypeScript Lambda<br/>git subtree]

    SubmoduleRepo[/tmp/demo-repos/submodule-app<br/>独立リポジトリ]
    SubtreeRepo[/tmp/demo-repos/subtree-app<br/>独立リポジトリ]

    Root --> Utils
    Root -.参照.-> Submodule
    Root --> Subtree

    Submodule -.git submodule<br/>参照.-> SubmoduleRepo
    Subtree -.git subtree<br/>コピー元.-> SubtreeRepo

    Submodule -.-|参照| Utils
    Subtree -.-|参照| Utils

    style Root fill:#e1f5ff
    style Utils fill:#fff4e1
    style Submodule fill:#ffe1f5
    style Subtree fill:#e1ffe1
    style SubmoduleRepo fill:#ffe1e1
    style SubtreeRepo fill:#ffe1e1
```

## 🔄 Git Submodule ワークフロー

### 初期セットアップ

```mermaid
sequenceDiagram
    participant Dev as 開発者
    participant Root as ルートリポジトリ
    participant Sub as Submodule<br/>独立リポジトリ

    Dev->>Sub: 1. 独立リポジトリを作成
    activate Sub
    Note over Sub: git init<br/>コード実装<br/>git commit
    Sub-->>Dev: リポジトリURL
    deactivate Sub

    Dev->>Root: 2. submodule として追加
    activate Root
    Note over Root: git submodule add <URL> <path>
    Root->>Sub: 参照を作成
    Note over Root: .gitmodules ファイル生成<br/>特定のコミットを参照
    Root-->>Dev: 完了
    deactivate Root
```

### 更新フロー (Submodule → Root)

```mermaid
sequenceDiagram
    participant Dev as 開発者
    participant Root as ルートリポジトリ
    participant Sub as Submodule<br/>独立リポジトリ

    Dev->>Sub: 1. Submodule で変更
    activate Sub
    Note over Sub: コード変更<br/>git commit<br/>git push
    deactivate Sub

    Dev->>Root: 2. Root で更新を取得
    activate Root
    Note over Root: cd projects/submodule-app<br/>git pull origin main
    Root->>Sub: 最新コミットを取得

    Note over Root: cd ../..<br/>git add projects/submodule-app<br/>git commit -m "submodule更新"
    Root-->>Dev: 完了
    deactivate Root
```

### 更新フロー (Root → Submodule)

```mermaid
sequenceDiagram
    participant Dev as 開発者
    participant Root as ルートリポジトリ
    participant Sub as Submodule<br/>独立リポジトリ

    Dev->>Root: 1. Root で submodule 内を変更
    activate Root
    Note over Root: cd projects/submodule-app<br/>コード変更<br/>git commit
    deactivate Root

    Dev->>Sub: 2. Submodule リポジトリに push
    activate Sub
    Note over Sub: git push origin main
    deactivate Sub

    Dev->>Root: 3. Root で参照を更新
    activate Root
    Note over Root: git add projects/submodule-app<br/>git commit -m "submodule更新"
    deactivate Root
```

## 🌳 Git Subtree ワークフロー

### 初期セットアップ

```mermaid
sequenceDiagram
    participant Dev as 開発者
    participant Root as ルートリポジトリ
    participant Tree as Subtree<br/>独立リポジトリ

    Dev->>Tree: 1. 独立リポジトリを作成
    activate Tree
    Note over Tree: git init<br/>コード実装<br/>git commit
    Tree-->>Dev: リポジトリURL
    deactivate Tree

    Dev->>Root: 2. subtree として追加
    activate Root
    Note over Root: git subtree add<br/>--prefix=<path> <URL> <branch>
    Root->>Tree: ファイルをコピー
    Note over Root: ファイル全体をルートに統合<br/>履歴も含める (または--squash)
    Root-->>Dev: 完了
    deactivate Root
```

### 更新フロー (Subtree → Root)

```mermaid
sequenceDiagram
    participant Dev as 開発者
    participant Root as ルートリポジトリ
    participant Tree as Subtree<br/>独立リポジトリ

    Dev->>Tree: 1. Subtree で変更
    activate Tree
    Note over Tree: コード変更<br/>git commit<br/>git push
    deactivate Tree

    Dev->>Root: 2. Root で更新を pull
    activate Root
    Note over Root: git subtree pull<br/>--prefix=projects/subtree-app<br/><URL> main --squash
    Root->>Tree: 最新変更を取得
    Note over Root: マージコミットを作成
    Root-->>Dev: 完了
    deactivate Root
```

### 更新フロー (Root → Subtree)

```mermaid
sequenceDiagram
    participant Dev as 開発者
    participant Root as ルートリポジトリ
    participant Tree as Subtree<br/>独立リポジトリ

    Dev->>Root: 1. Root で subtree 内を変更
    activate Root
    Note over Root: projects/subtree-app/ 内で<br/>コード変更<br/>git commit
    deactivate Root

    Dev->>Root: 2. Subtree リポジトリに push
    activate Root
    Note over Root: git subtree push<br/>--prefix=projects/subtree-app<br/><URL> main
    Root->>Tree: 変更を push
    deactivate Root

    activate Tree
    Note over Tree: 変更が反映される
    deactivate Tree
```

## ⚖️ Submodule vs Subtree の違い

### データ管理の違い

```mermaid
graph LR
    subgraph Submodule方式
        R1[ルートリポジトリ]
        R1 -.参照のみ.-> S1[Submoduleリポジトリ]
        style S1 fill:#ffe1e1
    end

    subgraph Subtree方式
        R2[ルートリポジトリ]
        R2 -->|ファイルをコピー| S2[Subtreeの内容]
        S2 -.元リポジトリ.-> S3[独立リポジトリ]
        style S2 fill:#e1ffe1
        style S3 fill:#ffe1e1
    end
```

### コマンド比較表

| 操作 | Git Submodule | Git Subtree |
|------|---------------|-------------|
| **初期追加** | `git submodule add <URL> <path>` | `git subtree add --prefix=<path> <URL> <branch>` |
| **更新取得** | `cd <path> && git pull`<br/>+ `git add <path> && git commit` | `git subtree pull --prefix=<path> <URL> <branch>` |
| **変更送信** | `cd <path> && git push`<br/>+ 親でコミット | `git subtree push --prefix=<path> <URL> <branch>` |
| **クローン時** | `git clone --recurse-submodules` または<br/>`git submodule update --init --recursive` | 通常の `git clone` で完結 |
| **履歴管理** | 参照のみ（別リポジトリ） | ルートに統合される |

## 🐳 Docker Build との連携

### Build Context の考慮

```mermaid
graph TB
    BuildContext[Docker Build Context<br/>projects/]

    Submodule[submodule-app/<br/>Dockerfile]
    Subtree[subtree-app/<br/>Dockerfile]
    Utils[utils/<br/>共通ファイル]

    BuildContext --> Submodule
    BuildContext --> Subtree
    BuildContext --> Utils

    Submodule -.COPY utils/ .-.-> Utils
    Subtree -.COPY utils/ .-.-> Utils

    style BuildContext fill:#e1f5ff
    style Utils fill:#fff4e1
```

**ポイント**:
- Docker build context は `projects/` ディレクトリに設定
- 両方の Dockerfile から `COPY utils/` で共通ファイルを参照可能
- submodule でも subtree でも同じ方法で build できる

## 🚀 Lambda デプロイフロー

```mermaid
graph TB
    Dev[開発者]

    subgraph ルートリポジトリ
        Utils[utils/]
        Submodule[submodule-app/]
        Subtree[subtree-app/]
    end

    subgraph Docker Build
        Build1[Python Lambda Build]
        Build2[TypeScript Lambda Build]
    end

    subgraph AWS
        ECR[Amazon ECR]
        Lambda1[Lambda: submodule-app]
        Lambda2[Lambda: subtree-app]
    end

    Dev --> Utils
    Dev --> Submodule
    Dev --> Subtree

    Submodule --> Build1
    Subtree --> Build2
    Utils --> Build1
    Utils --> Build2

    Build1 --> ECR
    Build2 --> ECR

    ECR --> Lambda1
    ECR --> Lambda2

    style Dev fill:#e1f5ff
    style Utils fill:#fff4e1
    style ECR fill:#ff9900
    style Lambda1 fill:#ffe1f5
    style Lambda2 fill:#e1ffe1
```

## 📝 まとめ

### Git Submodule の特徴

**長所**:
- 各リポジトリが完全に独立
- 履歴が分離されている
- 大規模なモノレポに適している

**短所**:
- クローン時に追加手順が必要
- 更新が複雑（2段階のcommitが必要）
- 初心者には分かりにくい

### Git Subtree の特徴

**長所**:
- クローンが簡単（通常のgit cloneで完結）
- ルート側での作業が直感的
- 履歴がルートに統合される

**短所**:
- push/pull コマンドが長い
- 履歴が混ざる可能性
- リポジトリサイズが大きくなる

### 推奨事項

| シナリオ | 推奨 | 理由 |
|---------|------|------|
| 完全に独立した開発チーム | Submodule | 各チームが独自のリポジトリで作業 |
| 頻繁に統合する小規模プロジェクト | Subtree | クローンと統合が簡単 |
| CI/CDでの自動化 | Subtree | 追加セットアップ不要 |
| 複数バージョンの管理 | Submodule | 特定コミットへの固定が容易 |
