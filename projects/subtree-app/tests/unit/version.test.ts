/**
 * Unit tests for version module
 */
import { VERSION, UPDATED, getVersionInfo } from '../../lambda/version';

describe('Version Module', () => {
  describe('VERSION constant', () => {
    it('バージョンが正しいフォーマットである', () => {
      expect(VERSION).toBeDefined();
      expect(typeof VERSION).toBe('string');

      // semver形式のチェック
      const parts = VERSION.split('.');
      expect(parts.length).toBe(3);
      parts.forEach(part => {
        expect(/^\d+$/.test(part)).toBe(true);
      });
    });
  });

  describe('UPDATED constant', () => {
    it('更新日が正しいフォーマットである', () => {
      expect(UPDATED).toBeDefined();
      expect(typeof UPDATED).toBe('string');

      // YYYY-MM-DD 形式のチェック
      expect(UPDATED).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      // 日付として妥当かチェック
      const date = new Date(UPDATED);
      expect(date.toString()).not.toBe('Invalid Date');
    });
  });

  describe('getVersionInfo', () => {
    it('正しい構造のバージョン情報を返す', () => {
      const info = getVersionInfo();

      expect(info).toBeDefined();
      expect(typeof info).toBe('object');

      // 必須フィールドのチェック
      expect(info).toHaveProperty('version');
      expect(info).toHaveProperty('updated');
      expect(info).toHaveProperty('description');
    });

    it('バージョン情報の値が正しい', () => {
      const info = getVersionInfo();

      expect(info.version).toBe(VERSION);
      expect(info.updated).toBe(UPDATED);
      expect(info.description).toContain('Subtree app');
    });

    it('バージョン情報が不変である', () => {
      const info1 = getVersionInfo();
      const info2 = getVersionInfo();

      expect(info1).toEqual(info2);
    });
  });
});
