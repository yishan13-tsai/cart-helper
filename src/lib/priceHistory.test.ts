import { describe, expect, it } from 'vitest';
import { comparePrice, findPriceTrend, namesMatch, normalize } from './priceHistory';
import type { CartItem, Currency, HistoryEntry } from '../types';

function makeEntry(
  items: Array<{ name: string; unitPrice: number; quantity?: number; currency?: Currency }>,
  startedAt = Date.now() - 86_400_000,
): HistoryEntry {
  const cartItems: CartItem[] = items.map((it, i) => ({
    id: `item-${i}`,
    name: it.name,
    unitPrice: it.unitPrice,
    quantity: it.quantity ?? 1,
    currency: it.currency ?? 'TWD',
    createdAt: startedAt,
  }));
  const total = cartItems.reduce(
    (s, it) => s + (it.unitPrice ?? 0) * it.quantity,
    0,
  );
  return {
    id: `entry-${startedAt}`,
    cart: {
      id: `entry-${startedAt}`,
      items: cartItems,
      currency: cartItems[0]?.currency ?? 'TWD',
      total,
      updatedAt: startedAt,
      startedAt,
    },
    savedAt: startedAt,
  };
}

describe('normalize', () => {
  it('lowercases and collapses whitespace', () => {
    expect(normalize('  Hello   World  ')).toBe('hello world');
    expect(normalize('統一鮮乳   936ml')).toBe('統一鮮乳 936ml');
  });

  it('returns empty string for blank input', () => {
    expect(normalize('   ')).toBe('');
  });
});

describe('namesMatch', () => {
  it('matches identical names', () => {
    expect(namesMatch('統一鮮乳', '統一鮮乳')).toBe(true);
  });

  it('matches when one is a substring of the other (both directions)', () => {
    expect(namesMatch('統一鮮乳', '統一鮮乳 936ml')).toBe(true);
    expect(namesMatch('統一鮮乳 936ml', '統一鮮乳')).toBe(true);
  });

  it('is case-insensitive', () => {
    expect(namesMatch('Coca Cola', 'COCA cola 2L')).toBe(true);
  });

  it('rejects unrelated names', () => {
    expect(namesMatch('統一鮮乳', '愛文芒果')).toBe(false);
    expect(namesMatch('milk', 'bread')).toBe(false);
  });

  it('rejects empty input', () => {
    expect(namesMatch('', '統一鮮乳')).toBe(false);
    expect(namesMatch('   ', '統一鮮乳')).toBe(false);
  });
});

describe('findPriceTrend', () => {
  it('returns null when no entries match', () => {
    const trend = findPriceTrend('牛奶', 'TWD', [
      makeEntry([{ name: '麵包', unitPrice: 30 }]),
    ]);
    expect(trend).toBeNull();
  });

  it('returns null on empty history', () => {
    expect(findPriceTrend('milk', 'TWD', [])).toBeNull();
  });

  it('aggregates prices across entries with matching name', () => {
    const trend = findPriceTrend('統一鮮乳', 'TWD', [
      makeEntry([{ name: '統一鮮乳 936ml', unitPrice: 89 }], 1_000_000),
      makeEntry([{ name: '統一鮮乳', unitPrice: 95 }], 2_000_000),
    ]);
    expect(trend).not.toBeNull();
    expect(trend!.occurrences).toBe(2);
    expect(trend!.lastPrice).toBe(95);
    expect(trend!.avgPrice).toBe(92);
    expect(trend!.lastSeenAt).toBe(2_000_000);
  });

  it('skips items with null or zero price', () => {
    const trend = findPriceTrend('統一鮮乳', 'TWD', [
      makeEntry([{ name: '統一鮮乳', unitPrice: 0 }]),
    ]);
    expect(trend).toBeNull();
  });

  it('skips entries with mismatched currency', () => {
    const trend = findPriceTrend('milk', 'USD', [
      makeEntry([{ name: 'milk', unitPrice: 89, currency: 'TWD' }]),
    ]);
    expect(trend).toBeNull();
  });
});

describe('comparePrice', () => {
  const history = [
    makeEntry([{ name: '統一鮮乳 936ml', unitPrice: 89 }]),
  ];

  it('returns null when item has no price', () => {
    expect(
      comparePrice(
        { name: '統一鮮乳', unitPrice: null, currency: 'TWD' },
        history,
      ),
    ).toBeNull();
  });

  it('returns null when no history match', () => {
    expect(
      comparePrice(
        { name: '香蕉', unitPrice: 30, currency: 'TWD' },
        history,
      ),
    ).toBeNull();
  });

  it('flags hike when current price > last + 5%', () => {
    const cmp = comparePrice(
      { name: '統一鮮乳', unitPrice: 95, currency: 'TWD' },
      history,
    );
    expect(cmp).not.toBeNull();
    expect(cmp!.verdict).toBe('hike');
    expect(cmp!.deltaPct).toBeCloseTo((95 - 89) / 89, 4);
  });

  it('flags drop when current price < last − 5%', () => {
    const cmp = comparePrice(
      { name: '統一鮮乳', unitPrice: 80, currency: 'TWD' },
      history,
    );
    expect(cmp).not.toBeNull();
    expect(cmp!.verdict).toBe('drop');
    expect(cmp!.deltaPct).toBeLessThan(0);
  });

  it('returns flat verdict when within ±5%', () => {
    const cmp = comparePrice(
      { name: '統一鮮乳', unitPrice: 91, currency: 'TWD' },
      history,
    );
    expect(cmp).not.toBeNull();
    expect(cmp!.verdict).toBe('flat');
  });
});
