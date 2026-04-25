import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { defaultBaseForLocale, normalizeCurrency } from '../lib/fx';
import type { IsoCurrency } from '../lib/fx';

const STORAGE_KEY = 'app.baseCurrency';

function readStored(): IsoCurrency | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return normalizeCurrency(raw);
  } catch {
    return null;
  }
}

export function useBaseCurrency(): [IsoCurrency, (next: IsoCurrency) => void] {
  const { i18n } = useTranslation();
  const [value, setValue] = useState<IsoCurrency>(
    () => readStored() ?? defaultBaseForLocale(i18n.language),
  );

  useEffect(() => {
    if (readStored() == null) {
      setValue(defaultBaseForLocale(i18n.language));
    }
  }, [i18n.language]);

  const setBase = useCallback((next: IsoCurrency) => {
    const upper = normalizeCurrency(next);
    setValue(upper);
    try {
      window.localStorage.setItem(STORAGE_KEY, upper);
    } catch {
      // quota / private mode — ignore
    }
  }, []);

  return [value, setBase];
}
