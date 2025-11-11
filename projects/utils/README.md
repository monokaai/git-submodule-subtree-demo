# 共通ユーティリティ (utils)

このディレクトリには、Python Lambda と TypeScript Lambda の両方で使用される共通ファイルが含まれています。

## ファイル構成

- `config.json` - 両Lambda共通の設定ファイル
- `helpers.py` - Python用ヘルパー関数
- `helpers.ts` - TypeScript用ヘルパー関数

## 使用方法

### Python Lambda から参照

```python
import sys
sys.path.append('../utils')
from helpers import load_config, format_response, log_info

config = load_config()
log_info("Lambda started")
```

### TypeScript Lambda から参照

```typescript
import { loadConfig, formatResponse, logInfo } from '../utils/helpers';

const config = loadConfig();
logInfo("Lambda started");
```

## 注意事項

- このディレクトリはルートリポジトリで管理されます
- submodule-app と subtree-app の両方から参照されます
- 変更時は両Lambda への影響を確認してください
