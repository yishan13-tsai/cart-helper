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
    <section className="space-y-6 p-4 pb-8">
      <h2 className="text-xl font-bold text-secondary-500">{t('nav.settings')}</h2>

      <div className="space-y-2">
        <p className="text-sm font-bold text-neutral-700">{t('settings.locale.label')}</p>
        <LocaleSwitcher />
      </div>

      <div className="space-y-2">
        <label htmlFor="base-currency" className="text-sm font-bold text-neutral-700">
          {t('settings.currency.label')}
        </label>
        <select
          id="base-currency"
          value={base}
          onChange={onCurrencyChange}
          className="w-full rounded-lg border border-neutral-100 bg-neutral-0 px-3 py-2 text-base text-neutral-900 focus:border-primary-500 focus:outline-none"
        >
          {CURRENCY_OPTIONS.map((code) => (
            <option key={code} value={code}>
              {currencyLabel(code, i18n.language)}
            </option>
          ))}
        </select>
        <p className="text-xs text-neutral-400">{t('settings.currency.hint')}</p>
      </div>

      <div className="space-y-3 border-t border-neutral-100 pt-6">
        <p className="text-sm font-bold text-neutral-700">{t('settings.danger.label')}</p>
        <button
          type="button"
          onClick={onClearCart}
          disabled={cartItemCount === 0}
          className="w-full rounded-lg border border-danger-500 px-4 py-2 text-sm font-bold text-danger-500 disabled:border-neutral-100 disabled:text-neutral-400"
        >
          {t('settings.clearCart.label', { n: cartItemCount })}
        </button>
        <button
          type="button"
          onClick={onClearHistory}
          disabled={historyCount === 0}
          className="w-full rounded-lg border border-danger-500 px-4 py-2 text-sm font-bold text-danger-500 disabled:border-neutral-100 disabled:text-neutral-400"
        >
          {t('settings.clearHistory.label', { n: historyCount })}
        </button>
      </div>

      <div className="border-t border-neutral-100 pt-6 text-center text-xs text-neutral-400">
        <p>
          {t('app.name')} v{APP_VERSION}
        </p>
        <p className="mt-1">
          Powered by{' '}
          <a
            href="https://vaultsage.ai"
            className="text-primary-500"
            target="_blank"
            rel="noreferrer"
          >
            VaultSage
          </a>{' '}
          · #vaultsage
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
