import type { CartItem, Currency, HistoryEntry } from '../types';

export interface PriceTrend {
  /** Most recent past price for this product (in `currency`). */
  lastPrice: number;
  /** Average price across all past occurrences. */
  avgPrice: number;
  /** Timestamp of the most recent past occurrence. */
  lastSeenAt: number;
  /** Number of past trips where this product was bought. */
  occurrences: number;
  /** Currency of the historical prices (matches `currency` filter). */
  currency: Currency;
}

/**
 * Look up a product name across past trips and return aggregated price stats,
 * or `null` if there's no usable history.
 *
 * Match policy: case-insensitive substring on either direction (covers
 * "統一鮮乳 936ml" vs "統一鮮乳"). Items without a `unitPrice` are skipped.
 * Only entries in the same `currency` are aggregated.
 */
export function findPriceTrend(
  name: string,
  currency: Currency,
  entries: HistoryEntry[],
): PriceTrend | null {
  if (!normalize(name)) return null;

  const occurrences: { price: number; seenAt: number }[] = [];

  for (const entry of entries) {
    if (entry.cart.currency !== currency) continue;
    for (const item of entry.cart.items) {
      if (item.unitPrice == null || item.unitPrice <= 0) continue;
      if (!namesMatch(name, item.name)) continue;
      occurrences.push({
        price: item.unitPrice,
        seenAt: entry.cart.startedAt ?? entry.savedAt,
      });
    }
  }

  if (occurrences.length === 0) return null;

  // Sort by recency, newest first.
  occurrences.sort((a, b) => b.seenAt - a.seenAt);
  const lastPrice = occurrences[0].price;
  const lastSeenAt = occurrences[0].seenAt;
  const avgPrice =
    occurrences.reduce((sum, o) => sum + o.price, 0) / occurrences.length;

  return {
    lastPrice,
    avgPrice,
    lastSeenAt,
    occurrences: occurrences.length,
    currency,
  };
}

export function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Match if either name contains the other after normalization. Accepts both
 * directions so "統一鮮乳" (history) matches "統一鮮乳 936ml" (new) and vice
 * versa. Exported because the receipt-comparison page needs to map cart
 * items to LLM-returned matched/missing entries by name (no shared id).
 */
export function namesMatch(a: string, b: string): boolean {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  return na.includes(nb) || nb.includes(na);
}


export type PriceVerdict = 'hike' | 'drop' | 'flat';

export interface PriceComparison {
  trend: PriceTrend;
  /** Current vs lastPrice, signed (+ = more expensive than last time). */
  deltaPct: number;
  verdict: PriceVerdict;
}

const HIKE_THRESHOLD = 0.05; // 5%

/**
 * Compare a current item's unit price against its historical trend. Returns
 * `null` if the item has no price, no history, or no meaningful change.
 */
export function comparePrice(
  item: Pick<CartItem, 'name' | 'unitPrice' | 'currency'>,
  entries: HistoryEntry[],
): PriceComparison | null {
  if (item.unitPrice == null || item.unitPrice <= 0) return null;
  const trend = findPriceTrend(item.name, item.currency, entries);
  if (!trend) return null;

  const deltaPct = (item.unitPrice - trend.lastPrice) / trend.lastPrice;
  let verdict: PriceVerdict = 'flat';
  if (deltaPct > HIKE_THRESHOLD) verdict = 'hike';
  else if (deltaPct < -HIKE_THRESHOLD) verdict = 'drop';

  return { trend, deltaPct, verdict };
}
