import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useHistoryStore } from '../store/history';
import { currencySymbol } from '../lib/format';
import type { HistoryEntry } from '../types';

export function HistoryPage() {
  const { t, i18n } = useTranslation();
  const entries = useHistoryStore((s) => s.entries);

  if (entries.length === 0) {
    return (
      <section className="flex h-full flex-col items-center justify-center p-8 text-center">
        <h2 className="text-xl font-bold text-secondary-500">
          {t('history.empty.title')}
        </h2>
        <p className="mt-2 text-sm text-neutral-700">{t('history.empty.subtitle')}</p>
        <Link
          to="/"
          className="mt-6 rounded-lg bg-primary-500 px-6 py-3 text-sm font-bold text-neutral-0"
        >
          {t('history.empty.cta')}
        </Link>
      </section>
    );
  }

  const groups = groupByDate(entries, i18n.language);

  return (
    <section className="space-y-6 p-4 pb-8">
      <h2 className="text-xl font-bold text-secondary-500">{t('nav.history')}</h2>
      {groups.map((group) => (
        <div key={group.label} className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wide text-neutral-400">
            {group.label}
          </h3>
          <ul className="space-y-2">
            {group.entries.map((entry) => (
              <HistoryRow key={entry.id} entry={entry} locale={i18n.language} />
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

function HistoryRow({ entry, locale }: { entry: HistoryEntry; locale: string }) {
  const { t } = useTranslation();
  const time = new Date(entry.savedAt).toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
  const symbol = currencySymbol(entry.cart.currency);
  const total = formatNumber(entry.cart.total, locale);
  const itemCount = entry.cart.items.length;
  const diff = entry.comparison?.difference;

  return (
    <li>
      <Link
        to={`/receipt/comparison/${entry.id}`}
        className="block rounded-lg border border-neutral-100 bg-neutral-0 p-3"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-400">{time}</span>
          <span className="font-mono text-base font-bold text-secondary-500">
            {symbol}
            {total}
          </span>
        </div>
        <div className="mt-1 flex items-center justify-between text-xs text-neutral-700">
          <span>{t('cart.items_count', { n: itemCount })}</span>
          {entry.comparison ? (
            <DiffBadge diff={diff ?? 0} symbol={symbol} locale={locale} />
          ) : (
            <span className="text-neutral-400">{t('history.entry.noComparison')}</span>
          )}
        </div>
      </Link>
    </li>
  );
}

function DiffBadge({
  diff,
  symbol,
  locale,
}: {
  diff: number;
  symbol: string;
  locale: string;
}) {
  const { t } = useTranslation();
  if (Math.abs(diff) < 0.01) {
    return <span className="text-success-500">{t('comparison.differenceMatch')}</span>;
  }
  const sign = diff > 0 ? '+' : '−';
  const abs = formatNumber(Math.abs(diff), locale);
  return (
    <span className="text-warning-500">
      {sign}
      {symbol}
      {abs}
    </span>
  );
}

interface Group {
  label: string;
  entries: HistoryEntry[];
}

function groupByDate(entries: HistoryEntry[], locale: string): Group[] {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 86_400_000;
  const startOfWeek = startOfToday - 6 * 86_400_000;

  const today: HistoryEntry[] = [];
  const yesterday: HistoryEntry[] = [];
  const thisWeek: HistoryEntry[] = [];
  const older: Record<string, HistoryEntry[]> = {};

  for (const e of entries) {
    if (e.savedAt >= startOfToday) today.push(e);
    else if (e.savedAt >= startOfYesterday) yesterday.push(e);
    else if (e.savedAt >= startOfWeek) thisWeek.push(e);
    else {
      const date = new Date(e.savedAt).toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
      });
      (older[date] ??= []).push(e);
    }
  }

  const labels = i18nLabels(locale);
  const groups: Group[] = [];
  if (today.length) groups.push({ label: labels.today, entries: today });
  if (yesterday.length) groups.push({ label: labels.yesterday, entries: yesterday });
  if (thisWeek.length) groups.push({ label: labels.thisWeek, entries: thisWeek });
  for (const date of Object.keys(older)) {
    groups.push({ label: date, entries: older[date] });
  }
  return groups;
}

function i18nLabels(locale: string): { today: string; yesterday: string; thisWeek: string } {
  const map: Record<string, { today: string; yesterday: string; thisWeek: string }> = {
    'zh-TW': { today: '今天', yesterday: '昨天', thisWeek: '本週' },
    en: { today: 'Today', yesterday: 'Yesterday', thisWeek: 'This week' },
    ko: { today: '오늘', yesterday: '어제', thisWeek: '이번 주' },
    ja: { today: '今日', yesterday: '昨日', thisWeek: '今週' },
  };
  const code = locale in map ? locale : (locale.split('-')[0] ?? 'en');
  return map[code] ?? map.en;
}

function formatNumber(n: number, locale: string): string {
  try {
    return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(n);
  } catch {
    return String(Math.round(n));
  }
}
