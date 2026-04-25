import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem, Currency } from '../types';

export interface PendingItem {
  id: string;
  thumbnailUrl: string; // data: URL of the captured image
  status: 'recognizing' | 'failed';
  error?: string;
  createdAt: number;
}

interface CartState {
  id: string;
  items: CartItem[];
  currency: Currency;
  updatedAt: number;
  total: number;
  pendingItems: PendingItem[];
  addItem: (item: Omit<CartItem, 'id' | 'createdAt'>) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, patch: Partial<Omit<CartItem, 'id' | 'createdAt'>>) => void;
  clear: () => void;
  setCurrency: (currency: Currency) => void;
  addPending: (entry: Omit<PendingItem, 'createdAt' | 'status'>) => void;
  removePending: (id: string) => void;
  markPendingFailed: (id: string, error: string) => void;
  retryPending: (id: string) => void;
}

function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function computeTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => {
    if (item.unitPrice == null) return sum;
    return sum + item.unitPrice * item.quantity;
  }, 0);
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      id: uuid(),
      items: [],
      currency: 'TWD',
      updatedAt: Date.now(),
      total: 0,
      pendingItems: [],
      addItem: (input) =>
        set((state) => {
          const item: CartItem = {
            ...input,
            id: uuid(),
            createdAt: Date.now(),
          };
          const items = [...state.items, item];
          return { items, total: computeTotal(items), updatedAt: Date.now() };
        }),
      removeItem: (id) =>
        set((state) => {
          const items = state.items.filter((item) => item.id !== id);
          return { items, total: computeTotal(items), updatedAt: Date.now() };
        }),
      updateItem: (id, patch) =>
        set((state) => {
          const items = state.items.map((item) =>
            item.id === id ? { ...item, ...patch } : item,
          );
          return { items, total: computeTotal(items), updatedAt: Date.now() };
        }),
      clear: () =>
        set(() => ({
          id: uuid(),
          items: [],
          total: 0,
          updatedAt: Date.now(),
          pendingItems: [],
        })),
      setCurrency: (currency) =>
        set(() => ({ currency, updatedAt: Date.now() })),
      addPending: (entry) =>
        set((state) => ({
          pendingItems: [
            ...state.pendingItems,
            { ...entry, status: 'recognizing', createdAt: Date.now() },
          ],
        })),
      removePending: (id) =>
        set((state) => ({
          pendingItems: state.pendingItems.filter((p) => p.id !== id),
        })),
      markPendingFailed: (id, error) =>
        set((state) => ({
          pendingItems: state.pendingItems.map((p) =>
            p.id === id ? { ...p, status: 'failed' as const, error } : p,
          ),
        })),
      retryPending: (id) =>
        set((state) => ({
          pendingItems: state.pendingItems.map((p) =>
            p.id === id ? { ...p, status: 'recognizing' as const, error: undefined } : p,
          ),
        })),
    }),
    {
      name: 'cart:current',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        id: state.id,
        items: state.items,
        currency: state.currency,
        updatedAt: state.updatedAt,
        total: state.total,
        // Note: pendingItems intentionally not persisted — if the page reloads
        // mid-recognition, the in-memory blob/recognizer task is gone anyway,
        // so we don't want to leave orphan pending entries. User can re-scan.
      }),
    },
  ),
);
