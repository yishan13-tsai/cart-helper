import { compareReceipt as realCompareReceipt, VaultSageError } from './vaultsage';
import type { CompareResult } from './vaultsage';
import type { CartItem } from '../types';
import { getConfig } from './vaultsage/config';

export type ComparatorLocale = { code: string; name: string; currency: CartItem['currency'] };
export type Comparator = (
  blob: Blob,
  cart: CartItem[],
  locale: ComparatorLocale,
  cartId: string,
) => Promise<CompareResult>;

declare global {
  interface Window {
    __MOCK_COMPARE__?: Comparator;
  }
}

export async function runCompare(
  blob: Blob,
  cart: CartItem[],
  locale: ComparatorLocale,
  cartId: string,
): Promise<CompareResult> {
  if (typeof window !== 'undefined' && typeof window.__MOCK_COMPARE__ === 'function') {
    return window.__MOCK_COMPARE__(blob, cart, locale, cartId);
  }
  if (!getConfig().apiKey) {
    return mockComparator(blob, cart, locale, cartId);
  }
  try {
    return await realCompareReceipt(blob, cart, locale, cartId);
  } catch (err) {
    if (err instanceof VaultSageError) {
      console.error('[compare] VaultSage error:', err.code, err.message, err);
      const tagged = new Error(err.code) as Error & { code: string; cause?: unknown };
      tagged.code = err.code;
      tagged.cause = err;
      throw tagged;
    }
    console.error('[compare] unexpected error:', err);
    throw err;
  }
}

const mockComparator: Comparator = async (_blob, cart, locale, cartId) => {
  await new Promise((r) => setTimeout(r, 800));
  const totalInCart = cart.reduce(
    (sum, item) => sum + (item.unitPrice ?? 0) * item.quantity,
    0,
  );
  const totalOnReceipt = totalInCart + 36;
  return {
    cartId,
    receipt: { fileId: 'mock-file', capturedAt: Date.now(), totalOnReceipt },
    matched: cart.slice(0, Math.max(0, cart.length - 1)).map((it, i) => ({
      ...it,
      id: `m-${i}`,
    })),
    missingFromReceipt: cart.slice(-1).map((it, i) => ({ ...it, id: `mi-${i}` })),
    extraOnReceipt: [
      {
        id: 'e-0',
        name: locale.code === 'zh-TW' ? '袋子' : 'Bag',
        unitPrice: 3,
        quantity: 1,
        currency: locale.currency,
        createdAt: Date.now(),
      },
    ],
    totalInCart,
    totalOnReceipt,
    difference: totalOnReceipt - totalInCart,
    raw: {
      matched: [],
      missing_from_receipt: [],
      extra_on_receipt: [],
      total_in_cart: totalInCart,
      total_on_receipt: totalOnReceipt,
      difference: totalOnReceipt - totalInCart,
    },
  };
};
