import { fetchRates } from './client';
import { normalizeCurrency } from './iso';
import { FxError, type IsoCurrency, type RateTable } from './types';

export function convert(
  amount: number,
  from: IsoCurrency,
  to: IsoCurrency,
  table: RateTable,
): number {
  if (!Number.isFinite(amount)) {
    throw new FxError('FX_INVALID_RESPONSE', `amount is not finite: ${amount}`);
  }
  const f = normalizeCurrency(from);
  const t = normalizeCurrency(to);
  if (f === t) return amount;

  if (table.base === f) {
    const rate = table.rates[t];
    if (rate == null) throw new FxError('FX_UNKNOWN_CURRENCY', `target not in table: ${t}`);
    return amount * rate;
  }

  if (table.base === t) {
    const rate = table.rates[f];
    if (rate == null) throw new FxError('FX_UNKNOWN_CURRENCY', `source not in table: ${f}`);
    return amount / rate;
  }

  const fromRate = table.rates[f];
  const toRate = table.rates[t];
  if (fromRate == null) throw new FxError('FX_UNKNOWN_CURRENCY', `source not in table: ${f}`);
  if (toRate == null) throw new FxError('FX_UNKNOWN_CURRENCY', `target not in table: ${t}`);
  return (amount / fromRate) * toRate;
}

export async function convertAsync(
  amount: number,
  from: IsoCurrency,
  to: IsoCurrency,
): Promise<number> {
  const f = normalizeCurrency(from);
  if (f === normalizeCurrency(to)) return amount;
  const table = await fetchRates(f);
  return convert(amount, f, to, table);
}
