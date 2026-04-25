import type { CartItem, Currency } from '../../types';
import { askJson } from './chat';
import { VaultSageError } from './errors';
import { pollProcessing, uploadFile } from './files';
import { preprocessImage } from './image';
import { buildOcrPrompt, OcrPayloadSchema, type OcrLocaleHint } from './prompts/ocr';

export type RecognizedItem = Omit<CartItem, 'id' | 'createdAt'>;

export interface RecognizeResult {
  items: RecognizedItem[];
  confidence?: number;
  fileId: string;
}

const SUPPORTED_CURRENCIES = new Set<Currency>(['TWD', 'USD', 'JPY', 'KRW']);

export async function recognizeProducts(
  blob: Blob,
  locale: OcrLocaleHint,
): Promise<RecognizeResult> {
  const { blob: prepared } = await preprocessImage(blob);
  const upload = await uploadFile(prepared);
  await pollProcessing(upload.file_id);

  const prompt = buildOcrPrompt(locale);
  const { data } = await askJson(prompt, [upload.file_id], { schema: OcrPayloadSchema });

  if (data.items.length === 0) {
    throw new VaultSageError('VS_LLM_EMPTY', 'OCR returned zero items');
  }

  const fallback = coerceCurrency(locale.currency);
  return {
    fileId: upload.file_id,
    confidence: data.confidence,
    items: data.items.map((item) => toCartItem(item, fallback, upload.file_id, data.confidence)),
  };
}

type OcrItemOut = ReturnType<(typeof OcrPayloadSchema)['parse']>['items'][number];

function toCartItem(
  item: OcrItemOut,
  fallback: Currency,
  sourceFileId: string,
  confidence: number | undefined,
): RecognizedItem {
  return {
    name: item.name,
    unitPrice: item.unit_price,
    quantity: item.quantity,
    currency: coerceCurrency(item.currency, fallback),
    sourceFileId,
    confidence,
  };
}

function coerceCurrency(raw: string, fallback: Currency = 'TWD'): Currency {
  const upper = raw.trim().toUpperCase();
  return SUPPORTED_CURRENCIES.has(upper as Currency) ? (upper as Currency) : fallback;
}
