import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CameraCapture } from '../components/CameraCapture';
import { useCartStore } from '../store/cart';
import { resolveRecognizer } from '../lib/recognizer';

type Mode = 'product' | 'receipt';

function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

async function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export function CameraPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('product');
  const [toast, setToast] = useState<string | null>(null);

  const items = useCartStore((s) => s.items);
  const pendingCount = useCartStore((s) => s.pendingItems.length);
  const total = useCartStore((s) => s.total);
  const currency = useCartStore((s) => s.currency);
  const addItem = useCartStore((s) => s.addItem);
  const addPending = useCartStore((s) => s.addPending);
  const removePending = useCartStore((s) => s.removePending);
  const markPendingFailed = useCartStore((s) => s.markPendingFailed);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 1500);
    return () => clearTimeout(timer);
  }, [toast]);

  async function handleCapture(blob: Blob) {
    if (mode === 'receipt') {
      // Receipt comparison stays synchronous — there's only one operation and
      // it's the demo hero moment, so we want the user to see the result page.
      navigate('/receipt/capture');
      return;
    }

    // Product mode: fire-and-forget. Show pending placeholder in cart, return
    // to camera immediately for the next shot.
    const pendingId = uuid();
    let thumbnailUrl = '';
    try {
      thumbnailUrl = await blobToDataURL(blob);
    } catch {
      // Thumbnail failure is non-fatal — just an empty preview.
    }
    addPending({ id: pendingId, thumbnailUrl });
    setToast(t('camera.toast.queued', { count: pendingCount + 1 }));

    // Run the recognizer in the background. Resolves into real cart items
    // when done; on failure the pending entry switches to the failed state
    // so the user can retry / dismiss from the cart page.
    void (async () => {
      try {
        const recognizer = resolveRecognizer();
        const recognized = await recognizer(blob, i18n.language);
        // Strip the synthetic recognizer ids — addItem assigns its own.
        recognized.forEach(({ id: _id, createdAt: _createdAt, ...rest }) =>
          addItem(rest),
        );
        removePending(pendingId);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'unknown';
        markPendingFailed(pendingId, msg);
      }
    })();
  }

  const symbol = t(`common.currency.${currency}` as
    | 'common.currency.TWD'
    | 'common.currency.USD'
    | 'common.currency.JPY'
    | 'common.currency.KRW');

  return (
    <div className="relative flex h-full flex-col bg-neutral-900">
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between bg-secondary-500/90 px-4 py-2 text-neutral-0 backdrop-blur">
        <h1 className="text-sm font-bold">{t('camera.title')}</h1>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-base">
            {symbol} {total.toLocaleString()}
          </span>
          <span className="text-2xs text-neutral-400">
            {items.length} {t('camera.runningTotal.unit')}
          </span>
          {pendingCount > 0 && (
            <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-primary-500/30 px-2 py-0.5 text-2xs">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-500" />
              {pendingCount}
            </span>
          )}
        </div>
      </div>

      <div className="absolute inset-x-0 top-12 z-10 flex justify-center">
        <ModeToggle mode={mode} onChange={setMode} />
      </div>

      <div className="flex-1">
        <CameraCapture onCapture={handleCapture} />
      </div>

      {toast && (
        <div className="pointer-events-none absolute inset-x-0 top-28 z-30 flex justify-center animate-pop-in">
          <div className="flex items-center gap-2 rounded-full bg-primary-500/95 px-4 py-2 text-xs font-bold text-neutral-0 shadow-hero">
            <span aria-hidden>✓</span>
            {toast}
          </div>
        </div>
      )}
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
