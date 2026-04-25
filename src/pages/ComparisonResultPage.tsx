import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useHistoryStore } from '../store/history';
import { useCartStore } from '../store/cart';
import { currencySymbol, formatAmount } from '../lib/format';
import type { CartItem, ComparisonResult, Currency } from '../types';

export function ComparisonResultPage() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const entry = useHistoryStore((s) => (id ? s.getEntry(id) : undefined));
  const clearCart = useCartStore((s) => s.clear);

  if (!entry || !entry.comparison) {
    return (
      <section className="flex h-full flex-col items-center justify-center p-8 text-center">
        <h2 className="text-xl font-bold text-secondary-500">
          {t('history.notFound.title')}
        </h2>
        <Link
          to="/cart"
          className="mt-6 rounded-lg bg-primary-500 px-6 py-3 text-sm font-bold text-neutral-0"
        >
          {t('history.notFound.cta')}
        </Link>
      </section>
    );
  }

  const result = entry.comparison;
  const currency = entry.cart.currency;
  const onStartOver = () => {
    clearCart();
    navigate('/');
  };

  return (
    <section className="flex min-h-full flex-col bg-neutral-100">
      <SummaryHero result={result} currency={currency} locale={i18n.language} />
      <div className="flex-1 space-y-3 px-4 pb-24 pt-4">
        <Section
          title={t('comparison.sections.matched', { n: result.matched.length })}
          tone="success"
          items={result.matched}
          currency={currency}
          locale={i18n.language}
          emptyLabel={t('comparison.sectionEmpty')}
        />
        <Section
          title={t('comparison.sections.missing', { n: result.missingFromReceipt.length })}
          tone="warning"
          items={result.missingFromReceipt}
          currency={currency}
          locale={i18n.language}
          emptyLabel={t('comparison.sectionEmpty')}
        />
        <Section
          title={t('comparison.sections.extra', { n: result.extraOnReceipt.length })}
          tone="danger"
          items={result.extraOnReceipt as CartItem[]}
          currency={currency}
          locale={i18n.language}
          emptyLabel={t('comparison.sectionEmpty')}
        />
      </div>
      <div className="sticky bottom-0 z-10 flex gap-2 border-t border-neutral-100 bg-neutral-0 px-4 py-3">
        <Link
          to="/cart"
          className="flex flex-1 items-center justify-center rounded-xl border border-primary-500 px-3 py-3 text-sm font-bold text-primary-500"
        >
          {t('comparison.backToCart')}
        </Link>
        <button
          type="button"
          onClick={onStartOver}
          className="flex flex-1 items-center justify-center rounded-xl bg-primary-500 px-3 py-3 text-sm font-bold text-neutral-0"
        >
          {t('comparison.startOver')}
        </button>
      </div>
    </section>
  );
}

function SummaryHero({
  result,
  currency,
  locale,
}: {
  result: ComparisonResult;
  currency: Currency;
  locale: string;
}) {
  const { t } = useTranslation();
  const symbol = currencySymbol(currency);
  const diff = result.difference;
  const isMatch = Math.abs(diff) < 0.01;

  return (
    <div className="bg-neutral-0 px-4 pb-4 pt-6 text-center">
      <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-400">
        {t('comparison.title')}
      </h2>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-neutral-700">{t('comparison.cartTotal')}</p>
          <p className="font-mono text-xl font-bold text-secondary-500">
            {symbol}
            {formatAmount(result.totalInCart, locale)}
          </p>
        </div>
        <div>
          <p className="text-xs text-neutral-700">{t('comparison.receiptTotal')}</p>
          <p className="font-mono text-xl font-bold text-secondary-500">
            {symbol}
            {formatAmount(result.totalOnReceipt, locale)}
          </p>
        </div>
      </div>
      <div
        className={`mt-4 rounded-xl px-4 py-3 ${
          isMatch ? 'bg-success-500/10 text-success-500' : 'bg-accent-500/10 text-accent-500'
        }`}
      >
        <p className="text-xs">{t('comparison.difference')}</p>
        <p className="font-mono text-2xl font-bold">
          {isMatch ? (
            t('comparison.differenceMatch')
          ) : (
            <>
              {diff > 0 ? '+' : '−'}
              {symbol}
              {formatAmount(Math.abs(diff), locale)}
            </>
          )}
        </p>
      </div>
    </div>
  );
}

function Section({
  title,
  tone,
  items,
  currency,
  locale,
  emptyLabel,
}: {
  title: string;
  tone: 'success' | 'warning' | 'danger';
  items: CartItem[];
  currency: Currency;
  locale: string;
  emptyLabel: string;
}) {
  const [open, setOpen] = useState(items.length > 0);
  const symbol = currencySymbol(currency);
  const toneClass = TONE_CLASSES[tone];

  return (
    <div className="overflow-hidden rounded-xl bg-neutral-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3"
      >
        <span className={`text-sm font-bold ${toneClass.text}`}>
          {toneClass.icon} {title}
        </span>
        <span className="text-neutral-400">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <ul className="border-t border-neutral-100 divide-y divide-neutral-100">
          {items.length === 0 ? (
            <li className="px-4 py-3 text-sm text-neutral-400">{emptyLabel}</li>
          ) : (
            items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 px-4 py-2"
              >
                <span className="truncate text-sm text-neutral-900">{item.name}</span>
                <span className="font-mono text-xs text-neutral-700">
                  {symbol}
                  {item.unitPrice == null
                    ? '—'
                    : formatAmount(item.unitPrice * item.quantity, locale)}
                </span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

const TONE_CLASSES = {
  success: { text: 'text-success-500', icon: '✅' },
  warning: { text: 'text-warning-500', icon: '⚠️' },
  danger: { text: 'text-danger-500', icon: '❗' },
} as const;
