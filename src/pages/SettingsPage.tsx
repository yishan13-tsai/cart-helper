import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { RoundButton } from '../components/RoundButton';
import { TIcon, type TIconName } from '../components/TIcon';
import { LocaleSwitcher } from '../components/LocaleSwitcher';
import { useBaseCurrency } from '../hooks/useBaseCurrency';
import { useBudget } from '../hooks/useBudget';
import { useTheme, THEMES, THEME_ACCENTS } from '../hooks/useTheme';
import { useCartStore } from '../store/cart';
import { useHistoryStore } from '../store/history';
import type { Currency } from '../types';

const CURRENCY_OPTIONS: Currency[] = ['TWD', 'USD', 'JPY', 'KRW'];
const APP_VERSION = '0.1.0';

// ── Cosmetic toggle (v1, no interactive state) ───────────────────────────────
function Toggle({ on }: { on: boolean }) {
  return (
    <div
      className={`flex h-6 w-[42px] shrink-0 items-center rounded-full p-[2px] transition-colors ${
        on ? 'bg-page justify-end' : 'bg-ink-10 justify-start'
      }`}
    >
      <div className="h-5 w-5 rounded-full bg-white shadow-sm" />
    </div>
  );
}

// ── Section container ────────────────────────────────────────────────────────
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="px-1.5 pb-1.5 text-[11px] font-bold uppercase tracking-[0.5px] text-ink-60">
        {label}
      </div>
      <div className="overflow-hidden rounded-[18px] bg-white">{children}</div>
    </div>
  );
}

// ── Single settings row ──────────────────────────────────────────────────────
interface RowProps {
  icon: TIconName;
  label: string;
  sub?: string;
  /** Right-side value text / node. Show with chev if provided. */
  value?: React.ReactNode;
  /** Cosmetic toggle. */
  toggle?: boolean;
  /** Skip the top border (first row in a section). */
  first?: boolean;
  /** Red label colour for danger actions. */
  danger?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  /** Expanded content rendered below the row (e.g. inline input). */
  children?: React.ReactNode;
}

function RowInner({
  icon, label, sub, value, toggle, danger,
}: Pick<RowProps, 'icon' | 'label' | 'sub' | 'value' | 'toggle' | 'danger'>) {
  return (
    <>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-surface text-page">
        <TIcon name={icon} size={16} strokeWidth={1.8} />
      </div>
      <div className="min-w-0 flex-1">
        <div className={`text-[13px] font-semibold leading-tight ${danger ? 'text-alert' : 'text-ink'}`}>
          {label}
        </div>
        {sub && <div className="mt-0.5 text-[11px] leading-tight text-ink-60">{sub}</div>}
      </div>
      {value !== undefined && (
        <div className="flex shrink-0 items-center gap-1 text-[12px] text-ink-60">
          {value}
          <TIcon name="chev" size={12} className="text-ink-30" />
        </div>
      )}
      {toggle !== undefined && <Toggle on={toggle} />}
    </>
  );
}

function Row({ icon, label, sub, value, toggle, first, danger, onClick, disabled, children }: RowProps) {
  const baseClass = `flex w-full items-center gap-3 px-3.5 py-3 text-left${first ? '' : ' border-t border-ink/10'}`;

  return (
    <>
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          className={`${baseClass} transition-colors${disabled ? ' cursor-not-allowed opacity-40' : ' cursor-pointer active:bg-ink-10/40'}`}
        >
          <RowInner icon={icon} label={label} sub={sub} value={value} toggle={toggle} danger={danger} />
        </button>
      ) : (
        <div className={baseClass}>
          <RowInner icon={icon} label={label} sub={sub} value={value} toggle={toggle} danger={danger} />
        </div>
      )}
      {children && (
        <div className="border-t border-ink/10 px-3.5 pb-3 pt-2">{children}</div>
      )}
    </>
  );
}

// ── Currency label helper ────────────────────────────────────────────────────
function currencyLabel(code: Currency, locale: string): string {
  try {
    const display = new Intl.DisplayNames([locale], { type: 'currency' });
    const name = display.of(code);
    return name ? `${code} — ${name}` : code;
  } catch {
    return code;
  }
}

