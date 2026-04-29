import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CameraCapture } from '../components/CameraCapture';
import { RoundButton } from '../components/RoundButton';
import { TIcon } from '../components/TIcon';
import { TripGate } from '../components/TripGate';
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

// Compact (~96px long edge, q=0.7) thumbnail data URL for storing alongside
// each cart item. Keep it small — localStorage caps at a few MB and we may
// have many cart items per session. Falls back to the full-size data URL on
// browsers without canvas (effectively never in target devices).
async function makeThumbnailDataURL(blob: Blob): Promise<string> {
  if (typeof document === 'undefined' || typeof createImageBitmap !== 'function') {
    return blobToDataURL(blob);
  }
  const bitmap = await createImageBitmap(blob);
  try {
    const longEdge = Math.max(bitmap.width, bitmap.height);
    const scale = longEdge > 96 ? 96 / longEdge : 1;
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return blobToDataURL(blob);
    ctx.drawImage(bitmap, 0, 0, w, h);
    return canvas.toDataURL('image/jpeg', 0.7);
  } finally {
    bitmap.close();
  }
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
  const startedAt = useCartStore((s) => s.startedAt);
  const addItem = useCartStore((s) => s.addItem);
  const addPending = useCartStore((s) => s.addPending);
  const removePending = useCartStore((s) => s.removePending);
  const markPendingFailed = useCartStore((s) => s.markPendingFailed);

  // Pre-trip gate — force user to open a trip before any photo is taken so
  // every captured item has a parent trip in history.
  const needsGate = startedAt === 0 && items.length === 0;

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
      thumbnailUrl = await makeThumbnailDataURL(blob);
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
        // Each item from this capture gets the same thumbnail.
        recognized.forEach(({ id: _id, createdAt: _createdAt, ...rest }) =>
          addItem({ ...rest, thumbnailUrl: thumbnailUrl || undefined }),
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

  // Mode label for top bar — TODO i18n
  const modeLabel = mode === 'product' ? 'SCAN TAG' : 'SCAN RECEIPT';

  if (needsGate) {
    // No-op onStarted: starting the trip flips `startedAt`, so this component
    // re-renders and naturally falls through to the camera view.
    return <TripGate onStarted={() => undefined} />;
  }

  return (
    <div className="relative flex h-full flex-col bg-neutral-900 overflow-hidden">
      {/* ── Top header (over camera, z-10) ───────────────────────── */}
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
            {modeLabel}
          </div>

          {/* Flash (product) / Grid (receipt) */}
          <div className="relative">
            <RoundButton
              icon={mode === 'product' ? 'flash' : 'grid'}
              tone="surface"
              aria-label={mode === 'product' ? 'Flash' : 'Grid'}
            />
            {/* Pending count badge */}
            {pendingCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-page/80 text-[9px] font-bold text-white">
                {pendingCount}
              </span>
            )}
          </div>
        </div>

        {/* Mode toggle pill */}
        <div className="flex justify-center pb-2">
          <ModeToggle mode={mode} onChange={setMode} />
        </div>
      </div>

      {/* ── Live camera (fills entire screen behind overlays) ────── */}
      <div className="flex-1">
        <CameraCapture onCapture={handleCapture} />
      </div>

      {/* ── Bottom area: cart-info card ───────────────────────────── */}
      <div className="absolute inset-x-0 bottom-0 z-20 px-[22px] pb-safe pb-6">
        <CartInfoCard
          count={items.length}
          symbol={symbol}
          total={total}
          onClick={() => navigate('/cart')}
        />
      </div>

      {/* ── Toast (capture feedback) ──────────────────────────────── */}
      {toast && (
        <div className="pointer-events-none absolute inset-x-0 top-28 z-30 flex justify-center animate-pop-in">
          <div className="flex items-center gap-2 rounded-full bg-page/95 px-4 py-2 text-xs font-bold text-white shadow-hero">
            <TIcon name="check" size={14} strokeWidth={2.6} />
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ModeToggle ─────────────────────────────────────────────────────────────
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
      className="flex gap-0 rounded-full bg-white p-1 shadow-sm"
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
      className={[
        'rounded-full px-4 py-1.5 text-xs font-bold transition',
        active ? 'bg-page text-white' : 'text-ink-60',
      ].join(' ')}
    >
      {label}
    </button>
  );
}

// ─── CartInfoCard ────────────────────────────────────────────────────────────
function CartInfoCard({
  count,
  symbol,
  total,
  onClick,
}: {
  count: number;
  symbol: string;
  total: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-2.5 rounded-[18px] bg-white p-3 text-left shadow-sm active:scale-[0.98] transition"
    >
      {/* Cart icon in page-colored rounded square */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-page">
        <TIcon name="cart" size={18} className="text-white" />
      </div>

      {/* Label + count/total */}
      <div className="flex-1 min-w-0">
        {/* TODO i18n */}
        <div className="text-[11px] text-ink-60">已加入購物車</div>
        <div className="text-sm font-bold text-ink">
          {/* TODO i18n unit */}
          {count} 件&nbsp;&middot;&nbsp;
          <span className="font-num">{symbol}&nbsp;{total.toLocaleString()}</span>
        </div>
      </div>

      {/* Chevron */}
      <TIcon name="chev" size={16} className="shrink-0 text-ink-60" />
    </button>
  );
}
