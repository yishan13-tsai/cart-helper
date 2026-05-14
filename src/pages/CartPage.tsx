import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCartStore, type PendingItem } from '../store/cart';
import { useFxAll, TRAVEL_CURRENCIES } from '../hooks/useFxAll';
import { useBaseCurrency } from '../hooks/useBaseCurrency';
import { useBudget, classifyBudget } from '../hooks/useBudget';
import { usePriceTrend } from '../hooks/usePriceTrend';
import { parsePromotion } from '../lib/promotion';
import { formatAmount } from '../lib/format';
import { fetchRates, convert, normalizeCurrency } from '../lib/fx';
import type { RateTable } from '../lib/fx';
import { RoundButton } from '../components/RoundButton';
import { Btn } from '../components/Btn';
import { TIcon } from '../components/TIcon';
import type { CartItem } from '../types';
import type { Currency } from '../types';

type TFn = ReturnType<typeof useTranslation>['t'];

function currencySymbol(t: TFn, code: string): string {
  switch (code) {
    case 'TWD':
      return t('common.currency.TWD');
    case 'USD':
      return t('common.currency.USD');
    case 'JPY':
      return t('common.currency.JPY');
    case 'KRW':
      return t('common.currency.KRW');
    default:
      return code;
  }
}

export function CartPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total);
  const currency = useCartStore((s) => s.currency);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateItem = useCartStore((s) => s.updateItem);
  const pendingItems = useCartStore((s) => s.pendingItems);
  const removePending = useCartStore((s) => s.removePending);
  const endTrip = useCartStore((s) => s.endTrip);
  const startedAt = useCartStore((s) => s.startedAt);

  const setCurrency = useCartStore((s) => s.setCurrency);
  const fxAll = useFxAll(total, currency);
  const [budget] = useBudget();
  const budgetState = classifyBudget(total, budget);

  const symbol = currencySymbol(t, currency);
  const showFxBar = items.length > 0;

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-bg">
      {/* Header — kept tight; the right slot is intentionally empty for now
          (the design's "edit" button had no real purpose in our app). */}
      <div className="flex shrink-0 items-center justify-between px-5 pt-4 pb-2">
        <RoundButton icon="chevL" onClick={() => navigate(-1)} aria-label={t('common.back')} />
        <span className="text-[11px] font-bold tracking-[4px] text-ink-60 uppercase">
          CART HELPER
        </span>
        <CurrencyPicker currency={currency} onSelect={setCurrency} />
      </div>

      {/* Title block — count = distinct products. Filter chip removed; with
          a single "All N" chip it just duplicated the count. */}
      <div className="shrink-0 px-5 pb-3 pt-1">
        <h1
          className="text-2xl font-bold leading-tight text-ink"
          style={{ letterSpacing: '-0.3px' }}
        >
          {t('nav.cart')}
        </h1>
        <p className="text-2xs text-ink-60">
          {t('cart.items_count' as any, { n: items.length })}
        </p>
      </div>

      {/* Scrollable list area — only this region scrolls; the subtotal card
          sits in the static portion below so it always stays in view.
          `min-h-0` is the magic flexbox bit: without it, flex-1 children
          inside an `overflow-hidden` parent fail to shrink below their
          content height and the scroll bubbles up to the page. */}
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 pb-4 pt-1">
        {/* Pending items */}
        {pendingItems.length > 0 && (
          <PendingList items={pendingItems} onDismiss={removePending} />
        )}

        {/* Empty state */}
        {items.length === 0 && pendingItems.length === 0 && (
          <EmptyState
            title={t('cart.empty.title')}
            subtitle={t('cart.empty.subtitle')}
          />
        )}

        {/* Item cards */}
        {items.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            symbol={symbol}
            unknownPriceLabel={t('cart.item.unknownPrice')}
            removeLabel={t('cart.item.remove')}
            onRemove={() => removeItem(item.id)}
            onQuantityChange={(qty) => updateItem(item.id, { quantity: qty })}
            onPriceChange={(price) =>
              updateItem(item.id, { unitPrice: price, priceEdited: true })
            }
            onPriceRevert={() =>
              updateItem(item.id, {
                unitPrice: item.originalUnitPrice ?? null,
                priceEdited: false,
              })
            }
            onPromotionToggle={() =>
              updateItem(item.id, { promotionApplied: !item.promotionApplied })
            }
          />
        ))}
      </div>

      {/* Subtotal card — outside the scroll region so it always stays visible
          above the bottom nav. The bottom padding clears the floating SCAN
          button (h-16, -translate-y-1/2 → pokes ~32px above the nav), so the
          "End shopping trip" link below the CTA never gets overlapped. */}
      <div className="shrink-0 px-4 pb-10 pt-2">
        <div className="rounded-3xl bg-white p-4 shadow-nav">
        {/* Total row */}
        <div className="mb-3 flex items-baseline justify-between">
          <span
            className={`font-num text-2xl font-extrabold ${
              budgetState === 'over' ? 'text-alert' : 'text-ink'
            }`}
            style={{ letterSpacing: '-0.5px' }}
          >
            <span className="mr-1 text-sm font-bold opacity-60">{symbol}</span>
            {total.toLocaleString()}
          </span>

          {/* Multi-currency FX row */}
          {showFxBar && <FxBar fxAll={fxAll} cartCurrency={currency} t={t} />}
        </div>

        {/* Budget bar — shown only when user set one */}
        {budget != null && items.length > 0 && (
          <BudgetBar
            total={total}
            budget={budget}
            symbol={symbol}
            state={budgetState}
          />
        )}

        {/* CTA */}
        <Btn
          icon="receipt"
          disabled={items.length === 0}
          onClick={() => {
            if (items.length > 0) navigate('/receipt/capture');
          }}
          className={items.length === 0 ? 'opacity-50' : ''}
        >
          {t('cart.actions.compareReceipt')}
        </Btn>

        {/* End trip — only show when there's an active trip the user can close.
            Confirms first because endTrip() archives the cart to history. */}
        {(startedAt > 0 || items.length > 0) && (
          <button
            type="button"
            onClick={() => {
              const ok = window.confirm(t('cart.actions.endTripConfirm'));
              if (!ok) return;
              endTrip();
              navigate('/');
            }}
            className="mt-2 w-full text-center text-2xs font-bold text-ink-60 underline-offset-2 hover:underline"
          >
            {t('cart.actions.endTrip')}
          </button>
        )}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function PendingList({
  items,
  onDismiss,
}: {
  items: PendingItem[];
  onDismiss: (id: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="animate-slide-up">
      <p className="section-label mb-2 px-1">{t('cart.pendingHeader')}</p>
      <ul className="space-y-2">
        {items.map((p) => (
          <li
            key={p.id}
            className={`flex items-center gap-3 rounded-[18px] bg-white p-3 shadow-card ${
              p.status === 'failed' ? 'border-r-4 border-alert' : ''
            }`}
          >
            {/* Thumbnail */}
            {p.thumbnailUrl ? (
              <img
                src={p.thumbnailUrl}
                alt=""
                className="h-12 w-12 flex-shrink-0 rounded-[14px] object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[14px] bg-surface text-page">
                <TIcon name="cart" size={22} />
              </div>
            )}

            <div className="min-w-0 flex-1">
              {p.status === 'recognizing' ? (
                <>
                  <p className="flex items-center gap-2 text-sm font-bold text-page">
                    <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-page border-t-transparent" />
                    {t('cart.pending.recognizing')}
                  </p>
                  <p className="text-2xs text-ink-60">
                    {t('cart.pending.subtitle')}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-bold text-alert">
                    {t('cart.pending.failed')}
                  </p>
                  <p className="truncate text-2xs text-ink-60">
                    {p.error ?? '—'}
                  </p>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => onDismiss(p.id)}
              aria-label={t('cart.pending.dismiss')}
              className="flex h-8 w-8 items-center justify-center rounded-full text-ink-30 hover:bg-surface hover:text-alert"
            >
              <TIcon name="x" size={14} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mt-8 flex flex-col items-center px-6 py-12 text-center">
      <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-surface text-page">
        <TIcon name="cart" size={28} />
      </div>
      <p className="text-base font-bold text-ink">{title}</p>
      <p className="mt-1 text-sm text-ink-60">{subtitle}</p>
    </div>
  );
}

function ItemCard({
  item,
  symbol,
  unknownPriceLabel,
  removeLabel,
  onRemove,
  onQuantityChange,
  onPriceChange,
  onPriceRevert,
  onPromotionToggle,
}: {
  item: CartItem;
  symbol: string;
  unknownPriceLabel: string;
  removeLabel: string;
  onRemove: () => void;
  onQuantityChange: (qty: number) => void;
  onPriceChange: (price: number | null) => void;
  onPriceRevert: () => void;
  onPromotionToggle: () => void;
}) {
  const { t } = useTranslation();
  const trend = usePriceTrend(item);

  const unit = t('common.unit.itemUnit', '件');
  const priceText =
    item.unitPrice == null
      ? unknownPriceLabel
      : `${symbol}${item.unitPrice.toLocaleString()}/${unit}`;

  // Whether revert is meaningful: only when user actually edited AND we still
  // hold the original. originalUnitPrice may be undefined for legacy items.
  const canRevert =
    item.priceEdited === true &&
    item.originalUnitPrice != null &&
    item.originalUnitPrice !== item.unitPrice;

  return (
    <div className="flex items-center gap-3 rounded-[18px] bg-white p-3 shadow-card">
      {/* Thumbnail */}
      {item.thumbnailUrl ? (
        <img
          src={item.thumbnailUrl}
          alt=""
          className="h-12 w-12 flex-shrink-0 rounded-[14px] object-cover"
        />
      ) : (
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[14px] bg-surface text-page">
          <TIcon name="cart" size={22} />
        </div>
      )}

      {/* Name + sub */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-bold text-ink">{item.name}</p>

        {/* Editable price line */}
        <PriceLine
          unitPrice={item.unitPrice}
          symbol={symbol}
          unitLabel={unit}
          fallbackLabel={priceText}
          edited={item.priceEdited === true}
          canRevert={canRevert}
          onChange={onPriceChange}
          onRevert={onPriceRevert}
        />

        {/* Promotion toggle — actionable pill (apply / un-apply discount) */}
        {item.promotion && (
          <PromotionToggle
            item={item}
            symbol={symbol}
            onToggle={onPromotionToggle}
          />
        )}

        {trend && trend.verdict !== 'flat' && (
          <PriceTrendPill
            symbol={symbol}
            lastPrice={trend.trend.lastPrice}
            deltaPct={trend.deltaPct}
            verdict={trend.verdict}
          />
        )}
      </div>

      {/* Quantity stepper */}
      <QuantityStepper value={item.quantity} onChange={onQuantityChange} />

      {/* Discreet trash */}
      <button
        type="button"
        onClick={onRemove}
        aria-label={removeLabel}
        className="ml-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-ink-30 transition hover:text-alert"
      >
        <TIcon name="trash" size={14} />
      </button>
    </div>
  );
}

function PromotionToggle({
  item,
  symbol,
  onToggle,
}: {
  item: CartItem;
  symbol: string;
  onToggle: () => void;
}) {
  const { t, i18n } = useTranslation();
  const promo = parsePromotion(item.promotion, item.unitPrice, item.quantity);
  const applied = item.promotionApplied === true;

  // Pattern not parseable (or qty/price doesn't unlock the deal yet) — show
  // the OCR text muted so the user still sees what we read off the tag.
  if (!promo) {
    return (
      <span
        className="mt-1 inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-[10px] font-bold leading-none text-ink-60"
        title={t('cart.promotion.unsupported', '僅供參考，無法自動計算')}
      >
        <TIcon name="sparkle" size={10} strokeWidth={2.4} />
        {item.promotion}
      </span>
    );
  }

  // Round the discount to a whole unit — TWD/JPY/KRW have no fractional unit,
  // and even for USD a $35.60 promo savings reads more as noise than precision.
  const discountText = `${symbol}${formatAmount(promo.discount, i18n.language)}`;
  const tone = applied
    ? 'bg-success-wash text-success'
    : 'bg-warn-wash text-warn hover:brightness-95';
  const label = applied
    ? t('cart.promotion.applied', { savings: discountText })
    : t('cart.promotion.apply', { savings: discountText });

  return (
    <div className="mt-1 flex flex-col gap-0.5">
      {/* Info line: verbatim OCR promotion text */}
      <span className="inline-flex items-center gap-1 text-[10px] leading-none text-ink-60">
        <TIcon name="tag" size={9} strokeWidth={2.2} className="shrink-0" />
        {item.promotion}
      </span>
      {/* Action pill: toggle apply/un-apply */}
      <button
        type="button"
        onClick={onToggle}
        className={`inline-flex w-fit items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold leading-none transition ${tone}`}
      >
        <TIcon name={applied ? 'check' : 'sparkle'} size={10} strokeWidth={2.4} />
        <span>{label}</span>
      </button>
    </div>
  );
}

function PriceLine({
  unitPrice,
  symbol,
  unitLabel,
  fallbackLabel,
  edited,
  canRevert,
  onChange,
  onRevert,
}: {
  unitPrice: number | null;
  symbol: string;
  unitLabel: string;
  fallbackLabel: string;
  edited: boolean;
  canRevert: boolean;
  onChange: (price: number | null) => void;
  onRevert: () => void;
}) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const startEdit = () => {
    setDraft(unitPrice == null ? '' : String(unitPrice));
    setEditing(true);
  };

  const commit = () => {
    setEditing(false);
    // Strip thousands separators and any whitespace before parsing — handles
    // pastes like "1,200" or "  79 " without surprising the user.
    const cleaned = draft.replace(/[,  ]/g, '');
    if (cleaned === '') {
      // Treat empty as "I don't know the price" — clear.
      if (unitPrice != null) onChange(null);
      return;
    }
    const n = Number(cleaned);
    if (Number.isFinite(n) && n >= 0) {
      // Skip no-op edits so we don't mark priceEdited=true unnecessarily.
      if (n !== unitPrice) onChange(n);
    }
  };

  if (editing) {
    return (
      <div className="mt-0.5 flex items-center gap-1">
        <span className="text-[11px] text-ink-60">{symbol}</span>
        <input
          // type=text + inputMode=decimal works more consistently than
          // type=number across iOS/Android (number sometimes hides "."
          // and gives unwanted spinner UI on desktop).
          type="text"
          inputMode="decimal"
          pattern="[0-9.,]*"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit();
            else if (e.key === 'Escape') setEditing(false);
          }}
          autoFocus
          className="w-20 rounded-md border border-page/40 bg-bg px-1.5 py-0.5 text-[11px] font-bold text-ink focus:outline-none focus:ring-1 focus:ring-page"
        />
        <span className="text-[11px] text-ink-60">/{unitLabel}</span>
      </div>
    );
  }

  return (
    <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
      <button
        type="button"
        onClick={startEdit}
        title={t('cart.priceEdit.tapHint', '點擊修改價格')}
        className="inline-flex items-center gap-1 rounded text-[11px] text-ink-60 hover:text-page"
      >
        {fallbackLabel}
        <TIcon name="edit" size={10} className="opacity-50" strokeWidth={2} />
      </button>
      {edited && (
        <span
          className="inline-flex items-center gap-1 rounded-full bg-page/10 px-1.5 py-px text-[9px] font-bold uppercase tracking-wider text-page"
          title={t('cart.priceEdit.editedTitle', '此價格已被修改')}
        >
          {t('cart.priceEdit.editedTag', '已修改')}
        </span>
      )}
      {canRevert && (
        <button
          type="button"
          onClick={onRevert}
          className="text-[10px] font-bold text-ink-60 underline-offset-2 hover:text-page hover:underline"
        >
          {t('cart.priceEdit.revert', '還原')}
        </button>
      )}
    </div>
  );
}

function PriceTrendPill({
  symbol,
  lastPrice,
  deltaPct,
  verdict,
}: {
  symbol: string;
  lastPrice: number;
  deltaPct: number;
  verdict: 'hike' | 'drop';
}) {
  const { t } = useTranslation();
  const sign = deltaPct > 0 ? '+' : '−';
  const pct = Math.round(Math.abs(deltaPct) * 100);
  const tone =
    verdict === 'hike'
      ? 'bg-alert-wash text-alert'
      : 'bg-success-wash text-success';
  const labelKey =
    verdict === 'hike' ? 'cart.priceTrend.hike' : 'cart.priceTrend.drop';
  return (
    <span
      className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold leading-none ${tone}`}
      title={t(labelKey, {
        last: `${symbol}${lastPrice.toLocaleString()}`,
        sign,
        pct,
      })}
    >
      {t(labelKey, {
        last: `${symbol}${lastPrice.toLocaleString()}`,
        sign,
        pct,
      })}
    </span>
  );
}

function QuantityStepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (qty: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-surface text-ink-60 transition active:scale-90"
        aria-label="減少數量"
      >
        <TIcon name="minus" size={12} strokeWidth={2.4} />
      </button>
      <span className="w-4 text-center font-num text-sm font-extrabold text-ink">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-page text-white transition active:scale-90"
        aria-label="增加數量"
      >
        <TIcon name="plus" size={12} strokeWidth={2.4} />
      </button>
    </div>
  );
}

function formatRate(rate: number): string {
  if (rate >= 100) return Math.round(rate).toLocaleString();
  if (rate >= 1) return rate.toFixed(2);
  if (rate >= 0.1) return rate.toFixed(3);
  return rate.toFixed(4);
}

function CurrencyPicker({
  currency,
  onSelect,
}: {
  currency: Currency;
  onSelect: (c: Currency) => void;
}) {
  const { t } = useTranslation();
  const [base] = useBaseCurrency();
  const [open, setOpen] = useState(false);
  const [table, setTable] = useState<RateTable | null>(null);

  useEffect(() => {
    fetchRates(normalizeCurrency(base))
      .then(setTable)
      .catch(() => {});
  }, [base]);

  const sym = currencySymbol(t, currency);
  const baseSym = currencySymbol(t, base);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 items-center gap-1 rounded-full bg-surface px-3 text-[12px] font-bold text-page active:brightness-95"
      >
        <span>{sym}</span>
        <span className="font-mono text-[10px] opacity-70">{currency}</span>
        <TIcon
          name="chev"
          size={11}
          strokeWidth={2.2}
          className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-1.5 w-52 overflow-hidden rounded-2xl bg-white shadow-nav">
            {TRAVEL_CURRENCIES.map((c) => {
              const isSelected = c === currency;
              const cSym = currencySymbol(t, c);
              let rateLabel = '';
              if (c === base) {
                rateLabel = t('cart.currency.base', '基準');
              } else if (table) {
                try {
                  const rate = convert(1, c, base, table);
                  rateLabel = `1${cSym} ≈ ${baseSym}${formatRate(rate)}`;
                } catch {
                  rateLabel = '—';
                }
              } else {
                rateLabel = '…';
              }
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => { onSelect(c as Currency); setOpen(false); }}
                  className={`flex w-full items-center gap-2.5 border-t border-ink/5 px-3.5 py-2.5 text-left first:border-t-0 transition-colors ${
                    isSelected ? 'bg-surface' : 'active:bg-ink-10/40'
                  }`}
                >
                  <div
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                      isSelected ? 'border-page bg-page' : 'border-ink-30'
                    }`}
                  >
                    {isSelected && (
                      <TIcon name="check" size={9} strokeWidth={3} className="text-white" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-semibold text-ink">
                      {cSym}&nbsp;<span className="font-mono text-[11px]">{c}</span>
                    </div>
                    <div className="text-[10px] text-ink-60">{rateLabel}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function FxBar({
  fxAll,
  cartCurrency,
  t,
}: {
  fxAll: ReturnType<typeof useFxAll>;
  cartCurrency: string;
  t: TFn;
}) {
  const targets = TRAVEL_CURRENCIES.filter((c) => c !== cartCurrency);
  if (targets.length === 0) return null;

  return (
    <div className="mb-3 flex items-center gap-2">
      {fxAll.stale && (
        <span className="text-[10px] text-ink-30">{t('cart.fxStale')}</span>
      )}
      {targets.map((code) => {
        const amount = fxAll.amounts[code];
        const sym = currencySymbol(t, code);
        return (
          <span
            key={code}
            className="inline-flex items-center gap-0.5 rounded-full bg-surface px-2 py-0.5 text-[11px] font-semibold text-page"
          >
            {fxAll.loading && amount == null ? (
              <span className="text-ink-30">…</span>
            ) : amount == null ? (
              <span className="text-ink-30">—</span>
            ) : (
              <>≈&nbsp;{sym}{formatAmount(amount, 'en')}</>
            )}
            <span className="ml-0.5 text-[9px] font-bold opacity-50">{code}</span>
          </span>
        );
      })}
    </div>
  );
}

function BudgetBar({
  total,
  budget,
  symbol,
  state,
}: {
  total: number;
  budget: number;
  symbol: string;
  state: ReturnType<typeof classifyBudget>;
}) {
  const { t } = useTranslation();
  const pct = Math.min(100, Math.round((total / budget) * 100));
  const overshoot = Math.max(0, total - budget);
  const barColor =
    state === 'over' ? 'bg-alert' : state === 'warning' ? 'bg-warn' : 'bg-success';
  const labelColor =
    state === 'over' ? 'text-alert' : state === 'warning' ? 'text-warn' : 'text-ink-60';

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between text-2xs">
        <span className="font-bold text-ink-60">
          {t('cart.budget.label' as any, { symbol, budget: budget.toLocaleString() })}
        </span>
        <span className={`font-bold ${labelColor}`}>
          {state === 'over'
            ? <>{t('cart.budget.over' as any, { symbol, overshoot: overshoot.toLocaleString() })}</>
            : t('cart.budget.percent' as any, { percent: pct })}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-ink-10">
        <div
          className={`h-full transition-all duration-300 ${barColor}`}
          style={{ width: `${state === 'over' ? 100 : pct}%` }}
        />
      </div>
    </div>
  );
}
