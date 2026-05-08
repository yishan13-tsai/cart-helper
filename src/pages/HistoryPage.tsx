import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useHistoryStore } from '../store/history';
import { useBaseCurrency } from '../hooks/useBaseCurrency';
import { RoundButton } from '../components/RoundButton';
import { Pill } from '../components/Pill';
import { Btn } from '../components/Btn';
import { TIcon } from '../components/TIcon';
import { StackIllus } from '../components/illustrations';
import { currencySymbol, formatAmount } from '../lib/format';
import type { HistoryEntry } from '../types';

// ── date helpers ────────────────────────────────────────────────────────────

interface DateLabel {
  kind: 'today' | 'yesterday' | 'date';
  month?: string; // e.g. "04"
  day?: string;   // e.g. "29"
}

function classifyDate(ts: number): DateLabel {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 86_400_000;

  if (ts >= todayStart) return { kind: 'today' };
  if (ts >= yesterdayStart) return { kind: 'yesterday' };

  const d = new Date(ts);
  return {
    kind: 'date',
    month: String(d.getMonth() + 1).padStart(2, '0'),
    day: String(d.getDate()).padStart(2, '0'),
  };
}

// ── DateSquare ───────────────────────────────────────────────────────────────

function DateSquare({ ts }: { ts: number }) {
  const { t } = useTranslation();
  const label = classifyDate(ts);

  return (
    <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-[14px] bg-surface">
      {label.kind === 'today' && (
        <span className="text-xs font-bold text-ink leading-none">{t('history.dateLabel.today' as any)}</span>
      )}
      {label.kind === 'yesterday' && (
        <span className="text-xs font-bold text-ink leading-none">{t('history.dateLabel.yesterday' as any)}</span>
      )}
      {label.kind === 'date' && (
        <>
          <span className="text-[9px] font-bold text-ink-60 leading-none">{label.month}</span>
          <span className="font-num text-sm font-extrabold text-ink leading-none mt-0.5">{label.day}</span>
        </>
      )}
    </div>
  );
}

// ── TripRow ──────────────────────────────────────────────────────────────────

function TripRow({ entry }: { entry: HistoryEntry }) {
  const { t, i18n } = useTranslation();
  const { cart, comparison } = entry;
  const ts = cart.startedAt ?? entry.savedAt;

  const storeName = cart.store ?? t('history.entry.defaultStore');
  const itemCount = cart.items.length;
  const total = cart.total;
  const sym = currencySymbol(cart.currency);

  // Pill + diff
  let pillTone: 'success' | 'alert' | 'neutral' = 'neutral';
  let pillLabel: string;
  let diffDisplay: string | null = null;
  let diffColor: string = '';

  if (!comparison) {
    pillTone = 'neutral';
    pillLabel = t('history.entry.noComparison');
  } else {
    const diff = comparison.difference;
    if (Math.abs(diff) < 0.01) {
      pillTone = 'success';
      pillLabel = t('comparison.differenceMatch');
    } else {
      pillTone = 'alert';
      pillLabel = diff > 0 ? t('history.entry.diff') : t('history.entry.saved');
    }

    if (Math.abs(diff) >= 0.01) {
      const sign = diff > 0 ? '+' : '−';
      diffDisplay = `${sign}${sym}${formatAmount(Math.abs(diff), i18n.language)}`;
      diffColor = diff > 0 ? 'text-alert' : 'text-success';
    }
  }

  return (
    <Link
      to={`/receipt/comparison/${entry.id}`}
      className="flex items-center gap-3 rounded-[18px] bg-white p-3.5 shadow-card transition active:scale-[0.99]"
    >
      <DateSquare ts={ts} />

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-bold text-ink">{storeName}</div>
        <div className="mt-0.5 text-[11px] text-ink-60">
          {t('cart.items_count', { n: itemCount })} · {sym}{formatAmount(total, i18n.language)}
        </div>
      </div>

      <div className="flex flex-col items-end gap-1">
        <Pill tone={pillTone}>{pillLabel}</Pill>
        {diffDisplay && (
          <span className={`font-num text-xs font-bold ${diffColor}`}>{diffDisplay}</span>
        )}
      </div>
    </Link>
  );
}

// ── Hero card ────────────────────────────────────────────────────────────────

function HeroCard({ entries }: { entries: HistoryEntry[] }) {
  const { t, i18n } = useTranslation();
  const [base] = useBaseCurrency();
  // "本月省下" = sum of (totalInCart - totalOnReceipt) where the cart was cheaper.
  // Only sums trips whose cart currency matches the user's base currency —
  // cross-currency aggregation would need live FX, which is overkill for the
  // hero. Mismatched trips still count toward tripCount/diffCount.
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  let saved = 0;
  let tripCount = 0;
  let diffCount = 0;

  for (const e of entries) {
    const ts = e.cart.startedAt ?? e.savedAt;
    if (ts < monthStart) continue;
    tripCount++;
    if (e.comparison) {
      const d = e.comparison.difference;
      if (d < 0 && e.cart.currency === base) saved += Math.abs(d);
      if (Math.abs(d) >= 0.01) diffCount++;
    }
  }

  const sym = currencySymbol(base);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-surface p-4 flex items-center gap-3.5">
      <StackIllus size={88} />
      <div className="flex-1">
        <div className="text-[11px] font-semibold text-ink-60">{t('history.heroSavedThisMonth' as any)}</div>
        <div className="font-num text-[28px] font-extrabold text-page leading-tight tracking-tight">
          <span className="text-sm opacity-70">{sym}</span>
          {formatAmount(Math.round(saved), i18n.language)}
        </div>
        <div className="mt-1 text-[11px] text-ink-60">
          {t('history.heroSubline' as any, { tripCount, diffCount })}
        </div>
      </div>
    </div>
  );
}

// ── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-8 pt-20 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface text-page">
        <TIcon name="history" size={36} strokeWidth={1.6} />
      </div>
      <div>
        <h2 className="text-lg font-bold text-ink">{t('history.empty.title')}</h2>
        <p className="mt-1.5 max-w-xs text-sm text-ink-60">{t('history.empty.subtitle')}</p>
      </div>
      <Link to="/scan" className="w-full max-w-xs">
        <Btn icon="scan">{t('history.empty.cta')}</Btn>
      </Link>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function HistoryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const entries = useHistoryStore((s) => s.entries);

  return (
    <div className="relative flex min-h-full flex-col bg-bg">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <RoundButton icon="chevL" onClick={() => navigate(-1)} aria-label={t('common.back')} />
        <span className="text-[11px] font-bold tracking-[4px] text-ink-60 uppercase">
          CART HELPER
        </span>
        <RoundButton icon="calendar" aria-label={t('common.calendar')} />
      </div>

      {entries.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-3 px-5 pb-24 pt-3">
          {/* Hero */}
          <HeroCard entries={entries} />

          {/* Section label */}
          <div className="mt-1 text-[10px] font-bold uppercase tracking-wide text-ink-60">
            {t('history.title' as any)}
          </div>

          {/* Trip list */}
          <div className="flex flex-col gap-2">
            {entries.map((entry) => (
              <TripRow key={entry.id} entry={entry} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
