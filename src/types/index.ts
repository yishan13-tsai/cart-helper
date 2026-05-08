export type Currency = 'TWD' | 'USD' | 'JPY' | 'KRW';

export interface CartItem {
  id: string;
  name: string;
  unitPrice: number | null;
  quantity: number;
  currency: Currency;
  sourceFileId?: string;
  /** Small (~96px) data URL of the captured photo, persisted in localStorage. */
  thumbnailUrl?: string;
  confidence?: number;
  /**
   * Free-text promotion label captured by OCR (e.g. "第二件 6 折", "兩件 99").
   * Stored verbatim. `parsePromotion()` decides if we can compute the math.
   */
  promotion?: string;
  /** True when the user opted in to the promotion (cart total subtracts the discount). */
  promotionApplied?: boolean;
  /** True when the user has manually overridden `unitPrice`. */
  priceEdited?: boolean;
  /** OCR-captured price preserved so the user can revert a manual edit. */
  originalUnitPrice?: number | null;
  createdAt: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  currency: Currency;
  total: number;
  updatedAt: number;
  /** Trip start timestamp — when user pressed "開始購物". */
  startedAt?: number;
  /** Optional store name user typed when starting the trip. */
  store?: string;
}

export interface Receipt {
  fileId: string;
  capturedAt: number;
  totalOnReceipt?: number;
}

export interface ComparisonResult {
  cartId: string;
  receipt: Receipt;
  matched: CartItem[];
  missingFromReceipt: CartItem[];
  extraOnReceipt: Array<Omit<CartItem, 'id'> & { id: string }>;
  totalInCart: number;
  totalOnReceipt: number;
  difference: number;
}

export interface HistoryEntry {
  id: string;
  cart: Cart;
  comparison?: ComparisonResult;
  savedAt: number;
}
