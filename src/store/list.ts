import { create } from 'zustand';

export interface ListItem {
  id: string;
  name: string;
  checked: boolean;
}

const STORAGE_KEY = 'list:items';

interface ListState {
  items: ListItem[];
  addItem: (name: string) => void;
  toggleItem: (id: string) => void;
  removeItem: (id: string) => void;
  checkByName: (cartName: string) => void;
  clearChecked: () => void;
}

function load(): ListItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is ListItem =>
        e != null && typeof e.id === 'string' && typeof e.name === 'string',
    );
  } catch {
    return [];
  }
}

function save(items: ListItem[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* ignore */ }
}

function nameMatch(a: string, b: string): boolean {
  const la = a.toLowerCase();
  const lb = b.toLowerCase();
  return la.includes(lb) || lb.includes(la);
}

export const useListStore = create<ListState>((set) => ({
  items: load(),

  addItem: (name) =>
    set((s) => {
      const next = [...s.items, { id: crypto.randomUUID(), name: name.trim(), checked: false }];
      save(next);
      return { items: next };
    }),

  toggleItem: (id) =>
    set((s) => {
      const next = s.items.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i));
      save(next);
      return { items: next };
    }),

  removeItem: (id) =>
    set((s) => {
      const next = s.items.filter((i) => i.id !== id);
      save(next);
      return { items: next };
    }),

  checkByName: (cartName) =>
    set((s) => {
      let changed = false;
      const next = s.items.map((i) => {
        if (!i.checked && nameMatch(i.name, cartName)) {
          changed = true;
          return { ...i, checked: true };
        }
        return i;
      });
      if (!changed) return s;
      save(next);
      return { items: next };
    }),

  clearChecked: () =>
    set((s) => {
      const next = s.items.filter((i) => !i.checked);
      save(next);
      return { items: next };
    }),
}));
