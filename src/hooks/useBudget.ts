import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'app.tripBudget';

function read(): number | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * Single-trip budget in the cart's currency. `null` = no budget set.
 * Stored in localStorage so it persists across reloads.
 */
export function useBudget(): [number | null, (next: number | null) => void] {
  const [value, setValue] = useState<number | null>(() => read());

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setValue(read());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const update = useCallback((next: number | null) => {
    if (next == null || next <= 0) {
      window.localStorage.removeItem(STORAGE_KEY);
      setValue(null);
    } else {
      window.localStorage.setItem(STORAGE_KEY, String(next));
      setValue(next);
    }
  }, []);

  return [value, update];
}

export type BudgetState = 'none' | 'ok' | 'warning' | 'over';

/** Categorise spend vs budget into ok / warning / over for UI styling. */
export function classifyBudget(total: number, budget: number | null): BudgetState {
  if (budget == null) return 'none';
  if (total >= budget) return 'over';
  if (total >= budget * 0.8) return 'warning';
  return 'ok';
}
