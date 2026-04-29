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
