"""
共通ユーティリティ関数 (Python版)
Lambda関数から参照される共通機能を提供
"""
import json
import os
from pathlib import Path
from typing import Any, Dict


def load_config() -> Dict[str, Any]:
    """共通設定ファイルを読み込む"""
    # このファイルからの相対パスで config.json を読み込む
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


def get_setting(key: str, default: Any = None) -> Any:
    """設定値を取得"""
    config = load_config()
    return config.get(key, default)


def log_info(message: str) -> None:
    """ログ出力（共通設定に基づく）"""
    config = load_config()
    log_level = config["common_settings"]["log_level"]
    print(f"[{log_level}] {message}")
