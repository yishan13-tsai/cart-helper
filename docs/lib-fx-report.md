# `src/lib/fx/` — implementation report

Owner: api-integration. Status: complete (Task #6).

Provider research and the rejected alternatives are documented in
[`fx-research.md`](./fx-research.md). This report covers what shipped.

## Module map

| File | Role |
|---|---|
| `types.ts` | `IsoCurrency`, `RateTable`, `FxError` + 4 `FX_*` codes. |
| `iso.ts` | `ISO_4217` whitelist (155 codes), `isIsoCurrency`, `normalizeCurrency`. |
| `client.ts` | `fetchRates(base)` with dual-CDN fallback, `defaultBaseForLocale`. |
| `convert.ts` | `convert(amount, from, to, table)` (sync) + `convertAsync(...)` (one-shot). |
| `index.ts` | Public barrel. |
| `fx.test.ts` | 24 unit tests (vitest). |

## Key decisions

### 1. Provider: fawazahmed0 currency-api on jsDelivr (NOT frankfurter)

Frankfurter does not list TWD (only the 30 currencies the ECB publishes
against the euro). For a zh-TW first product whose default base is NTD, that
is a deal-breaker. fawazahmed0's dataset covers ~155 ISO-4217 codes
including TWD plus every exotic currency the OCR has produced so far
(COP, VND, BGN). See `fx-research.md` for the full comparison matrix.

### 2. Dual-CDN of the same dataset, not multi-vendor

Primary: `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/{base}.json`
Fallback: `https://latest.currency-api.pages.dev/v1/currencies/{base}.json`

Both serve the **identical** dataset maintained by the same upstream, so
there is no rate reconciliation between providers. A second vendor (e.g.,
`open.er-api.com`) was considered and rejected because the operational
cost (parsing two response shapes, handling two coverage gaps) outweighed
the benefit for a single-day demo.

### 3. ISO-4217 whitelist excludes crypto

The upstream dataset includes `btc`, `eth`, `xrp`, etc. The whitelist in
`iso.ts` filters anything not in the published ISO-4217 list before exposing
it to callers. The whitelist is broader than the spec's 20-currency starter
list (TWD/USD/JPY/KRW/EUR/GBP/CNY/HKD/SGD/AUD/CAD/VND/THB/MYR/IDR/PHP/INR/
BGN/COP) — those 19 are all included, plus the rest, so demo can handle any
ISO currency the OCR returns without an ad-hoc patch.

### 4. Cache strategy

- **In-memory: none.** Each `fetchRates(base)` call re-reads from the
  injectable `Storage` (defaults to `localStorage`). React-side memoization
  is the caller's job — keeps this module pure.
- **Persistence key: `fx:<BASE>`.** One slot per base (upper-case ISO code).
  The day stamp lives **inside** the cached value (`date` field), not in the
  key. Spec proposed `fx:rates:YYYY-MM-DD`, but that requires scanning all
  keys to find "the latest cache for base X" — fragile and slow. With
  `fx:<BASE>` the cache is read in O(1) and the staleness check uses the
  embedded `fetchedAt` timestamp.
- **Fresh threshold: 6 hours.** Upstream updates daily around 00:00 UTC, so
  6 h gives two refresh chances per day without hammering the CDN.
- **Stale ceiling: 7 days.** If both CDNs are unreachable AND the cache is
  older than 7 days, throw `FX_STALE` rather than show suspiciously old
  rates. Within 7 days, fall back to cache and mark `stale: true` so the UI
  can show a "rates as of ..." badge.
- **Unwritable storage** (Safari private mode, quota exceeded) is silently
  tolerated — fetched table is still returned in-memory.

### 5. Conversion via base pivot

`convert(amount, from, to, table)` short-circuits for same-currency, and
otherwise does:

| Case | Formula |
|---|---|
| `from === table.base` | `amount * table.rates[to]` |
| `to === table.base` | `amount / table.rates[from]` |
| both ≠ `table.base` | `(amount / table.rates[from]) * table.rates[to]` |

Asynchronous one-shot `convertAsync(amount, from, to)` is provided for
callers that don't want to manage a `RateTable` themselves; it fetches
`from` as the base.

### 6. Locale → base currency

`defaultBaseForLocale(locale)`:

- `zh*` → `TWD`
- `ja*` → `JPY`
- `ko*` → `KRW`
- everything else → `USD`

Matches the i18n module's `LOCALE_CURRENCY` table (kept identical, but
intentionally duplicated to avoid coupling fx to i18n internals).

## Validation

| Check | Result |
|---|---|
| `pnpm typecheck` | ✅ |
| `pnpm test` | ✅ 24/24 fx tests |
| Live CDN probe (real network, real rates) | ✅ jsDelivr 280 ms cold from Taipei, 155 currencies after filter, BTC absent, conversions match expected math |

Test coverage:

- `convert`: same-currency no-op, from-base, to-base, pivot, error on
  non-finite amount, error on unknown source/target.
- `fetchRates`: rejects unknown base before any fetch, parses
  fawazahmed0 payload, filters non-ISO + crypto, writes cache.
- Cache: returns cached within fresh threshold without hitting network,
  falls back to mirror on primary failure, returns marked-stale cache when
  both endpoints fail, throws `FX_STALE` when cache is too old, throws
  `FX_NETWORK` when no cache exists.
- `convertAsync`: same-currency short-circuit (proves no fetch happens).
- `defaultBaseForLocale`: 9 locale → currency mappings, including the
  `zh-TW` / `zh` / `zh-CN` umbrella.

## Known limitations

1. **Rate freshness is upstream-bound.** The dataset rebuilds daily; we have
   no intra-day movement. For shopping use cases (cart totals, receipt
   reconciliation) this is fine; for trading it would not be.
2. **`@latest` jsDelivr resolution** can pick up a breaking schema change
   from the upstream. Pinning to `@2026.4` (or whatever the latest
   "year.month" tag is on demo day) before submission is recommended.
3. **No telemetry.** A jsDelivr-fail / mirror-success doesn't get reported
   anywhere. We don't have a metrics pipeline; for hackathon scope this is
   acceptable.
4. **Cache is per-tab.** `localStorage` is shared across tabs, so two tabs
   open at once will see consistent rates, but in-memory state is not
   shared — both will re-read from `localStorage` independently. This is
   fine for a PWA but worth noting.

## Public surface (`index.ts`)

```ts
fetchRates(base: IsoCurrency, opts?): Promise<RateTable>
defaultBaseForLocale(locale: string): IsoCurrency
convert(amount, from, to, table): number
convertAsync(amount, from, to): Promise<number>
isIsoCurrency(code): boolean
normalizeCurrency(code): IsoCurrency

FxError, FxErrorCode
IsoCurrency, RateTable
```
