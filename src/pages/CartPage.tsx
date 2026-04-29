import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCartStore, type PendingItem } from '../store/cart';
import { useBaseCurrency } from '../hooks/useBaseCurrency';
import { useFxPreview } from '../hooks/useFxPreview';
import { useBudget, classifyBudget } from '../hooks/useBudget';
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
        <RoundButton icon="chevL" onClick={() => navigate(-1)} aria-label="返回" /> {/* TODO i18n: common.back */}
        <span className="text-[11px] font-bold tracking-[4px] text-ink-60 uppercase">
          CART HELPER
        </span>
        <RoundButton icon="edit" aria-label="編輯" /> {/* TODO i18n: common.edit */}
      </div>

      {/* Title block */}
      <div className="px-5 pb-2 pt-1">
        <h1
          className="text-2xl font-bold leading-tight text-ink"
          style={{ letterSpacing: '-0.3px' }}
        >
          {t('nav.cart')}
        </h1>
        {/* TODO i18n: "件" unit */}
        <p className="text-2xs text-ink-60">
          {totalCount} 件
        </p>
      </div>

      {/* Filter chip row — v1: single "全部 N" active chip */}
      <div className="flex gap-2 overflow-x-auto px-5 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* TODO i18n: "全部" label */}
        <span className="whitespace-nowrap rounded-full bg-ink px-3.5 py-1.5 text-xs font-bold text-white">
          全部 {items.length}
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
  const pricePerUnit =
    item.unitPrice == null
      ? unknownPriceLabel
      : `${symbol}${item.unitPrice.toLocaleString()}/件`; // TODO i18n: 件

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
          {/* TODO i18n */}預算 {symbol}{budget.toLocaleString()}
        </span>
        <span className={`font-bold ${labelColor}`}>
          {state === 'over'
            ? <>{/* TODO i18n */}超支 {symbol}{overshoot.toLocaleString()}</>
            : `${pct}%`}
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
