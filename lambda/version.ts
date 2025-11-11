/**
 * バージョン情報
 */
export const VERSION = "1.1.0";
export const UPDATED = "2025-11-11";

export interface VersionInfo {
  version: string;
  updated: string;
  description: string;
}

export function getVersionInfo(): VersionInfo {
  return {
    version: VERSION,
    updated: UPDATED,
    description: "Subtree app - 独立リポジトリで更新"
  };
}
