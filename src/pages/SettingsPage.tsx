import { useTranslation } from 'react-i18next';
import { LocaleSwitcher } from '../components/LocaleSwitcher';
import { useBaseCurrency } from '../hooks/useBaseCurrency';
import { useCartStore } from '../store/cart';
import { useHistoryStore } from '../store/history';
import type { Currency } from '../types';

const CURRENCY_OPTIONS: Currency[] = ['TWD', 'USD', 'JPY', 'KRW'];
const APP_VERSION = '0.1.0';

export function SettingsPage() {
  const { t, i18n } = useTranslation();
  const [base, setBase] = useBaseCurrency();
  const clearCart = useCartStore((s) => s.clear);
  const cartItemCount = useCartStore((s) => s.items.length);
  const clearHistory = useHistoryStore((s) => s.clear);
  const historyCount = useHistoryStore((s) => s.entries.length);

  const onCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBase(e.target.value);
  };

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
    <section className="space-y-4 px-4 pb-24 pt-4">
      {/* Language */}
      <div className="card p-4">
        <p className="section-label mb-3">{t('settings.locale.label')}</p>
        <LocaleSwitcher />
      </div>

      {/* Currency */}
      <div className="card p-4">
        <label htmlFor="base-currency" className="section-label mb-3 block">
          {t('settings.currency.label')}
        </label>
        <select
          id="base-currency"
          value={base}
          onChange={onCurrencyChange}
          className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-base font-medium text-neutral-900 focus:border-primary-500 focus:bg-neutral-0 focus:outline-none focus:ring-2 focus:ring-primary-100"
        >
          {CURRENCY_OPTIONS.map((code) => (
            <option key={code} value={code}>
              {currencyLabel(code, i18n.language)}
            </option>
          ))}
        </select>
        <p className="mt-2 text-xs text-neutral-400">{t('settings.currency.hint')}</p>
      </div>

      {/* Danger Zone */}
      <div className="card overflow-hidden border-l-4 border-danger-500">
        <p className="section-label px-4 pb-2 pt-3 text-danger-500">
          {t('settings.danger.label')}
        </p>
        <div className="space-y-2 px-4 pb-4">
          <button
            type="button"
            onClick={onClearCart}
            disabled={cartItemCount === 0}
            className="w-full rounded-xl border border-danger-500 bg-neutral-0 px-4 py-2.5 text-sm font-bold text-danger-500 transition active:scale-[0.98] active:bg-danger-50 disabled:border-neutral-200 disabled:text-neutral-400"
          >
            {t('settings.clearCart.label', { n: cartItemCount })}
          </button>
          <button
            type="button"
            onClick={onClearHistory}
            disabled={historyCount === 0}
            className="w-full rounded-xl border border-danger-500 bg-neutral-0 px-4 py-2.5 text-sm font-bold text-danger-500 transition active:scale-[0.98] active:bg-danger-50 disabled:border-neutral-200 disabled:text-neutral-400"
          >
            {t('settings.clearHistory.label', { n: historyCount })}
          </button>
        </div>
      </div>

      {/* Footer credit */}
      <div className="pt-4 text-center text-2xs text-neutral-400">
        <p className="font-medium">{t('app.name')} v{APP_VERSION}</p>
        <p className="mt-1">
          Powered by{' '}
          <a
            href="https://vaultsage.ai"
            className="font-medium text-primary-500 hover:text-primary-700"
            target="_blank"
            rel="noreferrer"
          >
            VaultSage
          </a>
          <span className="mx-1.5 text-neutral-200">·</span>
          <span className="font-mono">#vaultsage</span>
        </p>
      </div>
    </section>
  );
}

function currencyLabel(code: Currency, locale: string): string {
  try {
    const display = new Intl.DisplayNames([locale], { type: 'currency' });
    const name = display.of(code);
    return name ? `${code} — ${name}` : code;
  } catch {
    return code;
  }
}
