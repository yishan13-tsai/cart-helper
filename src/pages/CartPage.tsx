import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '../store/cart';
import { useBaseCurrency } from '../hooks/useBaseCurrency';
import { useFxPreview } from '../hooks/useFxPreview';
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
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total);
  const currency = useCartStore((s) => s.currency);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateItem = useCartStore((s) => s.updateItem);

  const [base] = useBaseCurrency();
  const fx = useFxPreview(total, currency, base);

  const symbol = currencySymbol(t, currency);
  const baseSymbol = currencySymbol(t, base);
  const showFx = base !== currency && items.length > 0;

  return (
    <section className="flex min-h-full flex-col">
      <Hero
        total={total}
        count={items.length}
        symbol={symbol}
        estimated={t('cart.estimated')}
        unit={t('cart.items_count', { n: items.length })}
        fxLine={
          showFx ? <FxLine fx={fx} base={base} baseSymbol={baseSymbol} /> : null
        }
      />

      <div className="flex-1 px-4 py-3">
        {items.length === 0 ? (
          <EmptyState
            title={t('cart.empty.title')}
            subtitle={t('cart.empty.subtitle')}
          />
        ) : (
          <>
            <p className="mb-2 text-xs font-bold text-neutral-700">
              {t('cart.itemsHeader')}
            </p>
            <ul className="divide-y divide-neutral-100 rounded-xl bg-neutral-0">
              {items.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  symbol={symbol}
                  unknownPriceLabel={t('cart.item.unknownPrice')}
                  removeLabel={t('cart.item.remove')}
                  onRemove={() => removeItem(item.id)}
                  onQuantityChange={(qty) => updateItem(item.id, { quantity: qty })}
                />
              ))}
            </ul>
          </>
        )}
      </div>

      <ActionBar
        continueLabel={t('cart.actions.continueScan')}
        compareLabel={t('cart.actions.compareReceipt')}
        compareDisabled={items.length === 0}
      />
    </section>
  );
}

function Hero({
  total,
  count,
  symbol,
  estimated,
  unit,
  fxLine,
}: {
  total: number;
  count: number;
  symbol: string;
  estimated: string;
  unit: string;
  fxLine: React.ReactNode;
}) {
  return (
    <div className="bg-neutral-0 px-4 py-8 text-center">
      <div className="font-mono text-[44px] leading-none text-primary-500">
        {symbol} {total.toLocaleString()}
      </div>
      {fxLine}
      <p className="mt-2 text-2xs text-neutral-400">
        {count > 0 ? `${unit} · ${estimated}` : estimated}
      </p>
    </div>
  );
}

function FxLine({
  fx,
  base,
  baseSymbol,
}: {
  fx: ReturnType<typeof useFxPreview>;
  base: string;
  baseSymbol: string;
}) {
  const { t } = useTranslation();
  if (fx.loading && fx.amount == null) {
    return <p className="mt-1 text-xs text-neutral-400">…</p>;
  }
  if (fx.error) {
    return <p className="mt-1 text-xs text-danger-500">{t('cart.fxError')}</p>;
  }
  if (fx.amount == null) return null;
  const formatted = fx.amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return (
    <p className="mt-1 text-xs text-neutral-700">
      {t('cart.fxApprox', { symbol: baseSymbol, amount: formatted, currency: base })}
      {fx.stale && (
        <span className="ml-1 text-neutral-400">{t('cart.fxStale')}</span>
      )}
    </p>
  );
}

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="rounded-xl bg-neutral-100 p-6 text-center">
      <p className="text-base font-bold text-secondary-500">{title}</p>
      <p className="mt-1 text-sm text-neutral-700">{subtitle}</p>
    </div>
  );
}

function ItemRow({
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
  const line =
    item.unitPrice == null ? null : (item.unitPrice * item.quantity).toLocaleString();
  return (
    <li className="flex items-center gap-3 px-3 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-neutral-900">{item.name}</p>
        <p className="mt-0.5 font-mono text-xs text-neutral-700">
          {item.unitPrice == null
            ? unknownPriceLabel
            : `${symbol} ${item.unitPrice.toLocaleString()}`}
          {' × '}
          <QuantityStepper value={item.quantity} onChange={onQuantityChange} />
        </p>
      </div>
      <div className="text-right">
        <p className="font-mono text-sm font-bold text-secondary-500">
          {line == null ? unknownPriceLabel : `${symbol} ${line}`}
        </p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label={removeLabel}
        className="ml-1 px-2 py-1 text-xs text-danger-500"
      >
        🗑
      </button>
    </li>
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
    <input
      type="number"
      inputMode="numeric"
      min={1}
      value={value}
      onChange={(e) => {
        const next = Math.max(1, Number(e.target.value) || 1);
        onChange(next);
      }}
      className="w-12 rounded bg-neutral-100 px-1 py-0.5 text-center font-mono text-xs"
    />
  );
}

function ActionBar({
  continueLabel,
  compareLabel,
  compareDisabled,
}: {
  continueLabel: string;
  compareLabel: string;
  compareDisabled: boolean;
}) {
  return (
    <div className="sticky bottom-0 z-10 flex gap-2 border-t border-neutral-100 bg-neutral-0 px-4 py-3">
      <Link
        to="/"
        className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-primary-500 px-3 py-3 text-sm font-bold text-primary-500"
      >
        <span aria-hidden>📷</span>
        {continueLabel}
      </Link>
      <Link
        to="/receipt/capture"
        aria-disabled={compareDisabled}
        onClick={(e) => {
          if (compareDisabled) e.preventDefault();
        }}
        className={`flex flex-1 items-center justify-center gap-1 rounded-xl px-3 py-3 text-sm font-bold ${
          compareDisabled
            ? 'bg-neutral-100 text-neutral-400'
            : 'bg-primary-500 text-neutral-0'
        }`}
      >
        <span aria-hidden>🧾</span>
        {compareLabel}
      </Link>
    </div>
  );
}
