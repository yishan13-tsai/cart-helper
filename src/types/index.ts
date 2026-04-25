export type Currency = 'TWD' | 'USD' | 'JPY' | 'KRW';

export interface CartItem {
  id: string;
  name: string;
  unitPrice: number | null;
  quantity: number;
  currency: Currency;
  sourceFileId?: string;
  confidence?: number;
  createdAt: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  currency: Currency;
  total: number;
  updatedAt: number;
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
