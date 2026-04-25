# FX API research

## tl;dr

Use **fawazahmed0 currency-api** (jsDelivr CDN primary, Cloudflare Pages
fallback) for foreign-exchange conversion. No API key, CORS `*`, sub-100 ms
from Asia edge, supports every ISO-4217 currency we have seen the VaultSage
OCR return (TWD / USD / JPY / KRW / COP / VND / BGN and ~200 more).

Do NOT use:

- **frankfurter.app / frankfurter.dev** — ECB data, **does not list TWD** at all
  (not in `/v1/currencies`). Since our default locale is zh-TW and the cart UI
  pivots around NTD, this kills it as primary. Also note: `api.frankfurter.app`
  now 301-redirects to `frankfurter.dev` and the path prefix changed to `/v1/`,
  which several tutorials still miss.
- **exchangerate.host** — previously free, **now requires `access_key`**
  (returns `{"code":101,"type":"missing_access_key"}` for unauthed requests
  as of 2026-04). Removes it from the "no-signup" shortlist.

## Empirical probe (2026-04-24, from Taipei)

Probed all four candidates for TWD base + CORS headers + key requirement:

| API | TWD base | CORS | Needs key | Update cadence | Edge cache |
|---|---|---|---|---|---|
| `api.frankfurter.dev/v1/latest?from=TWD` | ✗ 404 (no TWD) | ✓ | no | ECB daily ~16:00 CET | Cloudflare |
| `api.exchangerate.host/latest?base=TWD` | (blocked) | ✓ | **yes** | daily | Cloudflare |
| `open.er-api.com/v6/latest/TWD` | ✓ | ✓ `*` | no | daily (cron `time_last_update_utc` ~00:00 UTC) | Cloudflare (`cache-control: public, max-age=3600`) |
| `cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/twd.json` | ✓ | ✓ `*` | no | daily (GitHub-driven) | jsDelivr (`max-age=604800`, `s-maxage=43200`) |

Sample rates (TWD base) cross-checked for sanity — all within 0.3 %:

| To | open.er-api.com | fawazahmed0 |
|---|---|---|
| USD | 0.031669 | 0.031707 |
| JPY | 5.058771 | 5.057803 |
| KRW | 46.942418 | 47.038714 |

Exotic currencies (required because OCR sometimes guesses foreign tags from
labels):

| Currency | fawazahmed0 TWD rate |
|---|---|
| COP (Colombian Peso) | 0.00884 |
| VND (Vietnamese Dong) | 0.00120 |
| BGN (Bulgarian Lev) | 18.90 |

## Decision

**Primary**: `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/{base}.json`

**Fallback**: `https://latest.currency-api.pages.dev/v1/currencies/{base}.json`
(same dataset, Cloudflare Pages mirror maintained by the same author).

Why two URLs of the same dataset instead of two different vendors:

- The data is identical, so no rate reconciliation needed.
- A second vendor (e.g., open.er-api.com) would mean mapping two different
  JSON shapes and handling two coverage gaps, for a failure mode (jsDelivr
  global outage) that already activates every other npm-using site.
- open.er-api.com stays as a `// future` comment if we ever need provider
  diversity.

### Response shape (fawazahmed0)

```json
{
  "date": "2026-04-23",
  "twd": {
    "usd": 0.031707174,
    "jpy": 5.05780265,
    "krw": 47.03871351,
    "cop": 113.11,
    "...": "~200 more, lowercase ISO 4217"
  }
}
```

Notes for the client:

- The outer key matches the base currency in **lowercase** — always lowercase
  paths + lowercase lookups.
- `date` is ISO `YYYY-MM-DD` (UTC), updated once per day around 00:00 UTC.
- Rates are expressed as "1 unit of base = N units of target".
- The dataset also contains a handful of crypto tickers (`btc`, `eth`, …).
  Our client MUST ignore anything not in a whitelist of ISO-4217 codes to
  avoid feeding bogus tickers into the cart UI.

## Proposed client interface (`src/lib/fx/`)

```ts
// src/lib/fx/types.ts
export type IsoCurrency = string; // "TWD" | "USD" | ... validated at boundary
export interface RateTable {
  base: IsoCurrency;        // upper-case
  date: string;             // "2026-04-23"
  rates: Record<IsoCurrency, number>; // upper-case keys
  fetchedAt: number;        // Date.now() when we got it
}

// src/lib/fx/client.ts
export async function fetchRates(base: IsoCurrency): Promise<RateTable>;
// Tries primary CDN, falls back to mirror on network error / 5xx / invalid JSON.
// Throws FxError with stable code on total failure.

// src/lib/fx/convert.ts
export function convert(
  amount: number,
  from: IsoCurrency,
  to: IsoCurrency,
  table: RateTable,
): number;
// Uses table.base as pivot when `from !== table.base`. Validated to currencies
// listed in table.rates; unknown codes throw FxError("UNKNOWN_CURRENCY").
```

### Caching / persistence

- In-memory LRU of `{base -> RateTable}`, keyed by upper-case base.
- Persist last successful table per base to `localStorage`
  (`fx:<base>` → `RateTable` JSON) so we can show last-known rates offline.
- Fresh-fetch threshold: 6 hours. The upstream updates daily, so sub-daily
  refresh is wasted bandwidth; 6h gives us two chances per day to pick up
  the new data without hammering the CDN.
- On fetch failure, degrade to stale-cache with a `stale: true` flag on the
  returned table; UI can show a subtle "rates as of YYYY-MM-DD" label.

### Error codes (for frontend i18n mapping)

- `FX_NETWORK` — both CDNs unreachable, no cached table.
- `FX_STALE` — using cached table older than 7 days (warn the user).
- `FX_UNKNOWN_CURRENCY` — code not present in the rate table (rare;
  OCR likely hallucinated a currency).

### Risks / follow-ups

1. jsDelivr occasionally returns 403 from very cold regions; fallback handles
   it, but we should surface the event in telemetry if we ever add any.
2. `@latest` resolves through npm every request on jsDelivr; consider pinning
   `@2026.4` once the library picks a stable release channel, to avoid a
   breaking upstream schema change in the middle of demo day.
3. The dataset includes crypto; the client MUST filter to an ISO-4217
   whitelist before exposing codes to the UI.
4. All rates are "per base unit". If OCR returns `currency: "COP"` while the
   user is in zh-TW (base TWD), we need `fetchRates("COP")` and then
   `rates["TWD"]`, not the TWD table. Document this in the client JSDoc.

## Next steps

- Implement `src/lib/fx/` per the interface above (separate task, after
  Vite scaffold is confirmed).
- Add a `scripts/fx-smoke.ts` analogous to `scripts/smoke-test.ts` for a
  live sanity check before demo day.
