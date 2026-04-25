import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CameraCapture } from '../components/CameraCapture';
import { useCartStore } from '../store/cart';
import { useHistoryStore } from '../store/history';
import { runCompare } from '../lib/compareReceiptRunner';
import { getLocaleForLLM } from '../i18n/llm-locale';
import type { Currency, HistoryEntry } from '../types';

export function ReceiptCapturePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const cart = useCartStore((s) => ({
    id: s.id,
    items: s.items,
    currency: s.currency,
    total: s.total,
    updatedAt: s.updatedAt,
  }));
  const addEntry = useHistoryStore((s) => s.addEntry);
  const [phase, setPhase] = useState<'idle' | 'comparing' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleCapture(blob: Blob) {
    if (cart.items.length === 0) {
      setError(t('receipt.capture.empty'));
      return;
    }
    setPhase('comparing');
    setError(null);
    try {
      const hint = getLocaleForLLM();
      const result = await runCompare(
        blob,
        cart.items,
        { code: hint.code, name: hint.name, currency: hint.currency as Currency },
        cart.id,
      );
      const entryId = uuid();
      const entry: HistoryEntry = {
        id: entryId,
        cart,
        comparison: result,
        savedAt: Date.now(),
      };
      addEntry(entry);
      navigate(`/receipt/comparison/${entryId}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'unknown';
      setError(msg);
      setPhase('error');
    }
  }

  return (
    <div className="relative flex h-full flex-col bg-neutral-900">
      <div className="absolute inset-x-0 top-0 z-10 bg-secondary-500/90 px-4 py-2 text-neutral-0 backdrop-blur">
        <h1 className="text-sm font-bold">{t('receipt.capture.title')}</h1>
        <p className="text-2xs text-neutral-400">{t('receipt.capture.hint')}</p>
      </div>
      <div className="flex-1">
        <CameraCapture onCapture={handleCapture} />
      </div>
      {phase === 'comparing' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-neutral-900/85 text-neutral-0">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
          <p className="mt-4 text-sm">{t('loading.comparing')}</p>
        </div>
      )}
      {phase === 'error' && error && (
        <div className="absolute inset-x-4 bottom-24 rounded-lg bg-danger-500/90 px-3 py-2 text-center text-xs text-neutral-0">
          {error.startsWith('VS_') ? `${error} · ${t('error.network')}` : error}
        </div>
      )}
    </div>
  );
}

function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
