/**
 * Promotion parser. Takes a verbatim OCR-captured promotion label
 * (e.g. "第二件 6 折") plus the item's unitPrice and quantity, and computes
 * the total $ savings.
 *
 * Pure regex — no LLM. Cheap to call on every render. Returns null when the
 * label doesn't match any supported pattern, so the UI falls back to a
 * "reference only" state.
 *
 * Patterns supported (zh-TW, both Chinese numerals and Arabic digits):
 *   - 加一元多一件        → +$1 for an extra unit
 *   - 買N送M               → every (N+M) items, pay only for N
 *   - 第N件半價             → every Nth item at 50%
 *   - 第N件X折              → every Nth item at X/10 of price (X in 1–9, decimal allowed)
 *   - N件X / N件X元         → bundle: N items for flat $X (only when actually cheaper)
 */

const ZH_NUMS: Record<string, number> = {
  一: 1, 兩: 2, 二: 2, 三: 3, 四: 4, 五: 5,
  六: 6, 七: 7, 八: 8, 九: 9, 十: 10,
};

function parseNum(raw: string): number | null {
  const trimmed = raw.trim();
  if (/^\d+$/.test(trimmed)) return Number(trimmed);
  return ZH_NUMS[trimmed] ?? null;
}

function parseZhe(raw: string): number | null {
  if (/^\d+(?:\.\d+)?$/.test(raw)) {
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }
  return ZH_NUMS[raw] ?? null;
}

export type PromotionPattern =
  | 'nth-discount'
  | 'bundle-flat'
  | 'buy-n-get-m'
  | 'plus-one-yuan';

export interface PromotionApplied {
  pattern: PromotionPattern;
  /** Total $ savings across the line at the current quantity. */
  discount: number;
}

export function parsePromotion(
  raw: string | undefined | null,
  unitPrice: number | null,
  quantity: number,
): PromotionApplied | null {
  if (!raw || unitPrice == null || !Number.isFinite(unitPrice) || unitPrice <= 0) return null;
  if (!Number.isFinite(quantity) || quantity <= 0) return null;

  const text = raw.replace(/\s+/g, '');

  // 加一元多一件 — paired item costs $1 instead of full price
  if (/加[一1]元?(?:多|再)[一1]件/.test(text)) {
    const groups = Math.floor(quantity / 2);
    if (groups <= 0) return null;
    return {
      pattern: 'plus-one-yuan',
      discount: round2(groups * Math.max(0, unitPrice - 1)),
    };
  }

  // 買N送M
  const buyGet = text.match(/買([一二三四五六七八九十兩\d]+)送([一二三四五六七八九十兩\d]+)/);
  if (buyGet) {
    const n = parseNum(buyGet[1]);
    const m = parseNum(buyGet[2]);
    if (n != null && m != null && n > 0 && m > 0) {
      const groupSize = n + m;
      const groups = Math.floor(quantity / groupSize);
      if (groups <= 0) return null;
      return {
        pattern: 'buy-n-get-m',
        discount: round2(groups * m * unitPrice),
      };
    }
  }

  // 第N件半價 (synonym for 5折)
  const nHalf = text.match(/第([一二三四五六七八九十兩\d]+)件半價/);
  if (nHalf) {
    const n = parseNum(nHalf[1]);
    if (n != null && n >= 2) {
      const groups = Math.floor(quantity / n);
      if (groups <= 0) return null;
      return {
        pattern: 'nth-discount',
        discount: round2(groups * unitPrice * 0.5),
      };
    }
  }

  // 第N件 X 折
  const nDiscount = text.match(/第([一二三四五六七八九十兩\d]+)件(\d+(?:\.\d+)?|[一二三四五六七八九])折/);
  if (nDiscount) {
    const n = parseNum(nDiscount[1]);
    const zhe = parseZhe(nDiscount[2]);
    if (n != null && n >= 2 && zhe != null && zhe > 0 && zhe < 10) {
      const groups = Math.floor(quantity / n);
      if (groups <= 0) return null;
      return {
        pattern: 'nth-discount',
        discount: round2(groups * unitPrice * (1 - zhe / 10)),
      };
    }
  }

  // N件 X — bundle flat. Lookbehind `(?<!第)` keeps us from misreading
  // 第二件99 as a bundle (which it isn't — that wording doesn't really exist
  // but the lookbehind is cheap insurance).
  const bundle = text.match(/(?<!第)([一二三四五六七八九十兩\d]+)件(\d+)元?/);
  if (bundle) {
    const n = parseNum(bundle[1]);
    const flatPrice = Number(bundle[2]);
    if (n != null && n >= 2 && Number.isFinite(flatPrice) && flatPrice > 0) {
      const fullPriceForN = n * unitPrice;
      // Skip if the "deal" isn't actually cheaper than paying unit price.
      if (flatPrice < fullPriceForN) {
        const groups = Math.floor(quantity / n);
        if (groups <= 0) return null;
        return {
          pattern: 'bundle-flat',
          discount: round2(groups * (fullPriceForN - flatPrice)),
        };
      }
    }
  }

  return null;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
