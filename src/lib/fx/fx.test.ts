import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchRates, defaultBaseForLocale } from './client';
import { convert, convertAsync } from './convert';
import { FxError, type RateTable } from './types';

function makeTable(over: Partial<RateTable> = {}): RateTable {
  return {
    base: 'TWD',
    date: '2026-04-23',
    rates: { TWD: 1, USD: 0.0317, JPY: 5.06, KRW: 47, COP: 113.11 },
    fetchedAt: 1_700_000_000_000,
    stale: false,
    ...over,
  };
}

function memoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => {
      map.set(k, v);
    },
    removeItem: (k) => {
      map.delete(k);
    },
    key: (i) => Array.from(map.keys())[i] ?? null,
  };
}

describe('convert', () => {
  const table = makeTable();

  it('returns the same amount for same currency', () => {
    expect(convert(123, 'TWD', 'TWD', table)).toBe(123);
    expect(convert(50, 'usd', 'USD', table)).toBe(50);
  });

  it('converts from base directly via the table rate', () => {
    expect(convert(1000, 'TWD', 'JPY', table)).toBeCloseTo(5060, 5);
    expect(convert(1000, 'TWD', 'USD', table)).toBeCloseTo(31.7, 5);
  });

  it('converts to base by inverting the rate', () => {
    // 47 KRW = 1 TWD, so 470 KRW should be 10 TWD.
    expect(convert(470, 'KRW', 'TWD', table)).toBeCloseTo(10, 5);
  });

  it('pivots through base when both currencies differ from base', () => {
    // 100 USD -> TWD -> JPY: 100 / 0.0317 * 5.06
    const expected = (100 / 0.0317) * 5.06;
    expect(convert(100, 'USD', 'JPY', table)).toBeCloseTo(expected, 5);
  });

  it('throws FX_UNKNOWN_CURRENCY when source missing from table', () => {
    expect(() => convert(1, 'XYZ', 'TWD', table)).toThrowError(FxError);
  });

  it('throws FX_UNKNOWN_CURRENCY when target missing from table', () => {
    expect(() => convert(1, 'TWD', 'XYZ', table)).toThrowError(/target/);
  });

  it('rejects non-finite amounts', () => {
    expect(() => convert(Number.NaN, 'TWD', 'JPY', table)).toThrowError(/finite/);
    expect(() => convert(Number.POSITIVE_INFINITY, 'TWD', 'JPY', table)).toThrowError(/finite/);
  });
});

describe('fetchRates', () => {
  let storage: Storage;
  let now: number;

  beforeEach(() => {
    storage = memoryStorage();
    now = 1_700_000_000_000;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('rejects unknown base currency before any fetch', async () => {
    const fetcher = vi.fn();
    await expect(
      fetchRates('XYZ', { fetcher: fetcher as unknown as typeof fetch, storage, now: () => now }),
    ).rejects.toMatchObject({ code: 'FX_UNKNOWN_CURRENCY' });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('parses a fawazahmed0-shaped payload, filters non-ISO, writes cache', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          date: '2026-04-23',
          twd: {
            usd: 0.0317,
            jpy: 5.06,
            krw: 47,
            btc: 0.0000001, // crypto, must be filtered
            xyz: 999,        // unknown, must be filtered
          },
        }),
        { status: 200 },
      ),
    );

    const table = await fetchRates('TWD', {
      fetcher: fetcher as unknown as typeof fetch,
      storage,
      now: () => now,
    });

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher.mock.calls[0][0]).toContain('cdn.jsdelivr.net');
    expect(table.base).toBe('TWD');
    expect(table.date).toBe('2026-04-23');
    expect(table.rates.USD).toBeCloseTo(0.0317);
    expect(table.rates.JPY).toBeCloseTo(5.06);
    expect(table.rates.KRW).toBeCloseTo(47);
    expect(table.rates.TWD).toBe(1);
    expect(table.rates.BTC).toBeUndefined();
    expect(table.rates.XYZ).toBeUndefined();
    expect(storage.getItem('fx:TWD')).not.toBeNull();
  });

  it('returns cached rates within fresh threshold without hitting network', async () => {
    storage.setItem(
      'fx:TWD',
      JSON.stringify(makeTable({ fetchedAt: now - 60_000 })),
    );
    const fetcher = vi.fn();

    const table = await fetchRates('TWD', {
      fetcher: fetcher as unknown as typeof fetch,
      storage,
      now: () => now,
    });

    expect(fetcher).not.toHaveBeenCalled();
    expect(table.rates.JPY).toBeCloseTo(5.06);
    expect(table.stale).toBe(false);
  });

  it('falls back to mirror when primary CDN fails', async () => {
    const fetcher = vi
      .fn()
      .mockRejectedValueOnce(new Error('jsdelivr down'))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ date: '2026-04-23', twd: { usd: 0.0317 } }),
          { status: 200 },
        ),
      );

    const table = await fetchRates('TWD', {
      fetcher: fetcher as unknown as typeof fetch,
      storage,
      now: () => now,
    });

    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher.mock.calls[1][0]).toContain('pages.dev');
    expect(table.rates.USD).toBeCloseTo(0.0317);
  });

  it('returns stale cache marked stale when both endpoints fail', async () => {
    storage.setItem(
      'fx:TWD',
      JSON.stringify(makeTable({ fetchedAt: now - 24 * 60 * 60 * 1000 })),
    );
    const fetcher = vi.fn().mockRejectedValue(new Error('offline'));

    const table = await fetchRates('TWD', {
      fetcher: fetcher as unknown as typeof fetch,
      storage,
      now: () => now,
    });

    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(table.stale).toBe(true);
    expect(table.rates.USD).toBeCloseTo(0.0317);
  });

  it('throws FX_STALE when cache is too old and CDN is down', async () => {
    storage.setItem(
      'fx:TWD',
      JSON.stringify(makeTable({ fetchedAt: now - 30 * 24 * 60 * 60 * 1000 })),
    );
    const fetcher = vi.fn().mockRejectedValue(new Error('offline'));

    await expect(
      fetchRates('TWD', {
        fetcher: fetcher as unknown as typeof fetch,
        storage,
        now: () => now,
      }),
    ).rejects.toMatchObject({ code: 'FX_STALE' });
  });

  it('throws FX_NETWORK when CDN is down and no cache exists', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('offline'));

    await expect(
      fetchRates('TWD', {
        fetcher: fetcher as unknown as typeof fetch,
        storage,
        now: () => now,
      }),
    ).rejects.toMatchObject({ code: 'FX_NETWORK' });
  });
});

describe('convertAsync', () => {
  it('short-circuits same-currency without fetching', async () => {
    // No fetcher passed; if convertAsync tried to fetch from a real CDN this
    // would either succeed (slow) or fail (network), but never short-circuit.
    // Same-currency must not call fetch at all.
    const start = Date.now();
    const out = await convertAsync(42, 'TWD', 'twd');
    expect(out).toBe(42);
    expect(Date.now() - start).toBeLessThan(50);
  });
});

describe('defaultBaseForLocale', () => {
  it.each([
    ['zh-TW', 'TWD'],
    ['zh', 'TWD'],
    ['ja-JP', 'JPY'],
    ['ja', 'JPY'],
    ['ko-KR', 'KRW'],
    ['ko', 'KRW'],
    ['en-US', 'USD'],
    ['en', 'USD'],
    ['fr-FR', 'USD'],
  ])('%s -> %s', (locale, expected) => {
    expect(defaultBaseForLocale(locale)).toBe(expected);
  });
});
