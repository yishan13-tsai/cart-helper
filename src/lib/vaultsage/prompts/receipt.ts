import { z } from 'zod';
import type { OcrLocaleHint } from './ocr';

export interface CartLineForPrompt {
  name: string;
  unit_price: number | null;
  quantity: number;
  currency: string;
}

export const ReceiptLineSchema = z.object({
  name: z.string(),
  unit_price: z.number().nullable(),
  quantity: z.number().int().positive(),
  currency: z.string().min(3).max(3),
});

export const ReceiptComparisonSchema = z.object({
  matched: z.array(ReceiptLineSchema),
  missing_from_receipt: z.array(ReceiptLineSchema),
  extra_on_receipt: z.array(ReceiptLineSchema),
  total_in_cart: z.number(),
  total_on_receipt: z.number(),
  difference: z.number(),
});
export type ReceiptComparison = z.infer<typeof ReceiptComparisonSchema>;

export function buildReceiptPrompt(cart: CartLineForPrompt[], locale: OcrLocaleHint): string {
  const cartJson = JSON.stringify(cart, null, 2);
  return [
    `You are reconciling a shopper's recorded cart against a photographed receipt.`,
    `Cart (recorded by the shopper, may have errors):`,
    '```json',
    cartJson,
    '```',
    `The attached image is the receipt.`,
    ``,
    `Reply with JSON ONLY — no prose, no markdown, no code fences. Schema:`,
    `{`,
    `  "matched":              [<line>, ...],`,
    `  "missing_from_receipt": [<line>, ...],`,
    `  "extra_on_receipt":     [<line>, ...],`,
    `  "total_in_cart":   <number>,`,
    `  "total_on_receipt":<number>,`,
    `  "difference":      <number, total_on_receipt - total_in_cart>`,
    `}`,
    `Each <line> object has: { "name", "unit_price", "quantity", "currency" }.`,
    ``,
    `Rules:`,
    `- "matched" = items present in both, with the receipt's price/quantity (treat the receipt as ground truth).`,
    `- "missing_from_receipt" = items in the cart but NOT on the receipt.`,
    `- "extra_on_receipt" = items on the receipt but NOT in the cart.`,
    `- Match items by name similarity in ${locale.name}; small spelling/translation differences are still a match.`,
    `- Use the receipt's printed totals if present; otherwise sum the line items yourself.`,
    `- "currency" defaults to ${locale.currency}; override per line only when the receipt clearly shows a different ISO 4217 code.`,
    `- "difference" is signed: positive means receipt charged more than the cart expected.`,
    `- Respond with the JSON object only, nothing before or after.`,
  ].join('\n');
}
