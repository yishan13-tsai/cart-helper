import { useMemo } from 'react';
import { useHistoryStore } from '../store/history';
import { comparePrice, type PriceComparison } from '../lib/priceHistory';
import type { CartItem } from '../types';

/**
 * Compare a cart item's current price against the user's history. Returns
 * `null` when there's no useful trend (no history, no price, or change is
 * within ±5%). Memoised on `(item.name, item.unitPrice, item.currency)` so
 * we don't re-scan history on unrelated re-renders.
 */
export function usePriceTrend(
  item: Pick<CartItem, 'name' | 'unitPrice' | 'currency'>,
): PriceComparison | null {
  const entries = useHistoryStore((s) => s.entries);
  return useMemo(
    () => comparePrice(item, entries),
    // Recompute when the item's price/name/currency changes, or when history
    // length changes (treat as a coarse "history dirty" signal — adequate for
    // hackathon scope; entries are append-only so length monotonic = enough).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [item.name, item.unitPrice, item.currency, entries.length],
  );
}