// ── Page ─────────────────────────────────────────────────────────────────────
export function SettingsPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [base, setBase] = useBaseCurrency();
  const [budget, setBudget] = useBudget();
  const [theme, setTheme] = useTheme();
  const clearCart = useCartStore((s) => s.clear);
  const cartItemCount = useCartStore((s) => s.items.length);
  const clearHistory = useHistoryStore((s) => s.clear);
  const historyCount = useHistoryStore((s) => s.entries.length);

  const onClearCart = () => {
    if (cartItemCount === 0) return;
    if (window.confirm(t('settings.clearCart.confirm', { n: cartItemCount }))) {
      clearCart();
    }
  };

  const onClearHistory = () => {
    if (historyCount === 0) return;
    if (window.confirm(t('settings.clearHistory.confirm', { n: historyCount }))) {
      clearHistory();
    }
  };

  return (
    <div className="min-h-screen bg-bg pb-32 text-ink">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <RoundButton icon="chevL" onClick={() => navigate(-1)} aria-label="返回" />
        {/* right placeholder keeps header balanced */}
        <div className="h-9 w-9" />
      </div>

      {/* Page heading */}
      <div className="px-5 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          {t('nav.settings')}
        </h1>
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-3.5 px-5">

        {/* 1. 掃描偏好 */}
        <Section label={t('settings.scan.label')}>
          <Row
            icon="tag"
            label={t('settings.budget.label')}
            sub={t('settings.budget.sub')}
            first
          >
            <input
              id="trip-budget"
              type="number"
              inputMode="numeric"
              min={0}
              value={budget ?? ''}
              onChange={(e) => {
                const v = e.target.value.trim();
                setBudget(v === '' ? null : Number(v));
              }}
              placeholder={t('settings.budget.placeholder')}
              className="w-full rounded-xl border border-ink-10 bg-bg px-3 py-2 text-sm font-medium text-ink placeholder:text-ink-30 focus:border-page/40 focus:outline-none focus:ring-2 focus:ring-page/20"
            />
          </Row>
          <Row
            icon="bolt"
            label={t('settings.autoScan.label')}
            sub={t('settings.autoScan.sub')}
            toggle={true}
          />
        </Section>

        {/* 2. 購物 */}
        <Section label={t('settings.shopping.label')}>
          <Row
            icon="bell"
            label={t('settings.budgetAlert.label')}
            toggle={true}
            first
          />
          {/* Currency — current value displayed, native select expanded below */}
          <Row
            icon="lang"
            label={t('settings.currency.label')}
            value={currencyLabel(base as Currency, i18n.language)}
          >
            <select
              id="base-currency"
              value={base}
              onChange={(e) => setBase(e.target.value)}
              className="w-full rounded-xl border border-ink-10 bg-bg px-3 py-2 text-sm font-medium text-ink focus:border-page/40 focus:outline-none focus:ring-2 focus:ring-page/20"
            >
              {CURRENCY_OPTIONS.map((code) => (
                <option key={code} value={code}>
                  {currencyLabel(code, i18n.language)}
                </option>
              ))}
            </select>
          </Row>
          {/* Language — current locale shown, LocaleSwitcher pills expanded below */}
          <Row
            icon="lang"
            label={t('settings.locale.label')}
            value={i18n.resolvedLanguage ?? i18n.language}
          >
            <LocaleSwitcher />
          </Row>
        </Section>

        {/* 3. 外觀 */}
        <Section label={t('settings.appearance.label')}>
          <Row icon="sparkle" label={t('settings.theme.label')} first>
            <div className="flex flex-wrap gap-2.5 pt-1">
              {THEMES.map((th) => (
                <button
                  key={th}
                  type="button"
                  onClick={() => setTheme(th)}
                  aria-label={th}
                  aria-pressed={theme === th}
                  className="relative h-8 w-8 rounded-full transition-transform active:scale-90"
                  style={{ backgroundColor: THEME_ACCENTS[th] }}
                >
                  {theme === th && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <TIcon name="check" size={16} strokeWidth={2.5} className="text-white" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </Row>
        </Section>

        {/* 4. 關於 */}
        <Section label={t('settings.about.label')}>
          <Row
            icon="info"
            label={t('settings.guide.label')}
            value={<span />}
            first
          />
          <Row
            icon="eye"
            label={t('settings.privacy.label')}
            value={<span />}
          />
          <Row
            icon="sparkle"
            label="Powered by VaultSage"
            value={<span className="font-mono">#vaultsage</span>}
          />
        </Section>

        {/* 5. 危險區 */}
        <Section label={t('settings.danger.label')}>
          <Row
            icon="trash"
            label={t('settings.clearCart.label', { n: cartItemCount })}
            danger
            onClick={onClearCart}
            disabled={cartItemCount === 0}
            first
          />
          <Row
            icon="trash"
            label={t('settings.clearHistory.label', { n: historyCount })}
            danger
            onClick={onClearHistory}
            disabled={historyCount === 0}
          />
        </Section>

        {/* Footer */}
        <p className="py-2 text-center font-mono text-[11px] text-ink-30">
          Cart Helper · v{APP_VERSION}
        </p>
      </div>
    </div>
  );
}
