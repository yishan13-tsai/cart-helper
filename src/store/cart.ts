import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem, Currency } from '../types';

interface CartState {
  id: string;
  items: CartItem[];
  currency: Currency;
  updatedAt: number;
  total: number;
  addItem: (item: Omit<CartItem, 'id' | 'createdAt'>) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, patch: Partial<Omit<CartItem, 'id' | 'createdAt'>>) => void;
  clear: () => void;
  setCurrency: (currency: Currency) => void;
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
        })),
      setCurrency: (currency) =>
        set(() => ({ currency, updatedAt: Date.now() })),
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
      }),
    },
  ),
);
