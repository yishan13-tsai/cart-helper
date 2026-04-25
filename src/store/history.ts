import { create } from 'zustand';
import type { HistoryEntry } from '../types';

const STORAGE_KEY = 'history:entries';
const MAX_ENTRIES = 50;

interface HistoryState {
  entries: HistoryEntry[];
  addEntry: (entry: HistoryEntry) => void;
  getEntry: (id: string) => HistoryEntry | undefined;
  removeEntry: (id: string) => void;
  clear: () => void;
}

function loadFromStorage(): HistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is HistoryEntry =>
        e != null && typeof e.id === 'string' && typeof e.savedAt === 'number',
    );
  } catch {
    return [];
  }
}

function saveToStorage(entries: HistoryEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // quota / private mode — ignore
  }
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  entries: loadFromStorage(),
  addEntry: (entry) =>
    set((state) => {
      const next = [entry, ...state.entries].slice(0, MAX_ENTRIES);
      saveToStorage(next);
      return { entries: next };
    }),
  getEntry: (id) => get().entries.find((e) => e.id === id),
  removeEntry: (id) =>
    set((state) => {
      const next = state.entries.filter((e) => e.id !== id);
      saveToStorage(next);
      return { entries: next };
    }),
  clear: () => {
    saveToStorage([]);
    set({ entries: [] });
  },
}));
