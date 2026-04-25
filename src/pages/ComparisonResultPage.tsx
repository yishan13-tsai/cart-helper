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
        <Link to="/cart" className="btn-primary mt-6 px-6">
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
    <section className="flex min-h-full flex-col bg-neutral-50">
      <SummaryHero result={result} currency={currency} locale={i18n.language} />
      <div className="flex-1 space-y-3 px-4 pb-24 pt-2 animate-slide-up">
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
      <div className="sticky bottom-0 z-10 flex gap-2 border-t border-neutral-100 bg-neutral-0/95 px-4 py-3 backdrop-blur shadow-nav">
        <Link to="/cart" className="btn-secondary flex-1 text-center">
          {t('comparison.backToCart')}
        </Link>
        <button
          type="button"
          onClick={onStartOver}
          className="btn-primary flex-1 bg-primary-gradient shadow-hero"
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
    <div className="bg-hero-gradient px-4 pb-5 pt-5">
      <p className="section-label mb-3 text-center">{t('comparison.title')}</p>

      <div className="card mb-3 grid grid-cols-2 gap-1 px-4 py-3">
        <div className="border-r border-neutral-100 pr-3 text-center">
          <p className="text-2xs text-neutral-400">{t('comparison.cartTotal')}</p>
          <p className="mt-1 font-mono text-xl font-bold text-secondary-500">
            {symbol}
            {formatAmount(result.totalInCart, locale)}
          </p>
        </div>
        <div className="pl-3 text-center">
          <p className="text-2xs text-neutral-400">{t('comparison.receiptTotal')}</p>
          <p className="mt-1 font-mono text-xl font-bold text-secondary-500">
            {symbol}
            {formatAmount(result.totalOnReceipt, locale)}
          </p>
        </div>
      </div>

      <div
        className={`rounded-2xl px-4 py-4 text-center shadow-card animate-pop-in ${
          isMatch
            ? 'bg-success-500 text-neutral-0'
            : 'bg-accent-500 text-neutral-0'
        }`}
      >
        <p className="text-2xs font-bold uppercase tracking-wider opacity-80">
          {t('comparison.difference')}
        </p>
        <p className="mt-1 font-mono text-3xl font-bold">
          {isMatch ? (
            <span className="text-base">{t('comparison.differenceMatch')} ✓</span>
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
  const tc = TONE_CLASSES[tone];

  return (
    <div className={`card overflow-hidden border-l-4 ${tc.border}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 transition hover:bg-neutral-50"
      >
        <span className={`flex items-center gap-2 text-sm font-bold ${tc.text}`}>
          <span className={`flex h-6 w-6 items-center justify-center rounded-full ${tc.iconBg} text-xs`}>
            {tc.icon}
          </span>
          {title}
        </span>
        <span className="text-neutral-400 text-sm">{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <ul className="border-t border-neutral-100 divide-y divide-neutral-100">
          {items.length === 0 ? (
            <li className="px-4 py-3 text-sm text-neutral-400">{emptyLabel}</li>
          ) : (
            items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 px-4 py-2.5"
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
  success: {
    border: 'border-success-500',
    text: 'text-success-500',
    iconBg: 'bg-success-50',
    icon: '✓',
  },
  warning: {
    border: 'border-warning-500',
    text: 'text-warning-500',
    iconBg: 'bg-warning-50',
    icon: '!',
  },
  danger: {
    border: 'border-danger-500',
    text: 'text-danger-500',
    iconBg: 'bg-danger-50',
    icon: '×',
  },
} as const;
