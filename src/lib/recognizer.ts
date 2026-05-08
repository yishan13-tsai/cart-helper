import type { CartItem, Currency } from '../types';
import { recognizeProducts, VaultSageError } from './vaultsage';
import type { OcrLocaleHint } from './vaultsage';

export type Recognizer = (blob: Blob, locale: string) => Promise<CartItem[]>;

declare global {
  interface Window {
    __MOCK_RECOGNIZE__?: Recognizer;
  }
}

function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export const mockRecognizer: Recognizer = async () => {
  await new Promise((r) => setTimeout(r, 400));
  const now = Date.now();
  return [
    {
      id: uuid(),
      name: '測試商品 1',
      unitPrice: 89,
      quantity: 1,
      currency: 'TWD',
      createdAt: now,
      confidence: 0.92,
    },
    {
      id: uuid(),
      name: '測試商品 2',
      unitPrice: 35,
      quantity: 2,
      currency: 'TWD',
      createdAt: now,
      confidence: 0.55,
    },
  ];
};

export const realRecognizer: Recognizer = async (blob, locale) => {
  const hint = buildLocaleHint(locale);
  try {
    const out = await recognizeProducts(blob, hint);
    const now = Date.now();
    return out.items.map((item) => ({
      id: uuid(),
      name: item.name,
      unitPrice: item.unitPrice,
      originalUnitPrice: item.unitPrice,
      quantity: item.quantity,
      currency: item.currency,
      sourceFileId: item.sourceFileId,
      confidence: item.confidence,
      promotion: item.promotion,
      createdAt: now,
    }));
  } catch (err) {
    if (err instanceof VaultSageError) {
      console.error('[recognizer] VaultSage error:', err.code, err.message, err);
      const tagged = new Error(err.code) as Error & { code: string; cause?: unknown };
      tagged.code = err.code;
      tagged.cause = err;
      throw tagged;
    }
    console.error('[recognizer] unexpected error:', err);
    throw err;
  }
};

export function resolveRecognizer(): Recognizer {
  if (typeof window !== 'undefined') {
    const injected = (window as unknown as { __MOCK_RECOGNIZE__?: unknown })
      .__MOCK_RECOGNIZE__;
    if (typeof injected === 'function') {
      return injected as Recognizer;
    }
  }
  return realRecognizer;
}

const LOCALE_NAMES: Record<string, string> = {
  'zh-TW': 'Traditional Chinese (zh-TW)',
  en: 'English (en)',
  ko: 'Korean (ko)',
  ja: 'Japanese (ja)',
};

const LOCALE_CURRENCIES: Record<string, Currency> = {
  'zh-TW': 'TWD',
  en: 'USD',
  ko: 'KRW',
  ja: 'JPY',
};

function buildLocaleHint(locale: string): OcrLocaleHint {
  const code = normalizeLocale(locale);
  return {
    code,
    name: LOCALE_NAMES[code] ?? `Locale ${code}`,
    currency: LOCALE_CURRENCIES[code] ?? 'TWD',
  };
}

function normalizeLocale(raw: string): string {
  if (raw in LOCALE_NAMES) return raw;
  const base = raw.split('-')[0]?.toLowerCase();
  if (base === 'zh') return 'zh-TW';
  if (base === 'en') return 'en';
  if (base === 'ko') return 'ko';
  if (base === 'ja') return 'ja';
  return 'zh-TW';
}
