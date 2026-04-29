import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CameraCapture } from '../components/CameraCapture';
import { RoundButton } from '../components/RoundButton';
import { TIcon } from '../components/TIcon';
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
      // Surface full underlying error to DevTools so VS_NETWORK / VS_HTTP_4XX
      // root causes (DNS, CORS, 401, etc.) can actually be diagnosed.
      console.error('[receipt] compareReceipt failed:', err);
      const msg = err instanceof Error ? err.message : 'unknown';
      setError(msg);
      setPhase('error');
    }
  }

  return (
    <div className="relative flex h-full flex-col bg-neutral-900 overflow-hidden">
      {/* ── Top header (over camera, z-20) ───────────────────────── */}
      <div className="absolute inset-x-0 top-0 z-20 pt-safe">
        <div className="flex items-center justify-between px-[22px] py-3">
          {/* Close */}
          <RoundButton
            icon="x"
            tone="white"
            aria-label="關閉"
            onClick={() => navigate(-1)}
          />

          {/* Mode label */}
          <div className="text-[11px] font-bold tracking-[4px] text-white/70 uppercase">
            {t('receipt.capture.title')}
          </div>

          {/* Gallery hint (cosmetic) */}
          <RoundButton
            icon="grid"
            tone="surface"
            aria-label="相簿"
          />
        </div>
      </div>

      {/* ── Live camera (fills entire screen behind overlays) ────── */}
      <div className="flex-1">
        <CameraCapture onCapture={handleCapture} />
      </div>

      {/* ── Bottom hint card ──────────────────────────────────────── */}
      <div className="absolute inset-x-0 bottom-0 z-20 px-[22px] pb-safe pb-6">
        <div className="flex items-center gap-2.5 rounded-[18px] bg-white p-3 shadow-sm">
          {/* Receipt icon square */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-alert">
            <TIcon name="receipt" size={18} className="text-white" />
          </div>

          {/* Hint text */}
          <div className="flex-1 min-w-0">
            <div className="text-[11px] text-ink-60">{t('receipt.capture.hint')}</div>
            <div className="text-sm font-bold text-ink">{t('receipt.capture.align')}</div>
          </div>
        </div>
      </div>

      {/* ── Loading overlay ───────────────────────────────────────── */}
      {phase === 'comparing' && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-neutral-900/85 text-white">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-page border-t-transparent" />
          <p className="mt-4 text-sm font-bold">{t('loading.comparing')}</p>
        </div>
      )}

      {/* ── Error toast ───────────────────────────────────────────── */}
      {phase === 'error' && error && (
        <div className="absolute inset-x-4 bottom-24 z-30 flex justify-center">
          <div className="rounded-full bg-alert/95 px-4 py-2 text-xs font-bold text-white shadow-hero text-center">
            {error.startsWith('VS_') ? `${error} · ${t('error.network')}` : error}
          </div>
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
