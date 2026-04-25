import type { Currency } from '../types';

const CURRENCY_SYMBOL: Record<Currency, string> = {
  TWD: 'NT$',
  USD: '$',
  JPY: '¥',
  KRW: '₩',
};

export function currencySymbol(code: Currency): string {
  return CURRENCY_SYMBOL[code] ?? code;
}

export function formatAmount(amount: number, locale: string): string {
  try {
    return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(amount);
  } catch {
    return String(Math.round(amount));
  }
}
