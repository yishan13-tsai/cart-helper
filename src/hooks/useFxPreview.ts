import { useEffect, useState } from 'react';
import { convert, fetchRates, FxError, normalizeCurrency } from '../lib/fx';
import type { IsoCurrency, RateTable } from '../lib/fx';

export interface FxPreview {
  amount: number | null;
  stale: boolean;
  loading: boolean;
  error: string | null;
}

const INITIAL: FxPreview = {
  amount: null,
  stale: false,
  loading: false,
  error: null,
};

export function useFxPreview(
  amount: number,
  from: IsoCurrency,
  to: IsoCurrency,
): FxPreview {
  const [state, setState] = useState<FxPreview>(INITIAL);
  const f = normalizeCurrency(from);
  const t = normalizeCurrency(to);

  useEffect(() => {
    if (f === t) {
      setState(INITIAL);
      return;
    }
    if (!Number.isFinite(amount)) {
      setState({ ...INITIAL, error: 'amount-invalid' });
      return;
    }
    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    fetchRates(f)
      .then((table: RateTable) => {
        if (cancelled) return;
        try {
          const converted = convert(amount, f, t, table);
          setState({
            amount: converted,
            stale: table.stale,
            loading: false,
            error: null,
          });
        } catch (err) {
          setState({
            amount: null,
            stale: false,
            loading: false,
            error: err instanceof FxError ? err.code : 'convert-failed',
          });
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setState({
          amount: null,
          stale: false,
          loading: false,
          error: err instanceof FxError ? err.code : 'fetch-failed',
        });
      });

    return () => {
      cancelled = true;
    };
  }, [amount, f, t]);

  return state;
}
