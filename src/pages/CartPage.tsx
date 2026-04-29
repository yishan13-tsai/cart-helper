import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCartStore, type PendingItem } from '../store/cart';
import { useBaseCurrency } from '../hooks/useBaseCurrency';
import { useFxPreview } from '../hooks/useFxPreview';
import { useBudget, classifyBudget } from '../hooks/useBudget';
import { usePriceTrend } from '../hooks/usePriceTrend';
import { RoundButton } from '../components/RoundButton';
import { Btn } from '../components/Btn';
import { TIcon } from '../components/TIcon';
import type { CartItem } from '../types';

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

  const [base] = useBaseCurrency();
  const fx = useFxPreview(total, currency, base);
  const [budget] = useBudget();
  const budgetState = classifyBudget(total, budget);

  const symbol = currencySymbol(t, currency);
  const baseSymbol = currencySymbol(t, base);
  const showFx = base !== currency && items.length > 0;

  const totalCount = items.reduce((sum, it) => sum + it.quantity, 0);

  return (
    <div className="relative flex min-h-full flex-col bg-bg">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <RoundButton icon="chevL" onClick={() => navigate(-1)} aria-label={t('common.back')} />
        <span className="text-[11px] font-bold tracking-[4px] text-ink-60 uppercase">
          CART HELPER
        </span>
        <RoundButton icon="edit" aria-label={t('common.edit')} />
      </div>

      {/* Title block */}
      <div className="px-5 pb-2 pt-1">
        <h1
          className="text-2xl font-bold leading-tight text-ink"
          style={{ letterSpacing: '-0.3px' }}
        >
          {t('nav.cart')}
        </h1>
        <p className="text-2xs text-ink-60">
          {t('cart.items_count' as any, { n: totalCount })}
        </p>
      </div>

      {/* Filter chip row — v1: single "全部 N" active chip */}
      <div className="flex gap-2 overflow-x-auto px-5 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <span className="whitespace-nowrap rounded-full bg-ink px-3.5 py-1.5 text-xs font-bold text-white">
          {t('cart.filters.all')} {items.length}
        </span>
      </div>

      {/* Scrollable list area — bottom padding makes room for the floating card */}
      <div className="flex-1 space-y-2 px-4 pb-44 pt-1">
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
          />
        ))}
      </div>

      {/* Floating bottom subtotal card */}
      <div className="absolute bottom-7 left-4 right-4 rounded-3xl bg-white p-4 shadow-nav">
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

          {/* FX preview if base != cart currency */}
          {showFx && <FxChip fx={fx} baseSymbol={baseSymbol} base={base} />}
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
}: {
  item: CartItem;
  symbol: string;
  unknownPriceLabel: string;
  removeLabel: string;
  onRemove: () => void;
  onQuantityChange: (qty: number) => void;
}) {
  const { t } = useTranslation();
  const trend = usePriceTrend(item);

  const pricePerUnit =
    item.unitPrice == null
      ? unknownPriceLabel
      : `${symbol}${item.unitPrice.toLocaleString()}/${t('common.unit.itemUnit', '件')}`;

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
        <p className="mt-0.5 text-[11px] text-ink-60">{pricePerUnit}</p>
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

function FxChip({
  fx,
  baseSymbol,
  base,
}: {
  fx: ReturnType<typeof useFxPreview>;
  baseSymbol: string;
  base: string;
}) {
  const { t } = useTranslation();

  if (fx.loading && fx.amount == null) {
    return <span className="text-2xs text-ink-30">…</span>;
  }
  if (fx.error) {
    return <span className="text-2xs text-alert">{t('cart.fxError')}</span>;
  }
  if (fx.amount == null) return null;

  const formatted = fx.amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-2xs font-bold text-page">
      ≈&nbsp;{baseSymbol}{formatted}&nbsp;{base}
      {fx.stale && (
        <span className="opacity-60">{t('cart.fxStale')}</span>
      )}
    </span>
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
