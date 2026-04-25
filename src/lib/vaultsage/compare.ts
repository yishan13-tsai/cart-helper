import type { CartItem, ComparisonResult, Receipt } from '../../types';
import { askJson } from './chat';
import { pollProcessing, uploadFile } from './files';
import { preprocessImage } from './image';
import type { OcrLocaleHint } from './prompts/ocr';
import {
  buildReceiptPrompt,
  ReceiptComparisonSchema,
  type CartLineForPrompt,
  type ReceiptComparison,
} from './prompts/receipt';

export interface CompareResult extends ComparisonResult {
  raw: ReceiptComparison;
}

export async function compareReceipt(
  receiptBlob: Blob,
  cart: CartItem[],
  locale: OcrLocaleHint,
  cartId = 'current',
): Promise<CompareResult> {
  const { blob: prepared } = await preprocessImage(receiptBlob);
  const upload = await uploadFile(prepared);
  // Wait for AI summary indexing — chat v2 uses RAG (contextual_file_ids)
  // instead of vision (file_ids), because VaultSage's chat-end vision
  // hallucinates while its indexing-end summary is accurate.
  await pollProcessing(upload.file_id, { waitFor: 'summary' });

  const prompt = buildReceiptPrompt(toPromptCart(cart), locale);
  const { data } = await askJson(prompt, undefined, {
    schema: ReceiptComparisonSchema,
    contextualFileIds: [upload.file_id],
  });

  const receipt: Receipt = {
    fileId: upload.file_id,
    capturedAt: Date.now(),
    totalOnReceipt: data.total_on_receipt,
  };

  return {
    cartId,
    receipt,
    matched: data.matched.map((line, i) => fromLine(line, `m-${i}`)),
    missingFromReceipt: data.missing_from_receipt.map((line, i) => fromLine(line, `mi-${i}`)),
    extraOnReceipt: data.extra_on_receipt.map((line, i) => fromLine(line, `e-${i}`)),
    totalInCart: data.total_in_cart,
    totalOnReceipt: data.total_on_receipt,
    difference: data.difference,
    raw: data,
  };
}

function toPromptCart(items: CartItem[]): CartLineForPrompt[] {
  return items.map((it) => ({
    name: it.name,
    unit_price: it.unitPrice,
    quantity: it.quantity,
    currency: it.currency,
  }));
}

function fromLine(
  line: ReceiptComparison['matched'][number],
  id: string,
): CartItem {
  return {
    id,
    name: line.name,
    unitPrice: line.unit_price,
    quantity: line.quantity,
    currency: coerceCurrency(line.currency),
    createdAt: Date.now(),
  };
}

const SUPPORTED = new Set(['TWD', 'USD', 'JPY', 'KRW']);

function coerceCurrency(raw: string): CartItem['currency'] {
  const upper = raw.trim().toUpperCase();
  return (SUPPORTED.has(upper) ? upper : 'TWD') as CartItem['currency'];
}
