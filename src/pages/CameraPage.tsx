import { useState } from 'react';
import { CameraCapture } from '../components/CameraCapture';
import { OcrConfirmModal } from '../components/OcrConfirmModal';
import { useCartStore } from '../store/cart';
import { resolveRecognizer } from '../lib/recognizer';
import type { CartItem } from '../types';
import { useTranslation } from 'react-i18next';

type Mode = 'product' | 'receipt';

export function CameraPage() {
  const { t, i18n } = useTranslation();
  const [mode, setMode] = useState<Mode>('product');
  const [recognizing, setRecognizing] = useState(false);
  const [pending, setPending] = useState<CartItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total);
  const currency = useCartStore((s) => s.currency);
  const addItem = useCartStore((s) => s.addItem);

  async function handleCapture(blob: Blob) {
    if (mode !== 'product') return;
    setError(null);
    setRecognizing(true);
    try {
      const recognizer = resolveRecognizer();
      const recognized = await recognizer(blob, i18n.language);
      setPending(recognized);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('camera.error.recognizeFailed'),
      );
    } finally {
      setRecognizing(false);
    }
  }

  function handleConfirm(confirmed: CartItem[]) {
    confirmed.forEach(({ id: _id, createdAt: _createdAt, ...rest }) =>
      addItem(rest),
    );
    setPending(null);
  }

  const symbol = t(`common.currency.${currency}`);

  return (
    <div className="relative flex h-full flex-col bg-neutral-900">
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between bg-secondary-500/90 px-4 py-2 text-neutral-0 backdrop-blur">
        <h1 className="text-sm font-bold">{t('camera.title')}</h1>
        <div className="flex items-baseline gap-1">
          <span className="font-mono text-base">
            {symbol} {total.toLocaleString()}
          </span>
          <span className="text-2xs text-neutral-400">
            {items.length} {t('camera.runningTotal.unit')}
          </span>
        </div>
      </div>

      <div className="absolute inset-x-0 top-12 z-10 flex justify-center">
        <ModeToggle mode={mode} onChange={setMode} />
      </div>

      <div className="flex-1">
        <CameraCapture onCapture={handleCapture} disabled={recognizing} />
      </div>

      {recognizing && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-neutral-900/60 text-neutral-0">
          <div className="flex items-center gap-3 rounded-full bg-neutral-900/80 px-4 py-2 text-sm">
            <span className="h-3 w-3 animate-pulse rounded-full bg-primary-500" />
            {t('camera.recognizing')}
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-x-4 top-24 z-30 rounded-lg bg-danger-500 px-3 py-2 text-xs text-neutral-0">
          {error}
        </div>
      )}

      <OcrConfirmModal
        open={pending != null}
        items={pending ?? []}
        currency={currency}
        onCancel={() => setPending(null)}
        onConfirm={handleConfirm}
      />
    </div>
  );
}

function ModeToggle({
  mode,
  onChange,
}: {
  mode: Mode;
  onChange: (m: Mode) => void;
}) {
  const { t } = useTranslation();
  return (
    <div
      role="tablist"
      className="rounded-full bg-neutral-900/70 p-1 text-xs text-neutral-0 backdrop-blur"
    >
      <TabButton
        active={mode === 'product'}
        onClick={() => onChange('product')}
        label={t('camera.mode.product')}
      />
      <TabButton
        active={mode === 'receipt'}
        onClick={() => onChange('receipt')}
        label={t('camera.mode.receipt')}
      />
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-1 transition ${
        active ? 'bg-primary-500 text-neutral-0' : 'text-neutral-400'
      }`}
    >
      {label}
    </button>
  );
}
