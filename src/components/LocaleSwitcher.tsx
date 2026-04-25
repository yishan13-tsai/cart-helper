import { useTranslation } from 'react-i18next';
import {
  LOCALE_LABELS,
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from '../i18n/resources';

interface Props {
  variant?: 'buttons' | 'select';
}

export function LocaleSwitcher({ variant = 'buttons' }: Props) {
  const { i18n, t } = useTranslation();
  const current = (i18n.resolvedLanguage ?? i18n.language) as SupportedLocale;

  function pick(next: SupportedLocale) {
    if (next === current) return;
    void i18n.changeLanguage(next);
  }

  if (variant === 'select') {
    return (
      <label className="flex items-center gap-2 text-sm text-neutral-700">
        <span>{t('settings.locale.label')}</span>
        <select
          className="rounded-md border border-neutral-100 bg-neutral-100 px-2 py-1 text-sm"
          value={current}
          onChange={(e) => pick(e.target.value as SupportedLocale)}
        >
          {SUPPORTED_LOCALES.map((code) => (
            <option key={code} value={code}>
              {LOCALE_LABELS[code]}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <div
      role="group"
      aria-label={t('settings.locale.label')}
      className="inline-flex flex-wrap gap-2"
    >
      {SUPPORTED_LOCALES.map((code) => {
        const active = code === current;
        return (
          <button
            key={code}
            type="button"
            onClick={() => pick(code)}
            aria-pressed={active}
            className={`rounded-full px-3 py-1.5 text-sm transition ${
              active
                ? 'bg-primary-500 text-neutral-0 font-bold'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-100/70'
            }`}
          >
            {LOCALE_LABELS[code]}
          </button>
        );
      })}
    </div>
  );
}
