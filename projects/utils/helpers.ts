/**
 * 共通ユーティリティ関数 (TypeScript版)
 * Lambda関数から参照される共通機能を提供
 */
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

interface Config {
  app_name: string;
  version: string;
  region: string;
  common_settings: {
    timeout_seconds: number;
    memory_mb: number;
    log_level: string;
  };
  message: string;
}

interface LambdaResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

/**
 * 共通設定ファイルを読み込む
 */
export function loadConfig(): Config {
  // このファイルからの相対パスで config.json を読み込む
  const configPath = join(__dirname, 'config.json');
  const configData = readFileSync(configPath, 'utf-8');
  return JSON.parse(configData);
}

/**
 * Lambda レスポンスフォーマット
 */
export function formatResponse(statusCode: number, body: Record<string, any>): LambdaResponse {
  const config = loadConfig();
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'X-Lambda-Version': config.version
    },
    body: JSON.stringify(body)
  };
}

/**
 * 設定値を取得
 */
export function getSetting(key: string, defaultValue: any = null): any {
  const config = loadConfig();
  return (config as any)[key] ?? defaultValue;
}

/**
 * ログ出力（共通設定に基づく）
 */
export function logInfo(message: string): void {
  const config = loadConfig();
  const logLevel = config.common_settings.log_level;
  console.log(`[${logLevel}] ${message}`);
}
