import { useEffect, useState } from 'react';
import { fetchRates, convert, normalizeCurrency } from '../lib/fx';
import type { IsoCurrency } from '../lib/fx';

export const TRAVEL_CURRENCIES: IsoCurrency[] = ['TWD', 'USD', 'JPY', 'KRW'];

export interface FxAllResult {
  amounts: Record<IsoCurrency, number | null>;
  loading: boolean;
  stale: boolean;
}

export function useFxAll(amount: number, from: IsoCurrency): FxAllResult {
  const base = normalizeCurrency(from);
  const targets = TRAVEL_CURRENCIES.filter((c) => c !== base);

  const [result, setResult] = useState<FxAllResult>({
    amounts: Object.fromEntries(targets.map((t) => [t, null])),
    loading: false,
    stale: false,
  });

  useEffect(() => {
    if (!Number.isFinite(amount) || amount <= 0) return;
    let cancelled = false;

    setResult((prev) => ({ ...prev, loading: true }));
    fetchRates(base)
      .then((table) => {
        if (cancelled) return;
        const amounts: Record<string, number | null> = {};
        for (const target of targets) {
          try { amounts[target] = convert(amount, base, target, table); }
          catch { amounts[target] = null; }
        }
        setResult({ amounts, loading: false, stale: table.stale });
      })
      .catch(() => {
        if (cancelled) return;
        setResult({
          amounts: Object.fromEntries(targets.map((t) => [t, null])),
          loading: false,
          stale: false,
        });
      });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, base]);

  return result;
}
