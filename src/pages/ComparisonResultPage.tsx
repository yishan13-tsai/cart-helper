import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useHistoryStore } from '../store/history';
import { useCartStore } from '../store/cart';
import { currencySymbol, formatAmount } from '../lib/format';
import { RoundButton } from '../components/RoundButton';
import { Pill } from '../components/Pill';
import type { CartItem, ComparisonResult, Currency } from '../types';

// ─── helpers ───────────────────────────────────────────────────────────────

/** Format savedAt timestamp as MM/DD */
function fmtDate(ts: number): string {
  const d = new Date(ts);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${mm}/${dd}`;
}

// Status dot colors (matches design token names mapped to Tailwind classes)
const DOT_CLASS: Record<'ok' | 'miss' | 'extra', string> = {
  ok: 'bg-success',
  miss: 'bg-warn',
  extra: 'bg-chip-2',
};

// ─── item card ─────────────────────────────────────────────────────────────

function ItemCard({
  item,
  status,
  currency,
  locale,
}: {
  item: CartItem;
  status: 'ok' | 'miss' | 'extra';
  currency: Currency;
  locale: string;
}) {
  const sym = currencySymbol(currency);
  const total =
    item.unitPrice == null ? null : item.unitPrice * item.quantity;

  return (
    <div className="relative bg-white rounded-[14px] p-2">
      {/* status dot — absolute top-right */}
      <span
        className={`absolute -top-[1px] -right-[1px] h-2 w-2 rounded-full border-[1.5px] border-bg ${DOT_CLASS[status]}`}
      />
      <p
        className="text-[11.5px] font-bold text-ink leading-snug"
        style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
      >
        {item.name}
      </p>
      <div className="mt-1 flex items-center justify-between">
        <span className="text-[10px] text-ink-60">×{item.quantity}</span>
        <span className="font-num text-[12px] font-bold text-ink">
          {sym}
          {total == null ? '—' : formatAmount(total, locale)}
        </span>
      </div>
    </div>
  );
}

// ─── column ────────────────────────────────────────────────────────────────

function Col({
  sub,
  title,
  total,
  items,
  statusMap,
  accent,
  currency,
  locale,
}: {
  sub: string;
  title: string;
  total: number;
  items: CartItem[];
  statusMap: Map<string, 'ok' | 'miss' | 'extra'>;
  accent: 'border-page' | 'border-chip-2';
  currency: Currency;
  locale: string;
}) {
  const sym = currencySymbol(currency);

  return (
    <div className="flex flex-1 flex-col gap-2 min-w-0">
      {/* column header card */}
      <div className={`bg-white rounded-[18px] p-3 border-t-[3px] ${accent}`}>
        <p className="text-[10px] font-bold text-ink-60 tracking-[0.04em] uppercase">{sub}</p>
        <p className="mt-0.5 text-sm font-extrabold text-ink">{title}</p>
        <p className="mt-1 font-num text-base font-extrabold text-ink">
          <span className="text-[11px] opacity-60">{sym}</span>
          {formatAmount(total, locale)}
        </p>
      </div>

      {/* item cards */}
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          status={statusMap.get(item.id) ?? 'ok'}
          currency={currency}
          locale={locale}
        />
      ))}
    </div>
  );
}

// ─── page ──────────────────────────────────────────────────────────────────

export function ComparisonResultPage() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const entry = useHistoryStore((s) => (id ? s.getEntry(id) : undefined));
  const clearCart = useCartStore((s) => s.clear);

  if (!entry || !entry.comparison) {
    return (
      <section className="flex h-full flex-col items-center justify-center p-8 text-center">
        <h2 className="text-xl font-bold text-ink-60">
          {t('history.notFound.title')}
        </h2>
        <Link to="/cart" className="mt-6 px-6 py-2.5 rounded-full bg-page text-white font-bold text-sm">
          {t('history.notFound.cta')}
        </Link>
      </section>
    );
  }

  const result: ComparisonResult = entry.comparison;
  const currency = entry.cart.currency;
  const locale = i18n.language;
  const sym = currencySymbol(currency);

  // Build status maps
  const matchedIds = new Set(result.matched.map((i) => i.id));
  const missingIds = new Set(result.missingFromReceipt.map((i) => i.id));

  // Cart-side: all cart items (matched + missing)
  const cartItems: CartItem[] = entry.cart.items;
  const cartStatusMap = new Map<string, 'ok' | 'miss' | 'extra'>();
  for (const item of cartItems) {
    if (matchedIds.has(item.id)) cartStatusMap.set(item.id, 'ok');
    else if (missingIds.has(item.id)) cartStatusMap.set(item.id, 'miss');
    else cartStatusMap.set(item.id, 'ok'); // fallback
  }

  // Receipt-side: matched + extra (extras come from receipt, not cart)
  const receiptItems: CartItem[] = [
    ...result.matched,
    ...result.extraOnReceipt,
  ];
  const receiptStatusMap = new Map<string, 'ok' | 'miss' | 'extra'>();
  for (const item of result.matched) receiptStatusMap.set(item.id, 'ok');
  for (const item of result.extraOnReceipt) receiptStatusMap.set(item.id, 'extra');

  // Hero stats
  const diff = result.difference;
  const isMatch = Math.abs(diff) < 0.01;
  const discrepancyCount =
    result.missingFromReceipt.length + result.extraOnReceipt.length;
  const diffTone = isMatch ? 'success' : diff > 0 ? 'alert' : 'warn';
  const diffColorClass = isMatch
    ? 'text-success'
    : diff > 0
      ? 'text-alert'
      : 'text-warn';

  const diffLabel = isMatch
    ? t('comparison.differenceMatch')
    : `${diff > 0 ? '+' : '−'}${sym}${formatAmount(Math.abs(diff), locale)}`;

  // Store name + date subline
  const storeName = entry.cart.store ?? t('history.entry.defaultStore');
  const dateLabel = fmtDate(entry.savedAt);
  const subLine = storeName ? `${storeName} · ${dateLabel}` : dateLabel;

  const onStartOver = () => {
    clearCart();
    navigate('/');
  };

  return (
    <div className="flex min-h-full flex-col bg-bg text-ink">
      {/* ── header ── */}
      <header className="flex items-center justify-between px-4 pt-4 pb-3">
        <RoundButton icon="chevL" onClick={() => navigate(-1)} aria-label="back" />
        <span className="text-[11px] font-extrabold tracking-[0.18em] text-ink-60 uppercase">
          CART HELPER
        </span>
        <RoundButton icon="info" aria-label="info" />
      </header>

      {/* ── title block ── */}
      <div className="px-6 pb-3 text-center">
        <h1 className="text-2xl font-bold text-ink tracking-tight">
          {t('comparison.title')}
        </h1>
        <p className="mt-0.5 text-[12px] text-ink-60">{subLine}</p>
      </div>

      {/* ── hero summary card ── */}
      <div className="px-5 pb-3">
        <div className="bg-surface rounded-3xl p-4">
          {/* top row: diff + pill */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[11px] font-semibold text-ink-60">{t('comparison.totalDiff' as any)}</p>
              <p className={`font-num text-2xl font-extrabold tracking-tight ${diffColorClass}`}>
                {diffLabel}
              </p>
            </div>
            <Pill tone={diffTone}>
              {discrepancyCount > 0 ? t('comparison.discrepancyCount' as any, { n: discrepancyCount }) : t('comparison.differenceMatch' as any)}
            </Pill>
          </div>

          {/* bottom row: 4-column stats grid */}
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { key: 'matched', count: result.matched.length, colorClass: 'text-success' },
              { key: 'priceDiff', count: 0, colorClass: 'text-alert' },
              { key: 'missing', count: result.missingFromReceipt.length, colorClass: 'text-warn' },
              { key: 'extra', count: result.extraOnReceipt.length, colorClass: 'text-chip-2' },
            ].map(({ key, count, colorClass }) => (
              <div
                key={key}
                className="bg-white rounded-[12px] py-2 px-1.5 text-center"
              >
                <p className={`font-num text-base font-extrabold ${colorClass}`}>{count}</p>
                <p className={`text-[10px] font-bold ${colorClass}`}>{t(`comparison.counts.${key}` as any)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── side-by-side columns ── */}
      <div className="flex gap-2 px-4 pb-6 animate-slide-up">
        <Col
          sub={t('comparison.cartSub' as any)}
          title={t('comparison.cartLabel' as any)}
          total={result.totalInCart}
          items={cartItems}
          statusMap={cartStatusMap}
          accent="border-page"
          currency={currency}
          locale={locale}
        />
        <Col
          sub={t('comparison.receiptSub' as any)}
          title={t('comparison.receiptLabel' as any)}
          total={result.totalOnReceipt}
          items={receiptItems}
          statusMap={receiptStatusMap}
          accent="border-chip-2"
          currency={currency}
          locale={locale}
        />
      </div>

      {/* ── sticky bottom bar ── */}
      <div className="sticky bottom-0 z-10 flex gap-2 border-t border-ink-10 bg-bg/95 px-4 py-3 shadow-nav backdrop-blur">
        <Link
          to="/cart"
          className="flex-1 text-center rounded-full border border-ink-10 bg-white py-2.5 text-sm font-bold text-ink"
        >
          {t('comparison.backToCart')}
        </Link>
        <button
          type="button"
          onClick={onStartOver}
          className="flex-1 rounded-full bg-primary-gradient py-2.5 text-sm font-bold text-white shadow-hero"
        >
          {t('comparison.startOver')}
        </button>
      </div>
    </div>
  );
}
