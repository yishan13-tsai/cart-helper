import { z } from 'zod';

export interface OcrLocaleHint {
  code: string;
  name: string;
  currency: string;
}

export const OcrItemSchema = z.object({
  name: z.string().min(1),
  unit_price: z.number().nullable(),
  quantity: z.number().int().positive().default(1),
  currency: z.string().min(3).max(3),
});

export const OcrPayloadSchema = z.object({
  items: z.array(OcrItemSchema),
  confidence: z.number().min(0).max(1).optional(),
});

export type OcrItem = z.infer<typeof OcrItemSchema>;
export type OcrPayload = z.infer<typeof OcrPayloadSchema>;

export function buildOcrPrompt(locale: OcrLocaleHint): string {
  return [
    `You are a shopping product recognition assistant.`,
    `Look at the file attached to this conversation and identify every distinct product or item.`,
    ``,
    `Reply with JSON ONLY — no prose, no markdown, no code fences. Schema:`,
    `{`,
    `  "items": [`,
    `    {`,
    `      "name": "<product name in ${locale.name}>",`,
    `      "unit_price": <number or null>,`,
    `      "quantity": <integer >= 1, default 1>,`,
    `      "currency": "<ISO 4217 code, prefer ${locale.currency} unless the price label clearly shows another>"`,
    `    }`,
    `  ],`,
    `  "confidence": <number between 0 and 1>`,
    `}`,
    ``,
    `Rules:`,
    `- Base your answer ONLY on the file in this conversation. Do NOT invent or substitute brand names from memory.`,
    `- Item names MUST be written in ${locale.name}. Translate from packaging text if needed.`,
    `- If a price is illegible or ambiguous, set "unit_price" to null. NEVER guess.`,
    `- "currency" must always be a valid 3-letter ISO 4217 code (e.g. TWD, USD, JPY, KRW).`,
    `- Group identical items together with their quantity, do not list duplicates.`,
    `- Skip the receipt total / change / tax lines if you see them.`,
    `- Respond with the JSON object only, nothing before or after.`,
  ].join('\n');
}
