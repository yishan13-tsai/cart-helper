import { describe, it, expect } from 'vitest';
import { parsePromotion } from './promotion';

describe('parsePromotion', () => {
  describe('null cases', () => {
    it('returns null when promotion is missing', () => {
      expect(parsePromotion(undefined, 100, 2)).toBeNull();
      expect(parsePromotion(null, 100, 2)).toBeNull();
      expect(parsePromotion('', 100, 2)).toBeNull();
    });

    it('returns null when unitPrice is null or non-positive', () => {
      expect(parsePromotion('第二件 6 折', null, 2)).toBeNull();
      expect(parsePromotion('第二件 6 折', 0, 2)).toBeNull();
      expect(parsePromotion('第二件 6 折', -10, 2)).toBeNull();
    });

    it('returns null when quantity is non-positive', () => {
      expect(parsePromotion('第二件 6 折', 100, 0)).toBeNull();
    });

    it('returns null on unrecognized text', () => {
      expect(parsePromotion('特價中', 100, 2)).toBeNull();
      expect(parsePromotion('會員價 79', 100, 2)).toBeNull();
    });
  });

  describe('第N件 X 折 (nth-discount)', () => {
    it('parses zh numerals — 第二件 6 折', () => {
      expect(parsePromotion('第二件 6 折', 100, 2)).toEqual({
        pattern: 'nth-discount',
        discount: 40,
      });
    });

    it('parses digits — 第2件6折', () => {
      expect(parsePromotion('第2件6折', 100, 2)).toEqual({
        pattern: 'nth-discount',
        discount: 40,
      });
    });

    it('parses zh discount char — 第二件六折', () => {
      expect(parsePromotion('第二件六折', 100, 2)).toEqual({
        pattern: 'nth-discount',
        discount: 40,
      });
    });

    it('parses decimal discount — 第二件8.5折', () => {
      expect(parsePromotion('第二件8.5折', 100, 2)).toEqual({
        pattern: 'nth-discount',
        discount: 15,
      });
    });

    it('returns null when qty < N', () => {
      expect(parsePromotion('第二件 6 折', 100, 1)).toBeNull();
    });

    it('multiple groups — qty=4, N=2 ⇒ 2 groups', () => {
      expect(parsePromotion('第二件 6 折', 100, 4)).toEqual({
        pattern: 'nth-discount',
        discount: 80,
      });
    });

    it('odd qty rounds down — qty=3, N=2 ⇒ 1 group', () => {
      expect(parsePromotion('第二件 6 折', 100, 3)).toEqual({
        pattern: 'nth-discount',
        discount: 40,
      });
    });

    it('第二件半價 → equivalent to 5 折', () => {
      expect(parsePromotion('第二件半價', 100, 2)).toEqual({
        pattern: 'nth-discount',
        discount: 50,
      });
    });
  });

  describe('N件 X (bundle-flat)', () => {
    it('兩件 99, qty=2, unit=60 → discount 21', () => {
      expect(parsePromotion('兩件 99', 60, 2)).toEqual({
        pattern: 'bundle-flat',
        discount: 21,
      });
    });

    it('digits + 元 — 2件99元, qty=4, unit=60 → 2 groups, discount 42', () => {
      expect(parsePromotion('2件99元', 60, 4)).toEqual({
        pattern: 'bundle-flat',
        discount: 42,
      });
    });

    it('returns null when qty < N', () => {
      expect(parsePromotion('兩件 99', 60, 1)).toBeNull();
    });

    it("returns null when bundle isn't cheaper than unit price", () => {
      // unit=80, 2 unit cost = 160. Bundle 200 is more expensive ⇒ skip.
      expect(parsePromotion('兩件 200', 80, 2)).toBeNull();
    });

    it('does NOT swallow 第N件X折 as a bundle', () => {
      const r = parsePromotion('第二件 6 折', 100, 2);
      expect(r?.pattern).toBe('nth-discount');
    });
  });

  describe('買N送M (buy-n-get-m)', () => {
    it('買一送一, qty=2, unit=100 → discount 100', () => {
      expect(parsePromotion('買一送一', 100, 2)).toEqual({
        pattern: 'buy-n-get-m',
        discount: 100,
      });
    });

    it('買二送一, qty=3, unit=100 → discount 100', () => {
      expect(parsePromotion('買二送一', 100, 3)).toEqual({
        pattern: 'buy-n-get-m',
        discount: 100,
      });
    });

    it('買二送一, qty=2 → null', () => {
      expect(parsePromotion('買二送一', 100, 2)).toBeNull();
    });

    it('digits — 買2送1, qty=6 → 2 groups, discount 200', () => {
      expect(parsePromotion('買2送1', 100, 6)).toEqual({
        pattern: 'buy-n-get-m',
        discount: 200,
      });
    });
  });

  describe('加一元多一件', () => {
    it('qty=2, unit=50 → discount 49', () => {
      expect(parsePromotion('加一元多一件', 50, 2)).toEqual({
        pattern: 'plus-one-yuan',
        discount: 49,
      });
    });

    it('qty=4, unit=50 → 2 groups, discount 98', () => {
      expect(parsePromotion('加一元多一件', 50, 4)).toEqual({
        pattern: 'plus-one-yuan',
        discount: 98,
      });
    });

    it('qty=1 → null', () => {
      expect(parsePromotion('加一元多一件', 50, 1)).toBeNull();
    });

    it('handles 加1元再1件 variant', () => {
      expect(parsePromotion('加1元再1件', 50, 2)).toEqual({
        pattern: 'plus-one-yuan',
        discount: 49,
      });
    });
  });
});
