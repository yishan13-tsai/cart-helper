import { getConfig, type VaultSageConfig } from './config';
import { VaultSageError } from './errors';

export interface HttpOptions {
  method?: 'GET' | 'POST';
  body?: BodyInit | null;
  headers?: Record<string, string>;
  timeoutMs?: number;
  /**
   * Override max retries. If unset, defaults differ by method:
   * - GET: 2 (so up to 3 attempts; idempotent)
   * - POST: 0 attempts of "blind" retry; we still retry on explicit
   *   429 / 5xx statuses (the server told us it's safe), but never on
   *   network errors (the request may have hit the server already).
   */
  retries?: number;
  fetcher?: typeof fetch;
  config?: VaultSageConfig;
  signal?: AbortSignal;
}

const DEFAULT_TIMEOUT_MS = 30_000;
const RETRY_BACKOFF_MS = 600;
const MAX_RETRY_AFTER_MS = 5_000;

export async function request(path: string, options: HttpOptions = {}): Promise<Response> {
  const config = options.config ?? getConfig();
  const fetcher = options.fetcher ?? fetch;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const method = options.method ?? 'GET';
  const isIdempotent = method === 'GET';
  const userRetries = options.retries;
  const networkRetries = userRetries ?? (isIdempotent ? 2 : 0);
  const url = path.startsWith('http') ? path : `${config.baseUrl}${path}`;
  // X-Api-Key is injected by the BFF proxy server-side, NOT here. Browser
  // bundle has no key. See server/index.js and vite.config.ts.
  const headers: Record<string, string> = { ...(options.headers ?? {}) };

  let lastError: unknown;
  let networkAttempts = 0;
  let serverRetryAttempts = 0;
  const MAX_SERVER_RETRIES = 2;

  while (true) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    if (options.signal) {
      if (options.signal.aborted) {
        clearTimeout(timer);
        controller.abort();
      } else {
        options.signal.addEventListener('abort', () => controller.abort(), { once: true });
      }
    }
    let res: Response | undefined;
    try {
      res = await fetcher(url, {
        method,
        body: options.body ?? null,
        headers,
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timer);
      const isAbort = (err as { name?: string }).name === 'AbortError';
      if (isAbort && options.signal?.aborted) throw err;
      if (isAbort) {
        lastError = new VaultSageError('VS_TIMEOUT', `request to ${path} timed out after ${timeoutMs}ms`);
        if (networkAttempts >= networkRetries) throw lastError;
        networkAttempts += 1;
        await sleep(RETRY_BACKOFF_MS * networkAttempts);
        continue;
      }
      lastError = new VaultSageError('VS_NETWORK', `network error calling ${path}: ${(err as Error).message}`);
      if (networkAttempts >= networkRetries) throw lastError;
      networkAttempts += 1;
      await sleep(RETRY_BACKOFF_MS * networkAttempts);
      continue;
    }
    clearTimeout(timer);

    if ((res.status === 429 || res.status >= 500) && serverRetryAttempts < MAX_SERVER_RETRIES) {
      const code = res.status === 429 ? 'VS_HTTP_4XX' : 'VS_HTTP_5XX';
      lastError = new VaultSageError(code, `HTTP ${res.status}`, { status: res.status });
      const wait = res.status === 429
        ? parseRetryAfterMs(res.headers.get('retry-after')) ?? RETRY_BACKOFF_MS * (serverRetryAttempts + 1)
        : RETRY_BACKOFF_MS * (serverRetryAttempts + 1);
      serverRetryAttempts += 1;
      await sleep(wait);
      continue;
    }

    if (!res.ok) {
      const detail = await safeReadJson(res);
      const code = res.status >= 500 ? 'VS_HTTP_5XX' : 'VS_HTTP_4XX';
      throw new VaultSageError(code, `HTTP ${res.status} ${res.statusText}`, {
        status: res.status,
        detail,
      });
    }
    return res;
  }
}

function parseRetryAfterMs(header: string | null): number | null {
  if (!header) return null;
  const seconds = Number(header);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.min(seconds * 1000, MAX_RETRY_AFTER_MS);
  }
  const date = Date.parse(header);
  if (!Number.isNaN(date)) {
    return Math.min(Math.max(0, date - Date.now()), MAX_RETRY_AFTER_MS);
  }
  return null;
}

async function safeReadJson(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
