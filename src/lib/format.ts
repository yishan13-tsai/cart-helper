import type { Currency } from '../types';

const CURRENCY_SYMBOL: Record<Currency, string> = {
  TWD: 'NT$',
  USD: '$',
  JPY: '¥',
  KRW: '₩',
};

export function currencySymbol(code: Currency | string): string {
  return CURRENCY_SYMBOL[code as Currency] ?? code;
}

export function formatAmount(amount: number, locale: string): string {
  try {
    return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(amount);
  } catch {
    return String(Math.round(amount));
  }
}

export function formatNumber(amount: number, locale: string, fractionDigits = 0): string {
  try {
    return new Intl.NumberFormat(locale, {
      maximumFractionDigits: fractionDigits,
      minimumFractionDigits: fractionDigits,
    }).format(amount);
  } catch {
    return amount.toFixed(fractionDigits);
  }
}
