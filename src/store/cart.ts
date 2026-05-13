import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem, ComparisonResult, Currency } from '../types';
import { useHistoryStore } from './history';
import { parsePromotion } from '../lib/promotion';

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
  /** When the active trip began. 0 means "no active trip yet". */
  startedAt: number;
  /** Optional store label user typed when starting the trip. */
  store?: string;
  addItem: (item: Omit<CartItem, 'id' | 'createdAt'>) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, patch: Partial<Omit<CartItem, 'id' | 'createdAt'>>) => void;
  clear: () => void;
  /**
   * Begin a new shopping trip. If the current cart has items, archives it to
   * history first so nothing is lost. Idempotent on an empty cart.
   */
  startTrip: (store?: string) => void;
  /**
   * Archive the current trip to history without starting a new one. Used when
   * user explicitly "ends" the trip without immediately starting another.
   */
  endTrip: () => void;
  /**
   * Archive the current trip to history WITH a receipt-comparison attached,
   * then reset the cart. Returns the history entry id so the caller can
   * navigate to the comparison page. Reuses the trip's id as the history
   * entry id so a single trip = single history row.
   */
  archiveWithComparison: (comparison: ComparisonResult) => string | null;
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
    let line = item.unitPrice * item.quantity;
    if (item.promotionApplied && item.promotion) {
      const promo = parsePromotion(item.promotion, item.unitPrice, item.quantity);
      if (promo) line = Math.max(0, line - Math.round(promo.discount));
    }
    return sum + line;
  }, 0);
}

/** Snapshot the active cart into a HistoryEntry, if it has items. */
function archiveActive(state: CartState): void {
  if (state.items.length === 0) return;
  useHistoryStore.getState().addEntry({
    id: state.id,
    cart: {
      id: state.id,
      items: state.items,
      currency: state.currency,
      total: state.total,
      updatedAt: state.updatedAt,
      startedAt: state.startedAt || undefined,
      store: state.store,
    },
    savedAt: Date.now(),
  });
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      id: uuid(),
      items: [],
      currency: 'TWD',
      updatedAt: Date.now(),
      total: 0,
      pendingItems: [],
      startedAt: 0,
      store: undefined,
      addItem: (input) =>
        set((state) => {
          const item: CartItem = { ...input, id: uuid(), createdAt: Date.now() };
          // Auto-apply promotion if parseable and qty already qualifies.
          if (item.promotion && item.unitPrice != null) {
            const promo = parsePromotion(item.promotion, item.unitPrice, item.quantity);
            if (promo) item.promotionApplied = true;
          }
          const items = [...state.items, item];
          // Auto-start a trip on first item if user skipped the "開始購物"
          // button — keeps the data clean without forcing the flow.
          const startedAt = state.startedAt || Date.now();
          return { items, total: computeTotal(items), updatedAt: Date.now(), startedAt };
        }),
      removeItem: (id) =>
        set((state) => {
          const items = state.items.filter((item) => item.id !== id);
          return { items, total: computeTotal(items), updatedAt: Date.now() };
        }),
      updateItem: (id, patch) =>
        set((state) => {
          const items = state.items.map((item) => {
            if (item.id !== id) return item;
            const updated = { ...item, ...patch };
            // Re-evaluate promotion when quantity changes — auto-on when qty
            // qualifies, auto-off when it drops below the threshold.
            if (patch.quantity !== undefined && updated.promotion && updated.unitPrice != null) {
              const promo = parsePromotion(updated.promotion, updated.unitPrice, updated.quantity);
              updated.promotionApplied = !!promo;
            }
            return updated;
          });
          return { items, total: computeTotal(items), updatedAt: Date.now() };
        }),
      clear: () =>
        set(() => ({
          id: uuid(),
          items: [],
          total: 0,
          updatedAt: Date.now(),
          pendingItems: [],
          startedAt: 0,
          store: undefined,
        })),
      startTrip: (store) => {
        archiveActive(get());
        set(() => ({
          id: uuid(),
          items: [],
          total: 0,
          updatedAt: Date.now(),
          pendingItems: [],
          startedAt: Date.now(),
          store: store?.trim() || undefined,
        }));
      },
      endTrip: () => {
        archiveActive(get());
        set(() => ({
          id: uuid(),
          items: [],
          total: 0,
          updatedAt: Date.now(),
          pendingItems: [],
          startedAt: 0,
          store: undefined,
        }));
      },
      archiveWithComparison: (comparison) => {
        const state = get();
        if (state.items.length === 0) return null;
        useHistoryStore.getState().addEntry({
          id: state.id,
          cart: {
            id: state.id,
            items: state.items,
            currency: state.currency,
            total: state.total,
            updatedAt: state.updatedAt,
            startedAt: state.startedAt || undefined,
            store: state.store,
          },
          comparison,
          savedAt: Date.now(),
        });
        const archivedId = state.id;
        set(() => ({
          id: uuid(),
          items: [],
          total: 0,
          updatedAt: Date.now(),
          pendingItems: [],
          startedAt: 0,
          store: undefined,
        }));
        return archivedId;
      },
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
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // Re-evaluate promotionApplied for every item on hydration, so items
        // that qualify but had promotionApplied=false (e.g. from old data) get
        // auto-applied without requiring a qty tap.
        const items = state.items.map((item) => {
          if (item.promotion && item.unitPrice != null) {
            const promo = parsePromotion(item.promotion, item.unitPrice, item.quantity);
            if (promo && !item.promotionApplied) return { ...item, promotionApplied: true };
          }
          return item;
        });
        state.items = items;
        state.total = computeTotal(items);
      },
      partialize: (state) => ({
        id: state.id,
        items: state.items,
        currency: state.currency,
        updatedAt: state.updatedAt,
        total: state.total,
        startedAt: state.startedAt,
        store: state.store,
        // Note: pendingItems intentionally not persisted — if the page reloads
        // mid-recognition, the in-memory blob/recognizer task is gone anyway,
        // so we don't want to leave orphan pending entries. User can re-scan.
      }),
    },
  ),
);
