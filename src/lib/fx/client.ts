import { isIsoCurrency, normalizeCurrency } from './iso';
import { FxError, type IsoCurrency, type RateTable } from './types';

const PRIMARY = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies';
const FALLBACK = 'https://latest.currency-api.pages.dev/v1/currencies';

const FRESH_THRESHOLD_MS = 6 * 60 * 60 * 1000;
const STALE_LIMIT_MS = 7 * 24 * 60 * 60 * 1000;
const FETCH_TIMEOUT_MS = 6_000;

interface CdnPayload {
  date: string;
  [base: string]: string | Record<string, number>;
}

interface FetchOptions {
  fetcher?: typeof fetch;
  storage?: Storage | null;
  now?: () => number;
}

export async function fetchRates(
  base: IsoCurrency,
  options: FetchOptions = {},
): Promise<RateTable> {
  const upper = normalizeCurrency(base);
  if (!isIsoCurrency(upper)) {
    throw new FxError('FX_UNKNOWN_CURRENCY', `unknown base currency: ${base}`);
  }
  const fetcher = options.fetcher ?? fetch;
  const storage = options.storage === undefined ? globalStorage() : options.storage;
  const now = options.now ?? Date.now;

  const cached = storage ? readCache(storage, upper) : null;
  if (cached && now() - cached.fetchedAt < FRESH_THRESHOLD_MS) {
    return cached;
  }

  try {
    const fresh = await fetchFromCdn(upper, fetcher, now);
    if (storage) writeCache(storage, fresh);
    return fresh;
  } catch (err) {
    if (cached) {
      const ageMs = now() - cached.fetchedAt;
      if (ageMs > STALE_LIMIT_MS) {
        throw new FxError(
          'FX_STALE',
          `cached rates for ${upper} are older than ${STALE_LIMIT_MS}ms and CDN is unreachable`,
        );
      }
      return { ...cached, stale: true };
    }
    if (err instanceof FxError) throw err;
    throw new FxError('FX_NETWORK', `failed to fetch rates for ${upper}: ${(err as Error).message}`);
  }
}

async function fetchFromCdn(
  base: IsoCurrency,
  fetcher: typeof fetch,
  now: () => number,
): Promise<RateTable> {
  const lower = base.toLowerCase();
  const urls = [`${PRIMARY}/${lower}.json`, `${FALLBACK}/${lower}.json`];
  let lastError: unknown;

  for (const url of urls) {
    try {
      return await fetchOne(url, base, fetcher, now);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError ?? new Error('no FX endpoint reachable');
}

async function fetchOne(
  url: string,
  base: IsoCurrency,
  fetcher: typeof fetch,
  now: () => number,
): Promise<RateTable> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetcher(url, { signal: controller.signal });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const payload = (await res.json()) as CdnPayload;
    return parsePayload(payload, base, now());
  } finally {
    clearTimeout(timeout);
  }
}

function parsePayload(payload: CdnPayload, base: IsoCurrency, fetchedAt: number): RateTable {
  const lower = base.toLowerCase();
  const raw = payload[lower];
  if (!raw || typeof raw !== 'object' || typeof payload.date !== 'string') {
    throw new FxError('FX_INVALID_RESPONSE', `unexpected payload shape for ${base}`);
  }
  const rates: Record<IsoCurrency, number> = {};
  for (const [code, value] of Object.entries(raw)) {
    if (typeof value !== 'number' || !Number.isFinite(value)) continue;
    const upper = code.toUpperCase();
    if (!isIsoCurrency(upper)) continue;
    rates[upper] = value;
  }
  rates[base] = 1;
  return { base, date: payload.date, rates, fetchedAt, stale: false };
}

function readCache(storage: Storage, base: IsoCurrency): RateTable | null {
  try {
    const raw = storage.getItem(cacheKey(base));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RateTable;
    if (parsed.base !== base || typeof parsed.date !== 'string' || !parsed.rates) return null;
    return { ...parsed, stale: false };
  } catch {
    return null;
  }
}

function writeCache(storage: Storage, table: RateTable): void {
  try {
    storage.setItem(cacheKey(table.base), JSON.stringify({ ...table, stale: false }));
  } catch {
    // quota / private mode — ignore, in-memory result is still returned
  }
}

function cacheKey(base: IsoCurrency): string {
  return `fx:${base}`;
}

function globalStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function defaultBaseForLocale(locale: string): IsoCurrency {
  const tag = locale.toLowerCase();
  if (tag.startsWith('zh')) return 'TWD';
  if (tag.startsWith('ja')) return 'JPY';
  if (tag.startsWith('ko')) return 'KRW';
  return 'USD';
}
